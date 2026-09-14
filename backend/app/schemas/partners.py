"""Pydantic schemas for EPIC 19 — Local Partner Network."""

from enum import StrEnum

from pydantic import BaseModel, Field


class PartnerTypeEnum(StrEnum):
    """Allowed tourism partner types."""

    GUIDE = "guide"
    AGENCY = "agency"
    HOTEL = "hotel"
    VEHICLE = "vehicle"
    TRANSPORT = "transport"


class PartnerOnboardingPayload(BaseModel):
    """Payload submitted during partner registration & onboarding."""

    name: str = Field(..., description="Contact person or primary representative name")
    business_name: str = Field(
        ..., description="Official registered business or agency name"
    )
    partner_type: PartnerTypeEnum = Field(
        ..., description="Type of tourism service offered"
    )
    district: str = Field(
        ..., description="Primary district of operation (e.g. Matale, Badulla, Galle)"
    )
    province: str = Field(
        ..., description="Primary province (e.g. Central, Uva, Southern)"
    )
    latitude: float = Field(..., description="Business latitude coordinate")
    longitude: float = Field(..., description="Business longitude coordinate")
    address: str | None = Field(
        None, description="Physical address or dispatch station"
    )
    contact_number: str = Field(..., description="Official phone or WhatsApp contact")
    email: str | None = Field(None, description="Business email address")
    website: str | None = Field(
        None, description="Official website or social page link"
    )
    sltda_license_number: str | None = Field(
        None, description="SLTDA license or registration number"
    )
    price_range: str = Field(
        "$$", description="Pricing tier ('$', '$$', '$$$', '$$$$')"
    )
    baseline_rate: float = Field(
        25.00, description="Baseline rate per day or service unit in USD"
    )
    services: list[str] = Field(
        default_factory=list, description="List of offered services"
    )
    associated_destination_ids: list[int] = Field(
        default_factory=list, description="Destination IDs associated with this partner"
    )
    image_url: str | None = Field(
        None, description="Profile or business storefront image URL"
    )


class PartnerProfile(BaseModel):
    """Full partner profile record for display and spatial discovery."""

    id: int = Field(..., description="Unique partner ID")
    name: str
    business_name: str
    partner_type: str
    district: str
    province: str
    latitude: float
    longitude: float
    address: str | None = None
    contact_number: str
    email: str | None = None
    website: str | None = None
    sltda_license_number: str | None = None
    verification_state: str = Field(
        "verified", description="'verified', 'pending_verification', 'unverified'"
    )
    is_verified: bool = True
    is_featured: bool = False
    featured_tier: str = Field("standard", description="'gold', 'silver', 'standard'")
    rating: float = 4.80
    reviews_count: int = 0
    price_range: str = "$$"
    baseline_rate: float = 25.00
    services: list[str] = Field(default_factory=list)
    associated_destination_ids: list[int] = Field(default_factory=list)
    image_url: str = "/stitch_images/discover.png"
    distance_km: float | None = Field(
        None, description="Distance from requested search coordinate in km"
    )
    contributor_author_name: str | None = Field(
        None,
        description="Author name if partner was upgraded from community contributor",
    )
    contributor_eco_points: int | None = Field(
        None, description="Eco-Points accumulated as a community contributor"
    )
    contributor_rank: str | None = Field(
        None, description="Recognition ladder rank at upgrade time"
    )
    preferential_commission_pct: float = Field(
        15.00,
        description="Platform commission percentage (5% preferential vs 15% standard)",
    )
    hidden_gem_badge: bool = Field(
        False, description="Flag indicating special hidden-gem trip guide status"
    )
    created_at: str | None = None


class PartnerListResponse(BaseModel):
    """Response payload containing partner listings and discovery metadata."""

    partners: list[PartnerProfile]
    total: int
    featured_count: int
    filter_type: str | None = None
    filter_district: str | None = None
    query_time_ms: float


class NearbyPartnerRequest(BaseModel):
    """Request query payload for PostGIS spatial proximity partner discovery."""

    latitude: float = Field(..., description="Origin latitude")
    longitude: float = Field(..., description="Origin longitude")
    radius_km: float = Field(50.0, description="Spatial search radius in kilometers")
    partner_type: PartnerTypeEnum | None = Field(
        None, description="Optional partner type filter"
    )
    destination_id: int | None = Field(
        None, description="Optional target destination ID association"
    )
