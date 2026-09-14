"""Pydantic schemas for EPIC 20 — Trip Arrangement Broker."""

from enum import StrEnum

from pydantic import BaseModel, Field

from app.schemas.partners import PartnerProfile


class ArrangementModeEnum(StrEnum):
    """Travel arrangement mode options."""

    GUIDED = "guided"
    INDEPENDENT = "independent"


class ArrangementMatchRequest(BaseModel):
    """Payload to request partner arrangement recommendations for a trip context."""

    trip_id: int | None = Field(
        None,
        description="Optional trip ID to match against",
        json_schema_extra={"example": 1},
    )
    mode: ArrangementModeEnum = Field(
        ArrangementModeEnum.GUIDED,
        description="Arrangement path ('guided' or 'independent')",
        json_schema_extra={"example": "guided"},
    )
    destination_ids: list[int] = Field(
        default_factory=list,
        description="List of destination IDs in trip itinerary",
        json_schema_extra={"example": [1, 2, 4]},
    )
    starting_location: str | None = Field(
        "Colombo", description="Origin city", json_schema_extra={"example": "Colombo"}
    )
    district: str | None = Field(
        None,
        description="Target district filter",
        json_schema_extra={"example": "Matale"},
    )
    partner_type_filter: str | None = Field(
        None,
        description="Optional partner sub-type filter ('guide', 'agency', 'hotel', 'vehicle', 'transport')",
        json_schema_extra={"example": "guide"},
    )


class TripPartnerMatchItem(BaseModel):
    """Matched partner item with match confidence score and contextual relevance."""

    partner: PartnerProfile = Field(..., description="Full partner profile metadata")
    match_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Contextual match score percentage (0-100%)",
        json_schema_extra={"example": 94.5},
    )
    matching_destinations: list[str] = Field(
        default_factory=list,
        description="Names or titles of destinations matched from trip",
        json_schema_extra={
            "example": ["Sigiriya Ancient Rock Fortress", "Dambulla Cave Temple"]
        },
    )
    recommended_for_mode: ArrangementModeEnum = Field(
        ..., description="Recommended travel mode ('guided' or 'independent')"
    )
    relevance_reason: str = Field(
        ...,
        description="Human-readable explanation of why partner fits trip plan",
        json_schema_extra={
            "example": "Certified guide covering your scheduled visit to Sigiriya"
        },
    )
    estimated_cost_per_day: float = Field(
        ...,
        description="Estimated cost USD per day for service",
        json_schema_extra={"example": 45.0},
    )


class TripArrangementResponse(BaseModel):
    """Response payload containing partner arrangement recommendations for trip."""

    trip_id: int | None = Field(
        None, description="Target trip ID if matched from saved record"
    )
    mode: ArrangementModeEnum = Field(..., description="Active arrangement mode")
    matched_partners: list[TripPartnerMatchItem] = Field(
        default_factory=list,
        description="Ranked partner options matching trip itinerary",
    )
    guided_options_count: int = Field(
        ..., description="Total available guided partners"
    )
    independent_options_count: int = Field(
        ..., description="Total available independent partners"
    )
    total_matched: int = Field(
        ..., description="Count of matched options in current view"
    )
    query_time_ms: float = Field(..., description="Calculation latency in milliseconds")


class ReferralInquiryPayload(BaseModel):
    """Payload to initiate a booking referral inquiry with a local partner."""

    trip_id: int | None = Field(None, description="Optional associated trip ID")
    partner_id: int = Field(
        ..., description="ID of selected partner", json_schema_extra={"example": 1}
    )
    arrangement_mode: ArrangementModeEnum = Field(
        ArrangementModeEnum.GUIDED, description="'guided' or 'independent'"
    )
    customer_name: str = Field(
        ..., description="Traveler full name", json_schema_extra={"example": "Jane Doe"}
    )
    customer_contact: str = Field(
        ...,
        description="Phone or WhatsApp contact",
        json_schema_extra={"example": "+94771234567"},
    )
    customer_email: str | None = Field(
        None,
        description="Customer email address",
        json_schema_extra={"example": "jane@example.com"},
    )
    start_date: str | None = Field(
        "2026-10-01", description="Travel start date YYYY-MM-DD"
    )
    end_date: str | None = Field("2026-10-05", description="Travel end date YYYY-MM-DD")
    group_size: int = Field(2, ge=1, description="Number of travelers")
    custom_notes: str | None = Field(
        None, description="Special requests or itinerary preferences"
    )


class ReferralInquiryRecord(BaseModel):
    """Confirmed booking referral inquiry record with tracking code."""

    referral_id: int = Field(..., description="Unique inquiry ID")
    referral_code: str = Field(
        ...,
        description="Unique referral tracking code (e.g. LL-REF-89123)",
        json_schema_extra={"example": "LL-REF-89123"},
    )
    trip_id: int | None = Field(None, description="Associated trip ID")
    partner_id: int = Field(..., description="Target partner ID")
    partner_name: str = Field(..., description="Target business/guide name")
    partner_type: str = Field(..., description="Partner service category")
    arrangement_mode: ArrangementModeEnum = Field(..., description="Arrangement mode")
    customer_name: str
    customer_contact: str
    customer_email: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    group_size: int = 1
    status: str = Field(
        "pending", description="'pending', 'confirmed', 'completed', 'cancelled'"
    )
    estimated_cost: float = Field(0.0, description="Estimated engagement cost USD")
    custom_notes: str | None = None
    created_at: str
