from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalyticsCategory(str, Enum):
    DISCOVERY = "discovery"
    PLANNING = "planning"
    COMMUNITY = "community"
    SUSTAINABILITY = "sustainability"
    MARKETPLACE = "marketplace"


class AnalyticsEventCreate(BaseModel):
    session_id: str = Field(..., description="Anonymous browser session identifier")
    user_id: Optional[str] = Field(None, description="Anonymized user identifier")
    category: AnalyticsCategory = Field(..., description="Telemetry event category")
    event_name: str = Field(..., description="Name of the tracked action")
    entity_type: Optional[str] = Field(
        None, description="Optional target entity type (e.g. destination, partner)"
    )
    entity_id: Optional[str] = Field(None, description="Optional target entity ID")
    properties: Dict[str, Any] = Field(
        default_factory=dict, description="Non-PII event metadata properties"
    )
    device_type: Optional[str] = Field("desktop", description="Client device category")


class AnalyticsEventResponse(BaseModel):
    id: int
    session_id: str
    user_id: Optional[str] = None
    category: str
    event_name: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    properties: Dict[str, Any] = {}
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
    stages: List[FunnelStageMetric]
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
    category_breakdown: Dict[str, int]
    funnels: List[FunnelAnalysis]
    recent_events: List[AnalyticsEventResponse]
