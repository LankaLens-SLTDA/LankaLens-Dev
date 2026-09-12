import math
import time
from typing import Any

from app.services.search_service import haversine_distance_km

SEED_PARTNER_LOCATIONS: list[dict[str, Any]] = [
    {
        "id": 101,
        "name": "Sigiriya Eco-Tuk Transport Co-op",
        "type": "Transport Co-op",
        "latitude": 7.9520,
        "longitude": 80.7550,
        "rating": 4.9,
        "contact": "+94 66 223 1144",
        "verified": True,
        "associated_destination_id": 1,
    },
    {
        "id": 102,
        "name": "Central Province SLTDA Heritage Guides Guild",
        "type": "Eco-Guide",
        "latitude": 7.9585,
        "longitude": 80.7620,
        "rating": 4.95,
        "contact": "+94 77 988 2341",
        "verified": True,
        "associated_destination_id": 1,
    },
    {
        "id": 103,
        "name": "Ella Mountain Guides & Hiking Collective",
        "type": "Eco-Guide",
        "latitude": 6.8720,
        "longitude": 81.0550,
        "rating": 4.88,
        "contact": "+94 57 443 9090",
        "verified": True,
        "associated_destination_id": 2,
    },
    {
        "id": 104,
        "name": "Demodara Tea Estate Organic Homestay",
        "type": "Authentic Homestay",
        "latitude": 6.8810,
        "longitude": 81.0650,
        "rating": 4.92,
        "contact": "+94 71 556 1234",
        "verified": True,
        "associated_destination_id": 2,
    },
    {
        "id": 105,
        "name": "Mirissa Ethical Whale Conservation & Marine Tour Co-op",
        "type": "Eco-Guide",
        "latitude": 5.9450,
        "longitude": 80.4520,
        "rating": 4.96,
        "contact": "+94 41 225 9988",
        "verified": True,
        "associated_destination_id": 3,
    },
    {
        "id": 106,
        "name": "Southern Coast Certified Surf Gear & Safety Co",
        "type": "Certified Gear",
        "latitude": 5.9510,
        "longitude": 80.4610,
        "rating": 4.85,
        "contact": "+94 76 112 3344",
        "verified": True,
        "associated_destination_id": 3,
    },
]


