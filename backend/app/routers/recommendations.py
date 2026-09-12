from fastapi import APIRouter, Query, status

from app.routers.destinations import IN_MEMORY_DESTINATIONS, format_destination_record
from app.schemas.recommendations import (
    RecommendationResponse,
    UserRecommendationRequest,
)
from app.services.recommendation_engine import DeterministicRecommender

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.post(
    "/personalized",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Personalized, Budget-Aware & Sustainability Recommendation Engine",
    description=(
        "Executes LankaLens explainable deterministic recommendation algorithm. "
        "Calculates ranked match percentages, itemized sub-score breakdowns, and "
        "human-readable reasoning based on user interests, travel style, daily budget, "
        "crowd tolerance, trust verification, visitor ratings, and spatial proximity."
    ),
)
def get_personalized_recommendations(payload: UserRecommendationRequest):
    """Execute personalized explainable recommendation algorithm."""
    raw_dataset = [format_destination_record(d) for d in IN_MEMORY_DESTINATIONS]
    recommender = DeterministicRecommender()
    request_dict = payload.model_dump()
    res = recommender.recommend(request_dict, raw_dataset)
    return res


@router.get(
    "/quick",
    response_model=RecommendationResponse,
    summary="Quick GET Recommendation Query",
    description="Lightweight query-parameter endpoint for fast recommendation widgets.",
)
def get_quick_recommendations(
    interests: str | None = Query(
        "Heritage,Hiking", description="Comma separated user interests"
    ),
    travel_style: str | None = Query("Eco-Tourist", description="Travel style persona"),
    max_budget: float | None = Query(50.0, description="Maximum daily budget USD"),
    crowd_tolerance: str | None = Query(
        "medium", description="Crowd tolerance ('low', 'medium', 'high')"
    ),
    limit: int = Query(6, description="Maximum number of recommendations to return"),
):
    """Quick GET endpoint for recommendations."""
    interests_str = interests if isinstance(interests, str) else "Heritage,Hiking"
    travel_style_str = travel_style if isinstance(travel_style, str) else "Eco-Tourist"
    max_budget_val = max_budget if isinstance(max_budget, (int, float)) else 50.0
    crowd_tolerance_str = (
        crowd_tolerance if isinstance(crowd_tolerance, str) else "medium"
    )
    limit_val = limit if isinstance(limit, int) else 6

    interests_list = (
        [i.strip() for i in interests_str.split(",")] if interests_str else []
    )
    request_obj = UserRecommendationRequest(
        interests=interests_list,
        travel_style=travel_style_str,
        max_budget_per_day=max_budget_val,
        crowd_tolerance=crowd_tolerance_str,
        limit=limit_val,
    )
    raw_dataset = [format_destination_record(d) for d in IN_MEMORY_DESTINATIONS]
    recommender = DeterministicRecommender()
    res = recommender.recommend(request_obj.model_dump(), raw_dataset)
    return res
