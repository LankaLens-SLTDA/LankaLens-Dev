from fastapi import APIRouter

from app.schemas.planner import PlannerOverview

router = APIRouter(prefix="/api/planner", tags=["Planner"])


@router.get(
    "",
    response_model=PlannerOverview,
    summary="Get active itinerary & budget overview",
    description="Retrieve multi-day travel schedule, day stops, duration, total budget, and categorized expense allocation.",
)
def get_planner_data():
    """Retrieve planner itinerary overview and budget breakdown."""
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
        "totalBudget": 1160.0,
        "budgetBreakdown": [
            {"name": "Stay", "cost": 450.0, "color": "#0F5C56"},
            {"name": "Transport", "cost": 220.0, "color": "#8FD3D6"},
            {"name": "Activities", "cost": 310.0, "color": "#E08A2C"},
            {"name": "Dining", "cost": 180.0, "color": "#5E2E19"},
        ],
    }
