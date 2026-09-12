import time
from abc import ABC, abstractmethod
from typing import Any

from app.services.search_service import compute_token_overlap, haversine_distance_km


class BaseRecommender(ABC):
    """Abstract Base Class interface for LankaLens Recommendation Engines."""

    @abstractmethod
    def recommend(
        self, request: dict[str, Any], dataset: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """Calculates recommendations and returns structured response."""
        pass


class DeterministicRecommender(BaseRecommender):
    """Explainable, multi-attribute deterministic recommendation engine."""

    WEIGHTS = {
        "interest": 0.30,
        "budget": 0.20,
        "crowd": 0.20,
        "trust": 0.15,
        "rating": 0.10,
        "distance": 0.05,
    }

    def recommend(
        self, request: dict[str, Any], dataset: list[dict[str, Any]]
    ) -> dict[str, Any]:
        start_time = time.time()

        user_interests = [str(i).lower() for i in request.get("interests", [])]
        preferred_activities = [
            str(a).lower() for a in request.get("preferred_activities", [])
        ]
        travel_style = str(request.get("travel_style", "Eco-Tourist")).lower()
        max_budget = float(request.get("max_budget_per_day", 50.0))
        crowd_tolerance = str(request.get("crowd_tolerance", "medium")).lower()
        origin_lat = request.get("lat")
        origin_lng = request.get("lng")
        limit = int(request.get("limit", 10))

        scored_destinations: list[dict[str, Any]] = []

        for item in dataset:
            title = str(item.get("title") or item.get("name") or "").lower()
            category = str(item.get("category") or "").lower()
            activities = [str(a).lower() for a in item.get("activities", [])]
            cost = float(item.get("baseline_cost", 0.0))
            rating = float(item.get("rating", 4.5))
            trust_score = float(item.get("trust_score", 0.95))
            crowd_density = str(
                item.get("crowd_info", {}).get("density", "Moderate")
            ).lower()

            # -------------------------------------------------------------
            # 1. Interest & Travel Style Sub-Score (0.0 - 1.0)
            # -------------------------------------------------------------
            interest_score = 0.0
            matched_interest_terms: list[str] = []

            # Check category matching
            for u_interest in user_interests:
                if u_interest in category or category in u_interest:
                    interest_score += 0.4
                    matched_interest_terms.append(category.capitalize())
                    break

            # Check activities matching
            act_matches = 0
            for pref in user_interests + preferred_activities:
                for act in activities:
                    if (
                        compute_token_overlap(pref, act) > 0.4 or pref in act
                        if pref
                        else False
                    ):
                        act_matches += 1
                        if act.capitalize() not in matched_interest_terms:
                            matched_interest_terms.append(act.capitalize())

            if activities:
                interest_score += min(0.6, (act_matches / len(activities)) * 0.8)

            # Travel Style Affinity Boost
            if "eco" in travel_style and (
                "nature" in category or "wildlife" in category
            ):
                interest_score += 0.25
            elif "cultural" in travel_style and (
                "temple" in category or "heritage" in category
            ):
                interest_score += 0.25
            elif "adventure" in travel_style and (
                "beach" in category or "hiking" in title or "rock" in title
            ):
                interest_score += 0.25
            elif "budget" in travel_style and cost == 0.0:
                interest_score += 0.25

            interest_score = min(1.0, max(0.0, interest_score))

            # -------------------------------------------------------------
            # 2. Budget Suitability Sub-Score (0.0 - 1.0)
            # -------------------------------------------------------------
            if cost <= max_budget:
                if max_budget > 0:
                    budget_score = 1.0 - (0.2 * (cost / max_budget))
                else:
                    budget_score = 1.0
            else:
                over_ratio = (cost - max_budget) / max_budget if max_budget > 0 else 1.0
                budget_score = max(0.0, 1.0 - (0.8 * over_ratio))

            budget_score = round(min(1.0, max(0.0, budget_score)), 2)

            # -------------------------------------------------------------
            # 3. Crowd Tolerance Sub-Score (0.0 - 1.0)
            # -------------------------------------------------------------
            if crowd_tolerance == "low":
                if "low" in crowd_density:
                    crowd_score = 1.0
                elif "mod" in crowd_density:
                    crowd_score = 0.65
                else:
                    crowd_score = 0.25
            elif crowd_tolerance == "high":
                if "high" in crowd_density or "very" in crowd_density:
                    crowd_score = 1.0
                elif "mod" in crowd_density:
                    crowd_score = 0.85
                else:
                    crowd_score = 0.60
            else:  # medium
                if "mod" in crowd_density:
                    crowd_score = 1.0
                elif "low" in crowd_density:
                    crowd_score = 0.85
                else:
                    crowd_score = 0.55

            # -------------------------------------------------------------
            # 4. Trust Verification Sub-Score (0.0 - 1.0)
            # -------------------------------------------------------------
            trust_sub_score = min(1.0, max(0.0, trust_score))

            # -------------------------------------------------------------
            # 5. Visitor Rating Sub-Score (0.0 - 1.0)
            # -------------------------------------------------------------
            rating_score = min(1.0, max(0.0, rating / 5.0))

            # -------------------------------------------------------------
            # 6. Proximity Distance Sub-Score (0.0 - 1.0)
            # -------------------------------------------------------------
            distance_score = 0.8  # Default score if origin coordinates not supplied
            dist_km: float | None = None

            dest_lat = item.get("latitude")
            dest_lng = item.get("longitude")

            if (
                origin_lat is not None
                and origin_lng is not None
                and dest_lat is not None
                and dest_lng is not None
            ):
                dist_km = haversine_distance_km(
                    float(origin_lat),
                    float(origin_lng),
                    float(dest_lat),
                    float(dest_lng),
                )
                distance_score = max(0.0, 1.0 - (dist_km / 250.0))

            # -------------------------------------------------------------
            # Combined Final Weighted Score Calculation
            # -------------------------------------------------------------
            total_score = (
                (interest_score * self.WEIGHTS["interest"])
                + (budget_score * self.WEIGHTS["budget"])
                + (crowd_score * self.WEIGHTS["crowd"])
                + (trust_sub_score * self.WEIGHTS["trust"])
                + (rating_score * self.WEIGHTS["rating"])
                + (distance_score * self.WEIGHTS["distance"])
            )

            match_percentage = int(round(total_score * 100))

            # -------------------------------------------------------------
            # Human-Readable Reasoning Generator
            # -------------------------------------------------------------
            reasons: list[str] = []

            if matched_interest_terms:
                reasons.append(
                    f"Interest Match: Fits your preferences ({', '.join(matched_interest_terms[:3])})"
                )
            else:
                reasons.append(
                    f"Category Match: High visitor appeal in {category.capitalize()}"
                )

            if cost == 0.0:
                reasons.append("Free Entry: No baseline ticket cost required")
            elif cost <= max_budget:
                reasons.append(
                    f"Fits Budget: Entry (${cost:.0f}) is comfortably within your ${max_budget:.0f}/day budget"
                )
            else:
                reasons.append(
                    f"Budget Note: Entry (${cost:.0f}) slightly exceeds your ${max_budget:.0f}/day target"
                )

            if "low" in crowd_density and crowd_tolerance == "low":
                reasons.append("Low Crowd Match: Uncrowded & serene visitor density")
            elif crowd_score >= 0.8:
                reasons.append(
                    f"Crowd Level Match: Fits your {crowd_tolerance.capitalize()} crowd tolerance"
                )

            if trust_score >= 0.90:
                reasons.append(
                    f"High AI Trust: {int(trust_score * 100)}% verification trust rating"
                )

            if dist_km is not None:
                reasons.append(
                    f"Proximity: Located {dist_km:.1f} km from your starting point"
                )

            scored_item = {
                "destination": item,
                "match_percentage": match_percentage,
                "explanation": {
                    "match_percentage": match_percentage,
                    "score_breakdown": {
                        "interest_score": round(interest_score, 2),
                        "budget_score": round(budget_score, 2),
                        "crowd_score": round(crowd_score, 2),
                        "trust_score": round(trust_sub_score, 2),
                        "distance_score": round(distance_score, 2),
                        "rating_score": round(rating_score, 2),
                        "total_score": round(total_score, 4),
                    },
                    "reasons": reasons,
                },
            }

            scored_destinations.append(scored_item)

        # Sort recommendations by match percentage descending
        scored_destinations.sort(
            key=lambda x: (
                x["match_percentage"],
                x["explanation"]["score_breakdown"]["trust_score"],
                x["explanation"]["score_breakdown"]["rating_score"],
            ),
            reverse=True,
        )

        top_recommendations = scored_destinations[:limit]
        query_time = round((time.time() - start_time) * 1000, 2)

        return {
            "recommendations": top_recommendations,
            "total": len(top_recommendations),
            "query_params": request,
            "engine_metadata": {
                "model_name": "LankaLens Explainable Deterministic Recommender v1.0",
                "version": "1.0.0",
                "supports_ml_pipeline": True,
                "ranking_weights": self.WEIGHTS,
            },
            "query_time_ms": query_time,
        }


class MLPipelineAdapter(BaseRecommender):
    """Adapter interface enabling future ML Collaborative Filtering & Embedding Models."""

    def recommend(
        self, request: dict[str, Any], dataset: list[dict[str, Any]]
    ) -> dict[str, Any]:
        # Fallback to DeterministicRecommender while ML model weights initialize
        deterministic_engine = DeterministicRecommender()
        res = deterministic_engine.recommend(request, dataset)
        res["engine_metadata"][
            "model_name"
        ] = "LankaLens ML Pipeline Adapter (Hybrid Fallback)"
        return res
