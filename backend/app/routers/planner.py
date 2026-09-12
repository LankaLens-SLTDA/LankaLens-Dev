from fastapi import APIRouter

from app.schemas.planner import (
    BudgetCalculationRequest,
    BudgetCalculationResponse,
    BudgetRecommendationRequest,
    BudgetRecommendationResponse,
    PlannerOverview,
)
from app.services.budget_service import (
    DeterministicBudgetEstimator,
    MLBudgetPricingAdapter,
)

router = APIRouter(prefix="/api/planner", tags=["Planner"])

budget_estimator = MLBudgetPricingAdapter(DeterministicBudgetEstimator())


@router.get(
    "",
    response_model=PlannerOverview,
    summary="Get active itinerary & budget overview",
    description="Retrieve multi-day travel schedule, day stops, duration, total budget, and categorized expense allocation.",
)
def get_planner_data():
    """Retrieve planner itinerary overview and budget breakdown."""
    # Compute baseline budget using estimator service for standard 5-day trip
    req = BudgetCalculationRequest(
        travellers_count=2,
        duration_days=5,
        accommodation_style="mid_range",
        transport_mode="private_car",
        food_preference="mid_tier_restaurants",
        activity_level="moderate_cultural",
    )
    calc_res = budget_estimator.calculate_trip_budget(req)

    # Convert breakdown into UI BudgetItem format
    ui_breakdown = [
        {"name": item.category, "cost": item.amount, "color": item.color}
        for item in calc_res.breakdown
    ]

    return {
        "days": [
            {
                "id": 1,
                "title": "Colombo Arrival & Coastal Heritage",
                "stopsCount": 3,
                "duration": "4.5 hrs",
            },
            {
                "id": 2,
                "title": "Sigiriya Rock Fortress & Dambulla",
                "stopsCount": 4,
                "duration": "6.0 hrs",
            },
            {
                "id": 3,
                "title": "Kandy Temple of Tooth & Tea Gardens",
                "stopsCount": 3,
                "duration": "5.0 hrs",
            },
            {
                "id": 4,
                "title": "Nuwara Eliya High Peaks Train",
                "stopsCount": 2,
                "duration": "3.5 hrs",
            },
            {
                "id": 5,
                "title": "Ella Nine Arch Bridge & Ravana Falls",
                "stopsCount": 4,
                "duration": "6.5 hrs",
            },
        ],
        "totalBudget": calc_res.total_budget,
        "budgetBreakdown": ui_breakdown,
    }


@router.post(
    "/calculate-budget",
    response_model=BudgetCalculationResponse,
    summary="Calculate Itemized Trip Cost Estimate",
    description=(
        "Calculates itemized 5-category trip cost breakdown (Accommodation, Transport, Food, "
        "Activities, Miscellaneous) based on travelers, duration, accommodation tier, "
        "transportation mode, dining preference, and activity level."
    ),
)
def calculate_trip_budget(payload: BudgetCalculationRequest):
    """Execute trip cost calculation."""
    return budget_estimator.calculate_trip_budget(payload)


@router.post(
    "/budget-recommendations",
    response_model=BudgetRecommendationResponse,
    summary="Get Budget-Fitted Destination Recommendations",
    description="Surfaces destinations matching user max spend limit and calculates estimated trip utilization.",
)
def get_budget_recommendations(payload: BudgetRecommendationRequest):
    """Retrieve destinations fitting within user budget constraints."""
    estimator = DeterministicBudgetEstimator()
    return estimator.get_budget_recommendations(payload)
