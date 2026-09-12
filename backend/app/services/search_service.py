import copy
import hashlib
import json
import math
import re
import time
from typing import Any


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    r = 6371.0  # Earth's radius in kilometers
    dlat_val = math.radians(lat2 - lat1)
    dlon_val = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat_val / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon_val / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)


def compute_token_overlap(query_text: str, target_text: str) -> float:
    """Computes token overlap ratio and substring matching between query string and target string."""
    if not query_text or not target_text:
        return 0.0
    q_str = str(query_text).strip().lower()
    t_str = str(target_text).strip().lower()

    if not q_str or not t_str:
        return 0.0

    # Direct substring match boost
    if q_str in t_str:
        return max(0.85, len(q_str) / max(1, len(t_str)))

    q_tokens = set(re.findall(r"\w+", q_str))
    t_tokens = set(re.findall(r"\w+", t_str))
    if not q_tokens or not t_tokens:
        return 0.0

    matched_count = 0.0
    for q_tok in q_tokens:
        if q_tok in t_tokens:
            matched_count += 1.0
        elif any(q_tok in t_tok or t_tok in q_tok for t_tok in t_tokens if len(q_tok) >= 3):
            matched_count += 0.8

    return matched_count / len(q_tokens)


class CacheManager:
    """High-performance In-Memory Redis-compatible Cache Manager with TTL."""

    _cache: dict[str, tuple[float, Any]] = {}

    @classmethod
    def get(cls, key: str, ttl_seconds: int = 300) -> Any | None:
        if key in cls._cache:
            timestamp, data = cls._cache[key]
            if time.time() - timestamp < ttl_seconds:
                return copy.deepcopy(data)
            else:
                del cls._cache[key]
        return None

    @classmethod
    def set(cls, key: str, value: Any) -> None:
        cls._cache[key] = (time.time(), copy.deepcopy(value))

    @classmethod
    def clear(cls) -> None:
        cls._cache.clear()

    @classmethod
    def generate_key(cls, params: dict[str, Any]) -> str:
        param_str = json.dumps(params, sort_keys=True, default=str)
        return hashlib.md5(param_str.encode("utf-8")).hexdigest()


