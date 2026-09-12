from fastapi import APIRouter

from app.schemas.sustainability import DensityPoint, HazardReport, HazardReportResponse

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability"])


@router.get(
    "/density",
    response_model=list[DensityPoint],
    summary="Get real-time crowd density",
    description="Retrieve hourly visitor density numbers to encourage eco-friendly, off-peak travel.",
)
def get_crowd_density():
    """Fetch hourly site crowd density curve."""
    return [
        {"hour": "06:00", "density": 120},
        {"hour": "08:00", "density": 450},
        {"hour": "10:00", "density": 1100},
        {"hour": "12:00", "density": 1420},
        {"hour": "14:00", "density": 1250},
        {"hour": "16:00", "density": 780},
        {"hour": "18:00", "density": 310},
    ]


@router.post(
    "/report",
    response_model=HazardReportResponse,
    summary="Submit environmental or safety hazard report",
    description="Report environmental issues, trail damage, or safety hazards to earn eco reward points.",
)
def submit_hazard_report(report: HazardReport):
    """Submit crowdsourced hazard report for Ranger response."""
    return {
        "status": "success",
        "message": f"Hazard report for '{report.location}' transmitted to LankaLens Ranger Network.",
        "rewardPoints": 50,
    }