class MapDiscoveryService:
    """Service handling Mapbox visual spatial discovery, clustering, alternatives, and partners."""

    @classmethod
    def get_viewport_discovery(
        cls,
        min_lat: float = 5.0,
        min_lng: float = 79.0,
        max_lat: float = 10.0,
        max_lng: float = 82.0,
        zoom: float = 7.5,
        selected_dest_id: int | None = None,
        include_partners: bool = True,
        dataset: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        start_time = time.time()
        items = dataset if dataset is not None else []

        viewport_destinations: list[dict[str, Any]] = []

        # 1. Bounding Box Filter
        for item in items:
            lat = item.get("latitude")
            lng = item.get("longitude")

            if lat is not None and lng is not None:
                if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                    viewport_destinations.append(item)

        # 2. Marker Clustering Logic based on Map Zoom
        clusters: list[dict[str, Any]] = []
        if zoom < 10.0 and len(viewport_destinations) > 2:
            # Spatial grid size decreases as zoom increases
            grid_size = 1.0 if zoom < 8.0 else 0.5
            grid_map: dict[str, list[dict[str, Any]]] = {}

            for dest in viewport_destinations:
                grid_x = math.floor(dest["longitude"] / grid_size)
                grid_y = math.floor(dest["latitude"] / grid_size)
                cell_key = f"cell_{grid_x}_{grid_y}"

                if cell_key not in grid_map:
                    grid_map[cell_key] = []
                grid_map[cell_key].append(dest)

            cluster_idx = 1
            for _cell_key, points in grid_map.items():
                if len(points) >= 2:
                    avg_lat = round(sum(p["latitude"] for p in points) / len(points), 4)
                    avg_lng = round(
                        sum(p["longitude"] for p in points) / len(points), 4
                    )

                    cat_counts: dict[str, int] = {}
                    dest_ids: list[int] = []

                    for p in points:
                        cat = str(p.get("category", "nature")).lower()
                        cat_counts[cat] = cat_counts.get(cat, 0) + 1
                        if p.get("id"):
                            dest_ids.append(p["id"])

                    clusters.append(
                        {
                            "cluster_id": f"cluster_{cluster_idx}",
                            "latitude": avg_lat,
                            "longitude": avg_lng,
                            "point_count": len(points),
                            "category_distribution": cat_counts,
                            "destination_ids": dest_ids,
                        }
                    )
                    cluster_idx += 1

        # 3. Recommended Alternatives Engine
        recommended_alternatives: list[dict[str, Any]] = []
        target_dest = None

        if selected_dest_id is not None:
            target_dest = next(
                (d for d in items if d.get("id") == selected_dest_id), None
            )

        if not target_dest and viewport_destinations:
            target_dest = viewport_destinations[0]

        if target_dest:
            target_cat = str(target_dest.get("category", "")).lower()
            target_dist = str(target_dest.get("district", "")).lower()
            target_id = target_dest.get("id")

            scored_candidates: list[tuple[float, dict[str, Any]]] = []

            for d in items:
                if d.get("id") == target_id:
                    continue

                sim_score = 0.0
                d_cat = str(d.get("category", "")).lower()
                d_dist = str(d.get("district", "")).lower()

                if d_cat == target_cat:
                    sim_score += 4.0
                if d_dist == target_dist:
                    sim_score += 3.0

                sim_score += float(d.get("rating", 4.5)) * 1.5

                # Proximity calculation
                if (
                    d.get("latitude") is not None
                    and d.get("longitude") is not None
                    and target_dest.get("latitude") is not None
                    and target_dest.get("longitude") is not None
                ):
                    dist = haversine_distance_km(
                        target_dest["latitude"],
                        target_dest["longitude"],
                        d["latitude"],
                        d["longitude"],
                    )
                    d_copy = dict(d)
                    d_copy["distance_km"] = dist
                    d_copy["distance"] = f"{dist} km away"
                    prox_score = max(0.0, 5.0 - (dist / 20.0))
                    sim_score += prox_score

                    scored_candidates.append((sim_score, d_copy))
                else:
                    scored_candidates.append((sim_score, dict(d)))

            scored_candidates.sort(key=lambda x: x[0], reverse=True)
            recommended_alternatives = [c[1] for c in scored_candidates[:3]]

        # 4. Local Partner Locations Layer
        partner_locations: list[dict[str, Any]] = []
        if include_partners:
            for p in SEED_PARTNER_LOCATIONS:
                p_lat = p["latitude"]
                p_lng = p["longitude"]
                if min_lat <= p_lat <= max_lat and min_lng <= p_lng <= max_lng:
                    partner_locations.append(p)

        query_time = round((time.time() - start_time) * 1000, 2)

        return {
            "destinations": viewport_destinations,
            "clusters": clusters,
            "total_in_viewport": len(viewport_destinations),
            "recommended_alternatives": recommended_alternatives,
            "partner_locations": partner_locations,
            "viewport_bounds": {
                "min_lat": min_lat,
                "min_lng": min_lng,
                "max_lat": max_lat,
                "max_lng": max_lng,
            },
            "query_time_ms": query_time,
        }

    @classmethod
    def get_destination_alternatives(
        cls,
        dest_id: int,
        dataset: list[dict[str, Any]] | None = None,
        limit: int = 3,
    ) -> list[dict[str, Any]]:
        items = dataset if dataset is not None else []
        target_dest = next((d for d in items if d.get("id") == dest_id), None)
        if not target_dest:
            return items[:limit]

        target_cat = str(target_dest.get("category", "")).lower()
        target_lat = target_dest.get("latitude")
        target_lng = target_dest.get("longitude")

        candidates: list[tuple[float, dict[str, Any]]] = []

        for d in items:
            if d.get("id") == dest_id:
                continue

            score = float(d.get("rating", 4.5))
            if str(d.get("category", "")).lower() == target_cat:
                score += 3.0

            if (
                target_lat is not None
                and target_lng is not None
                and d.get("latitude") is not None
                and d.get("longitude") is not None
            ):
                dist = haversine_distance_km(
                    target_lat, target_lng, d["latitude"], d["longitude"]
                )
                d_copy = dict(d)
                d_copy["distance_km"] = dist
                d_copy["distance"] = f"{dist} km from destination"
                score += max(0.0, 4.0 - (dist / 25.0))
                candidates.append((score, d_copy))
            else:
                candidates.append((score, dict(d)))

        candidates.sort(key=lambda x: x[0], reverse=True)
        return [c[1] for c in candidates[:limit]]

    @classmethod
    def get_destination_partners(
        cls,
        dest_id: int,
        dataset: list[dict[str, Any]] | None = None,
    ) -> list[dict[str, Any]]:
        target_partners = [
            p
            for p in SEED_PARTNER_LOCATIONS
            if p.get("associated_destination_id") == dest_id
        ]
        if not target_partners:
            # Fallback to general seed partners
            return SEED_PARTNER_LOCATIONS[:2]
        return target_partners
