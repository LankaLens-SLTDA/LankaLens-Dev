from typing import Any

from pydantic import BaseModel, Field


class CrowdInfo(BaseModel):
    density: str = Field(
        "Moderate",
        description="Current or typical visitor density rating (Low, Moderate, High, Very High)",
        json_schema_extra={"example": "Moderate"},
    )
    peak_hours: str = Field(
        "10:00 - 14:00",
        description="Typical peak visitor hours",
        json_schema_extra={"example": "10:00 - 14:00"},
    )
    peak_months: list[str] = Field(
        default_factory=lambda: ["Dec", "Jan", "Aug"],
        description="Peak travel months",
        json_schema_extra={"example": ["Dec", "Jan", "Aug"]},
    )


class PartnerInfo(BaseModel):
    name: str = Field(
        "Local SLTDA Partner Cooperative",
        description="Local partner name or cooperative entity",
        json_schema_extra={"example": "Ella Eco Tuk-Tuk Drivers Collective"},
    )
    type: str = Field(
        "Transport & Guide Partner",
        description="Partner type (Transport Co-op, Eco-Guide, Homestay, Certified Gear)",
        json_schema_extra={"example": "Transport Co-op"},
    )
    contact: str = Field(
        "+94 77 123 4567",
        description="Direct contact number or dispatch line",
        json_schema_extra={"example": "+94 77 123 4567"},
    )
    rating: float = Field(
        4.9,
        description="Partner community rating",
        json_schema_extra={"example": 4.9},
    )
    verified: bool = Field(
        True,
        description="Verified partner status badge",
        json_schema_extra={"example": True},
    )


class CommunityStats(BaseModel):
    upvotes: int = Field(
        0, description="Community upvotes count", json_schema_extra={"example": 1280}
    )
    save_count: int = Field(
        0,
        description="Number of times saved to user itineraries",
        json_schema_extra={"example": 540},
    )


class Coords(BaseModel):
    x: str = Field(
        "50%",
        description="Map percentage coordinate X for UI rendering",
        json_schema_extra={"example": "28%"},
    )
    y: str = Field(
        "50%",
        description="Map percentage coordinate Y for UI rendering",
        json_schema_extra={"example": "22%"},
    )


class DestinationBase(BaseModel):
    name: str = Field(
        ...,
        description="Official destination name",
        json_schema_extra={"example": "Sigiriya Ancient Rock Fortress"},
    )
    title: str = Field(
        ...,
        description="Display title for cards and UI header",
        json_schema_extra={"example": "Sigiriya Ancient Rock Fortress"},
    )
    category: str = Field(
        ...,
        description="Destination category (temple, nature, beach, wildlife, heritage, culture, adventure)",
        json_schema_extra={"example": "temple"},
    )
    district: str = Field(
        ...,
        description="Sri Lankan administrative district",
        json_schema_extra={"example": "Matale"},
    )
    province: str = Field(
        ...,
        description="Sri Lankan province (Central, Uva, Southern, Western, etc.)",
        json_schema_extra={"example": "Central"},
    )
    latitude: float = Field(
        ...,
        description="Geographic latitude coordinate",
        json_schema_extra={"example": 7.9570},
    )
    longitude: float = Field(
        ...,
        description="Geographic longitude coordinate",
        json_schema_extra={"example": 80.7600},
    )
    description: str = Field(
        "",
        description="Detailed summary description",
        json_schema_extra={
            "example": "5th-century royal citadel towering 200 meters over emerald jungle."
        },
    )
    activities: list[str] = Field(
        default_factory=list,
        description="Available activities and experiences",
        json_schema_extra={"example": ["Rock Climbing", "History Tour", "Photography"]},
    )
    estimated_visit_duration_minutes: int = Field(
        180,
        description="Estimated visit duration in minutes",
        json_schema_extra={"example": 240},
    )
    baseline_cost: float = Field(
        0.00,
        description="Baseline ticket or entry cost in USD",
        json_schema_extra={"example": 36.00},
    )
    popularity: float = Field(
        4.50,
        description="Popularity score out of 5.0",
        json_schema_extra={"example": 4.90},
    )
    rating: float = Field(
        4.50,
        description="Average visitor rating out of 5.0",
        json_schema_extra={"example": 4.90},
    )
    reviews: int = Field(
        0, description="Total review count", json_schema_extra={"example": 320}
    )
    trust_score: float = Field(
        0.95,
        description="Trust & verification score (0.00 to 1.00)",
        json_schema_extra={"example": 0.98},
    )
    verification_state: str = Field(
        "verified",
        description="Verification state: 'verified', 'community_submitted', 'pending_review'",
        json_schema_extra={"example": "verified"},
    )
    publication_status: str = Field(
        "published",
        description="Publication status: 'published', 'draft', 'archived'",
        json_schema_extra={"example": "published"},
    )
    is_verified: bool = Field(
        True,
        description="Quick boolean flag to separate verified vs community data",
        json_schema_extra={"example": True},
    )
    crowd_info: CrowdInfo = Field(
        default_factory=CrowdInfo, description="Crowd density and peak period details"
    )
    partner_info: PartnerInfo = Field(
        default_factory=PartnerInfo, description="Local ecosystem partner details"
    )
    community_stats: CommunityStats = Field(
        default_factory=CommunityStats, description="Community engagement statistics"
    )
    nearby_attractions: list[str] = Field(
        default_factory=list,
        description="Names or titles of neighboring points of interest",
        json_schema_extra={
            "example": ["Pidurangala Rock Peak", "Dambulla Cave Temple"]
        },
    )
    images: list[str] = Field(
        default_factory=list,
        description="List of image URLs or asset paths",
        json_schema_extra={"example": ["/stitch_images/planner.png"]},
    )
    image_url: str = Field(
        "/stitch_images/discover.png",
        description="Primary thumbnail image path",
        json_schema_extra={"example": "/stitch_images/planner.png"},
    )
    coord_x: str = Field(
        "50%",
        description="X axis percent for interactive map",
        json_schema_extra={"example": "28%"},
    )
    coord_y: str = Field(
        "50%",
        description="Y axis percent for interactive map",
        json_schema_extra={"example": "22%"},
    )
    elevation: str = Field(
        "N/A",
        description="Elevation text label",
        json_schema_extra={"example": "349 m"},
    )
    distance_from_colombo: str = Field(
        "N/A",
        description="Distance text from Colombo",
        json_schema_extra={"example": "165 km from Colombo"},
    )


