from fastapi import APIRouter, Query

from app.schemas.sustainability import (
    AlternativeDestinationSuggestion,
    CrowdStatusInfo,
    DensityPoint,
    EnvironmentalReportRecord,
    HazardReport,
    HazardReportResponse,
    VisitorLoadCurveResponse,
)
from app.services.crowd_service import (
    MLDemandForecastingAdapter,
    ThresholdCrowdEngine,
    list_environmental_hazard_reports,
    submit_environmental_hazard_report,
)

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability"])

crowd_engine = MLDemandForecastingAdapter(ThresholdCrowdEngine())


@router.get(
    "/density",
    response_model=list[DensityPoint],
    summary="Get real-time crowd density",
    description="Retrieve hourly visitor density numbers to encourage eco-friendly, off-peak travel.",
)
def get_crowd_density():
    """Fetch hourly site crowd density curve."""
    load_res = crowd_engine.get_visitor_load_curve(1)
    return load_res.hourly_curve


@router.get(
    "/crowd-status/{destination_id}",
    response_model=CrowdStatusInfo,
    summary="Get destination crowd score & overcrowding warning",
    description="Calculates crowd score (0.0 to 1.0), status ('Low', 'Moderate', 'High'), capacity percentage, and warnings.",
)
def get_destination_crowd_status(destination_id: int):
    """Retrieve destination crowd status and overcrowding warning."""
    return crowd_engine.get_crowd_status(destination_id)


@router.get(
    "/alternatives/{destination_id}",
    response_model=list[AlternativeDestinationSuggestion],
    summary="Get lower-crowd nearby alternative destinations",
    description="Surfaces nearby alternative destinations with lower crowd congestion to distribute tourist traffic.",
)
def get_crowd_alternatives(
    destination_id: int,
    limit: int = Query(
        3, description="Maximum number of alternative suggestions", ge=1, le=10
    ),
):
    """Surfaces lower-crowd nearby alternative destinations."""
    return crowd_engine.get_crowd_alternatives(destination_id, limit=limit)


@router.get(
    "/visitor-load/{destination_id}",
    response_model=VisitorLoadCurveResponse,
    summary="Get 24-hour visitor load distribution curve",
    description="Retrieves hourly visitor load distribution curve, peak hours, and recommended off-peak visiting windows.",
)
def get_visitor_load_curve(destination_id: int):
    """Retrieve 24-hour visitor load curve."""
    return crowd_engine.get_visitor_load_curve(destination_id)


@router.post(
    "/report",
    response_model=HazardReportResponse,
    summary="Submit environmental or safety hazard report",
    description="Report environmental issues, trail damage, or safety hazards to earn eco reward points.",
)
def submit_hazard_report(report: HazardReport):
    """Submit crowdsourced hazard report for Ranger response."""
    return submit_environmental_hazard_report(report)


@router.get(
    "/reports",
    response_model=list[EnvironmentalReportRecord],
    summary="List crowdsourced environmental hazard reports",
    description="Retrieves all active crowdsourced hazard reports for field ranger monitoring.",
)
def list_hazard_reports():
    """List active environmental hazard reports."""
    return list_environmental_hazard_reports()
