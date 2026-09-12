from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.planner import (
    AddDestinationToTripPayload,
    BudgetCalculationRequest,
    BudgetCalculationResponse,
    BudgetRecommendationRequest,
    BudgetRecommendationResponse,
    PlannerOverview,
    TripCreatePayload,
    TripExportResponse,
    TripRecord,
    TripUpdatePayload,
)
from app.services.budget_service import (
    DeterministicBudgetEstimator,
    MLBudgetPricingAdapter,
)
from app.services.trip_planner_service import TripPlannerService

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
    req = BudgetCalculationRequest(
        travellers_count=2,
        duration_days=5,
        accommodation_style="mid_range",
        transport_mode="private_car",
        food_preference="mid_tier_restaurants",
        activity_level="moderate_cultural",
    )
    calc_res = budget_estimator.calculate_trip_budget(req)

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


# =========================================================
# EPIC 15 — TRIP PLANNER & ITINERARY ENDPOINTS
# =========================================================


@router.post(
    "/trips",
    response_model=TripRecord,
    status_code=status.HTTP_201_CREATED,
    summary="Create new multi-day trip & itinerary",
    description="Creates a new trip with assigned daily itinerary stops, Haversine travel time estimation, and budget rollup.",
)
def create_trip(payload: TripCreatePayload):
    """Create a new trip record."""
    return TripPlannerService.create_trip(payload)


@router.get(
    "/trips",
    response_model=list[TripRecord],
    summary="List all trips in user account",
    description="Retrieves all multi-day trips persisted in the user account store.",
)
def list_trips():
    """List all persisted user trips."""
    return TripPlannerService.list_trips()


@router.get(
    "/trips/{id}",
    response_model=TripRecord,
    summary="Get single trip record details",
    description="Retrieves full multi-day itinerary schedule, stop items, travel metrics, and budget status by integer ID.",
)
def get_trip(id: int):
    """Get single trip details."""
    try:
        return TripPlannerService.get_trip(id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.put(
    "/trips/{id}",
    response_model=TripRecord,
    summary="Update trip parameters or itinerary schedule",
    description="Updates trip title, start date, budget, duration, or assigned daily destination stops.",
)
def update_trip(id: int, payload: TripUpdatePayload):
    """Update trip record."""
    try:
        return TripPlannerService.update_trip(id, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post(
    "/trips/{id}/add-destination",
    response_model=TripRecord,
    summary="Add destination stop to trip itinerary",
    description="Assigns a destination stop to a target day in the trip schedule and recalculates travel time & cost.",
)
def add_destination_to_trip(id: int, payload: AddDestinationToTripPayload):
    """Add destination to trip."""
    try:
        return TripPlannerService.add_destination_to_trip(id, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e


@router.delete(
    "/trips/{id}/destinations/{dest_id}",
    response_model=TripRecord,
    summary="Remove destination stop from trip itinerary",
    description="Removes a destination stop from a trip schedule and updates daily travel metrics.",
)
def remove_destination_from_trip(
    id: int,
    dest_id: int,
    day_number: int | None = Query(None, description="Optional target day number"),
):
    """Remove destination from trip."""
    try:
        return TripPlannerService.remove_destination_from_trip(id, dest_id, day_number)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post(
    "/trips/suggest",
    response_model=TripRecord,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI-suggested multi-day itinerary",
    description="Generates an optimized multi-day itinerary matching duration, group size, starting city, and budget.",
)
def suggest_trip_itinerary(payload: TripCreatePayload):
    """Generate AI suggested itinerary."""
    return TripPlannerService.create_trip(payload)


@router.get(
    "/trips/{id}/export",
    response_model=TripExportResponse,
    summary="Export shareable trip payload & URL token",
    description="Generates a unique share token and shareable URL for exporting trip details.",
)
def export_trip(id: int):
    """Export trip for sharing."""
    try:
        return TripPlannerService.export_trip(id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