class DestinationCreate(DestinationBase):
    pass


class DestinationUpdate(BaseModel):
    name: str | None = None
    title: str | None = None
    category: str | None = None
    district: str | None = None
    province: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    description: str | None = None
    activities: list[str] | None = None
    estimated_visit_duration_minutes: int | None = None
    baseline_cost: float | None = None
    popularity: float | None = None
    rating: float | None = None
    trust_score: float | None = None
    verification_state: str | None = None
    publication_status: str | None = None
    is_verified: bool | None = None
    image_url: str | None = None
    images: list[str] | None = None
    nearby_attractions: list[str] | None = None


class Destination(DestinationBase):
    id: int = Field(
        ...,
        description="Unique destination integer ID",
        json_schema_extra={"example": 1},
    )
    desc: str = Field(
        "",
        description="Backward compatible alias for description",
        json_schema_extra={"example": "5th-century royal citadel."},
    )
    image: str = Field(
        "/stitch_images/discover.png",
        description="Backward compatible alias for image_url",
        json_schema_extra={"example": "/stitch_images/planner.png"},
    )
    coords: Coords = Field(
        default_factory=Coords, description="Backward compatible map coordinate object"
    )
    distance: str = Field(
        "N/A",
        description="Backward compatible alias for distance_from_colombo",
        json_schema_extra={"example": "165 km from Colombo"},
    )
    distance_km: float | None = Field(
        None,
        description="Calculated spatial distance in kilometers (present in nearby queries)",
        json_schema_extra={"example": 12.4},
    )


class DestinationListResponse(BaseModel):
    destinations: list[Destination] = Field(
        ..., description="List of matching destination records"
    )
    total: int = Field(
        ...,
        description="Total count of matching destinations",
        json_schema_extra={"example": 25},
    )


class DestinationResponse(BaseModel):
    destination: Destination = Field(..., description="Single destination object")
    message: str = Field(
        "Success",
        description="Status message",
        json_schema_extra={"example": "Destination retrieved successfully"},
    )


class SearchQueryResponse(BaseModel):
    destinations: list[Destination] = Field(
        default_factory=list, description="Ranked list of matching destination records"
    )
    total: int = Field(0, description="Total count of matching destinations")
    page: int = Field(1, description="Current page number")
    limit: int = Field(20, description="Items limit per page")
    cached: bool = Field(False, description="Flag indicating if query hit cache")
    query_time_ms: float = Field(
        0.0, description="Query execution time in milliseconds"
    )