class SearchService:
    """Multi-Attribute Search, PostGIS Spatial Discovery & Weighted Ranking Engine."""

    @classmethod
    def search_destinations(
        cls,
        q: str | None = None,
        activity: str | None = None,
        category: str | None = None,
        district: str | None = None,
        province: str | None = None,
        crowd_level: str | None = None,
        max_cost: float | None = None,
        min_cost: float | None = None,
        min_rating: float | None = None,
        lat: float | None = None,
        lng: float | None = None,
        radius_km: float | None = None,
        limit: int = 20,
        offset: int = 0,
        dataset: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        start_time = time.time()

        # Build deterministic cache key
        cache_params = {
            "q": q,
            "activity": activity,
            "category": category,
            "district": district,
            "province": province,
            "crowd": crowd_level,
            "max_cost": max_cost,
            "min_cost": min_cost,
            "min_rating": min_rating,
            "lat": lat,
            "lng": lng,
            "radius": radius_km,
            "limit": limit,
            "offset": offset,
        }
        cache_key = CacheManager.generate_key(cache_params)

        # Check Cache
        cached_result = CacheManager.get(cache_key)
        if cached_result is not None:
            cached_result["cached"] = True
            cached_result["query_time_ms"] = round((time.time() - start_time) * 1000, 2)
            return cached_result

        items = dataset if dataset is not None else []
        filtered_items: list[dict[str, Any]] = []

        q_clean = q.strip().lower() if q and q.strip() else None
        act_clean = activity.strip().lower() if activity and activity.strip() else None
        cat_clean = (
            category.strip().lower()
            if category and category.strip() and category.lower() != "all"
            else None
        )
        dist_clean = district.strip().lower() if district and district.strip() else None
        prov_clean = province.strip().lower() if province and province.strip() else None
        crowd_clean = (
            crowd_level.strip().lower()
            if crowd_level and crowd_level.strip() and crowd_level.lower() != "all"
            else None
        )

        for item in items:
            title = str(item.get("title") or item.get("name") or "").lower()
            name = str(item.get("name") or "").lower()
            item_cat = str(item.get("category") or "").lower()
            item_dist = str(item.get("district") or "").lower()
            item_prov = str(item.get("province") or "").lower()
            item_desc = str(item.get("description") or item.get("desc") or "").lower()

            try:
                item_cost = (
                    float(item["baseline_cost"])
                    if item.get("baseline_cost") is not None
                    else 0.0
                )
            except (ValueError, TypeError):
                item_cost = 0.0

            try:
                item_rating = (
                    float(item["rating"]) if item.get("rating") is not None else 4.5
                )
            except (ValueError, TypeError):
                item_rating = 4.5

            try:
                item_pop = (
                    float(item["popularity"]) if item.get("popularity") is not None else 4.5
                )
            except (ValueError, TypeError):
                item_pop = 4.5

            activities = [
                str(a).lower() for a in (item.get("activities") or []) if a is not None
            ]

            crowd_info = item.get("crowd_info") or {}
            if isinstance(crowd_info, dict):
                density = str(crowd_info.get("density", "Moderate")).lower()
            else:
                density = str(crowd_info).lower()

            # -------------------------------------------------------------
            # Filter Checks
            # -------------------------------------------------------------
            if cat_clean and item_cat != cat_clean:
                continue

            if dist_clean and dist_clean not in item_dist:
                continue

            if prov_clean and prov_clean not in item_prov:
                continue

            if crowd_clean and crowd_clean not in density:
                continue

            if max_cost is not None and item_cost > max_cost:
                continue

            if min_cost is not None and item_cost < min_cost:
                continue

            if min_rating is not None and item_rating < min_rating:
                continue

            if act_clean and not any(act_clean in a for a in activities):
                continue

            # Spatial Distance Check (PostGIS / Haversine)
            dist_km: float | None = None
            item_lat = item.get("latitude")
            item_lng = item.get("longitude")

            if (
                lat is not None
                and lng is not None
                and item_lat is not None
                and item_lng is not None
            ):
                try:
                    dist_km = haversine_distance_km(
                        float(lat), float(lng), float(item_lat), float(item_lng)
                    )
                    if radius_km is not None and dist_km > radius_km:
                        continue
                except (ValueError, TypeError):
                    pass

            # -------------------------------------------------------------
            # Weighted Relevance Ranking Score Calculation
            # -------------------------------------------------------------
            relevance_score = 0.0

            if q_clean:
                title_match = compute_token_overlap(q_clean, title)
                name_match = compute_token_overlap(q_clean, name)
                cat_match = 1.0 if q_clean in item_cat else 0.0
                dist_match = 1.0 if q_clean in item_dist else 0.0
                prov_match = 1.0 if q_clean in item_prov else 0.0
                act_match = max(
                    [compute_token_overlap(q_clean, a) for a in activities] or [0.0]
                )
                desc_match = compute_token_overlap(q_clean, item_desc)

                if (
                    title_match == 0
                    and name_match == 0
                    and cat_match == 0
                    and dist_match == 0
                    and prov_match == 0
                    and act_match == 0
                    and desc_match == 0
                ):
                    continue  # Fails search query match

                relevance_score += (
                    (max(title_match, name_match) * 4.0)
                    + (act_match * 2.5)
                    + (dist_match * 2.0)
                    + (prov_match * 2.0)
                    + (cat_match * 1.5)
                    + (desc_match * 1.0)
                )

            # Popularity & Rating Boost
            relevance_score += (item_pop * 0.5) + (item_rating * 0.5)

            # Proximity Boost
            if dist_km is not None:
                proximity_boost = max(0.0, 3.0 - (dist_km / 10.0))
                relevance_score += proximity_boost

            # Attach distance_km and search_relevance to item
            formatted_item = dict(item)
            if dist_km is not None:
                formatted_item["distance_km"] = dist_km
                formatted_item["distance"] = f"{dist_km} km away"
                formatted_item["distance_from_colombo"] = f"{dist_km} km away"

            formatted_item["relevance_score"] = round(relevance_score, 2)
            filtered_items.append(formatted_item)

        # Sort filtered items by relevance score descending
        filtered_items.sort(
            key=lambda x: (
                float(x.get("relevance_score") or 0.0),
                float(x.get("rating") or 0.0),
                float(x.get("popularity") or 0.0),
            ),
            reverse=True,
        )

        total_count = len(filtered_items)

        # Pagination
        paginated_items = filtered_items[offset : offset + limit]

        response_payload = {
            "destinations": paginated_items,
            "total": total_count,
            "page": (offset // limit) + 1 if limit > 0 else 1,
            "limit": limit,
            "cached": False,
            "query_time_ms": round((time.time() - start_time) * 1000, 2),
        }

        # Store in cache
        CacheManager.set(cache_key, response_payload)

        return response_payload
