from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class AnalyticsCategory(StrEnum):
    DISCOVERY = "discovery"
    PLANNING = "planning"
    COMMUNITY = "community"
    SUSTAINABILITY = "sustainability"
    MARKETPLACE = "marketplace"


class AnalyticsEventCreate(BaseModel):
    session_id: str = Field(..., description="Anonymous browser session identifier")
    user_id: str | None = Field(None, description="Anonymized user identifier")
    category: AnalyticsCategory = Field(..., description="Telemetry event category")
    event_name: str = Field(..., description="Name of the tracked action")
    entity_type: str | None = Field(
        None, description="Optional target entity type (e.g. destination, partner)"
    )
    entity_id: str | None = Field(None, description="Optional target entity ID")
    properties: dict[str, Any] = Field(
        default_factory=dict, description="Non-PII event metadata properties"
    )
    device_type: str | None = Field("desktop", description="Client device category")


class AnalyticsEventResponse(BaseModel):
    id: int
    session_id: str
    user_id: str | None = None
    category: str
    event_name: str
    entity_type: str | None = None
    entity_id: str | None = None
    properties: dict[str, Any] = {}
    device_type: str = "desktop"
    created_at: str


class FunnelStageMetric(BaseModel):
    stage_name: str
    count: int
    conversion_rate: float = Field(
        ..., description="Percentage relative to preceding stage"
    )


class FunnelAnalysis(BaseModel):
    funnel_name: str
    stages: list[FunnelStageMetric]
    overall_conversion_rate: float = Field(
        ..., description="Percentage converting from first to final stage"
    )


class AnalyticsDashboardMetrics(BaseModel):
    total_events: int
    active_sessions: int
    alternative_acceptance_rate: float = Field(
        ...,
        description="Percentage of high-crowd warning viewers who clicked an alternative destination",
    )
    marketplace_conversion_rate: float = Field(
        ...,
        description="Percentage of partner profile viewers who submitted an arrangement request",
    )
    sustainable_traffic_diversions: int
    category_breakdown: dict[str, int]
    funnels: list[FunnelAnalysis]
    recent_events: list[AnalyticsEventResponse]