class MapCluster(BaseModel):
    cluster_id: str = Field(..., description="Unique spatial cluster identifier")
    latitude: float = Field(..., description="Cluster centroid latitude")
    longitude: float = Field(..., description="Cluster centroid longitude")
    point_count: int = Field(..., description="Total destination points inside cluster")
    category_distribution: dict[str, int] = Field(
        default_factory=dict, description="Distribution count per destination category"
    )
    destination_ids: list[int] = Field(
        default_factory=list, description="IDs of destinations aggregated in cluster"
    )


class PartnerLocation(BaseModel):
    id: int = Field(..., description="Unique partner location ID")
    name: str = Field(..., description="Partner business or cooperative name")
    type: str = Field(
        ...,
        description="Partner category (Transport Co-op, Eco-Guide, Homestay, Authentic Dining, Certified Gear)",
    )
    latitude: float = Field(..., description="Partner GPS latitude")
    longitude: float = Field(..., description="Partner GPS longitude")
    rating: float = Field(4.9, description="Community partner rating")
    contact: str = Field("+94 77 123 4567", description="Contact phone or link")
    verified: bool = Field(True, description="Verification badge status")
    associated_destination_id: int | None = Field(
        None, description="Nearby associated destination ID if applicable"
    )


class MapDiscoveryResponse(BaseModel):
    destinations: list[Destination] = Field(
        default_factory=list, description="Destinations matching viewport query"
    )
    clusters: list[MapCluster] = Field(
        default_factory=list, description="Aggregated map marker clusters"
    )
    total_in_viewport: int = Field(
        0, description="Total destination count in active viewport"
    )
    recommended_alternatives: list[Destination] = Field(
        default_factory=list,
        description="Recommended alternative destinations near active target",
    )
    partner_locations: list[PartnerLocation] = Field(
        default_factory=list, description="Verified ecosystem partner locations"
    )
    viewport_bounds: dict[str, float] = Field(
        default_factory=dict,
        description="Viewport boundary coordinates (min_lat, min_lng, max_lat, max_lng)",
    )
    query_time_ms: float = Field(0.0, description="Execution duration in milliseconds")


class MarketplaceService(BaseModel):
    id: int = Field(..., description="Unique service entity ID")
    name: str = Field(..., description="Business or service provider name")
    category: str = Field(
        ..., description="Service category: 'hotel', 'vehicle', 'guide'"
    )
    rating: float = Field(4.9, description="Average service rating")
    price_range: str = Field(
        "$$", description="Price tier indicator ($ / $$ / $$$ / $$$$)"
    )
    contact: str = Field("+94 77 123 4567", description="Contact phone or line")
    image: str = Field("/stitch_images/planner.png", description="Service asset image")
    verified: bool = Field(True, description="SLTDA or community verified status")
    location_note: str = Field(
        "Near destination", description="Proximity location note"
    )


class BudgetBreakdown(BaseModel):
    entry_fee: float = Field(0.0, description="Ticket or entry cost in USD")
    avg_meal_cost: float = Field(12.0, description="Estimated average local meal cost")
    local_transport_cost: float = Field(
        15.0, description="Estimated local transport cost"
    )
    guide_fee_optional: float = Field(
        25.0, description="Optional local certified guide fee"
    )
    total_estimated_day_budget: float = Field(
        52.0, description="Estimated total single-day budget"
    )


class DestinationDetailsResponse(BaseModel):
    destination: Destination = Field(
        ..., description="Primary destination profile record"
    )
    community_posts: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Approved community posts tagged for destination",
    )
    trust_metrics: dict[str, Any] = Field(
        default_factory=dict,
        description="AI Trust score breakdown & verification audit",
    )
    hotels: list[MarketplaceService] = Field(
        default_factory=list, description="Nearby recommended hotels & homestays"
    )
    vehicles: list[MarketplaceService] = Field(
        default_factory=list, description="Nearby transport vehicle cooperatives"
    )
    guides: list[MarketplaceService] = Field(
        default_factory=list, description="Nearby SLTDA certified local guides"
    )
    nearby_alternatives: list[Destination] = Field(
        default_factory=list, description="Recommended alternative destinations"
    )
    crowd_status: CrowdInfo = Field(
        default_factory=CrowdInfo, description="Crowd density and peak periods"
    )
    budget_breakdown: BudgetBreakdown = Field(
        default_factory=BudgetBreakdown, description="Itemized budget breakdown"
    )
    query_time_ms: float = Field(0.0, description="Execution duration in milliseconds")
