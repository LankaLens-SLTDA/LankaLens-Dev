from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.analytics import (
    AnalyticsDashboardMetrics,
    AnalyticsEventCreate,
    AnalyticsEventResponse,
    FunnelAnalysis,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics & Product Intelligence"],
)


@router.post(
    "/track",
    response_model=AnalyticsEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Track Anonymized Telemetry Event",
    description="Ingests user telemetry event, automatically sanitizing PII fields before persistence.",
)
def track_event(payload: AnalyticsEventCreate) -> AnalyticsEventResponse:
    try:
        return AnalyticsService.track_event(payload)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record telemetry event: {str(err)}",
        ) from err


@router.get(
    "/dashboard",
    response_model=AnalyticsDashboardMetrics,
    summary="Get Aggregated Analytics Dashboard Metrics",
    description="Returns product usage KPIs, alternative destination redirection success, marketplace conversion rates, and event volume breakdown.",
)
def get_dashboard() -> AnalyticsDashboardMetrics:
    return AnalyticsService.get_dashboard_metrics()


@router.get(
    "/funnels",
    response_model=list[FunnelAnalysis],
    summary="Get Key Conversion Funnels",
    description="Returns multi-stage conversion funnels for Sustainability (Crowd Redirection), Marketplace (Guide Referral), and Discovery to Planning.",
)
def get_funnels() -> list[FunnelAnalysis]:
    return AnalyticsService.get_funnels()


@router.get(
    "/events",
    response_model=list[AnalyticsEventResponse],
    summary="Query Anonymized Telemetry Events",
    description="Returns recent anonymized telemetry events with optional category filter.",
)
def get_events(
    category: str | None = Query(
        "all",
        description="Category filter ('discovery', 'planning', 'community', 'sustainability', 'marketplace')",
    ),
    limit: int = Query(50, ge=1, le=200, description="Max event logs to return"),
) -> list[AnalyticsEventResponse]:
    return AnalyticsService.get_recent_events(category=category, limit=limit)
