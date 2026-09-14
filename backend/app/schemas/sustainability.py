from pydantic import BaseModel, Field


class DensityPoint(BaseModel):
    hour: str = Field(
        ...,
        description="Time of day in 24-hour HH:MM format",
        json_schema_extra={"example": "10:00"},
    )
    density: int = Field(
        ...,
        description="Estimated visitor density count at the site",
        json_schema_extra={"example": 1100},
    )


class HazardReport(BaseModel):
    location: str = Field(
        ...,
        description="Location name or coordinates of reported environmental/safety hazard",
        json_schema_extra={"example": "Sigiriya Stairway North Pass"},
    )
    description: str = Field(
        ...,
        description="Details regarding the hazard or maintenance concern",
        json_schema_extra={"example": "Loose handrail section near step 420."},
    )
    reporter_name: str | None = Field(
        "Cartographer Explorer",
        description="Optional reporter name",
        json_schema_extra={"example": "Dinuka Silva"},
    )


class HazardReportResponse(BaseModel):
    status: str = Field(
        ...,
        description="Status of submission",
        json_schema_extra={"example": "success"},
    )
    message: str = Field(
        ...,
        description="Confirmation response message",
        json_schema_extra={
            "example": "Hazard report transmitted to LankaLens Ranger Network."
        },
    )
    rewardPoints: int = Field(
        ...,
        description="Eco reward points awarded for contribution",
        json_schema_extra={"example": 50},
    )


class CrowdStatusInfo(BaseModel):
    destination_id: int = Field(
        ..., description="Target destination ID", json_schema_extra={"example": 1}
    )
    destination_name: str = Field(
        ...,
        description="Target destination name",
        json_schema_extra={"example": "Sigiriya Rock Fortress"},
    )
    crowd_score: float = Field(
        ...,
        description="Normalized crowd score from 0.0 to 1.0",
        json_schema_extra={"example": 0.88},
    )
    crowd_status: str = Field(
        ...,
        description="Status classification ('Low', 'Moderate', 'High')",
        json_schema_extra={"example": "High"},
    )
    is_overcrowded: bool = Field(
        ...,
        description="Flag indicating if site is at or over threshold capacity",
        json_schema_extra={"example": True},
    )
    current_capacity_pct: float = Field(
        ...,
        description="Percentage of max capacity currently utilized",
        json_schema_extra={"example": 92.5},
    )
    peak_hours: str = Field(
        "10:00 - 14:00",
        description="Peak visitor hours",
        json_schema_extra={"example": "10:00 - 14:00"},
    )
    warning_message: str | None = Field(
        None,
        description="System overcrowding warning if active",
        json_schema_extra={
            "example": "High visitor density detected. Consider visiting Pidurangala instead."
        },
    )


class AlternativeDestinationSuggestion(BaseModel):
    destination_id: int = Field(
        ..., description="Alternative destination ID", json_schema_extra={"example": 8}
    )
    name: str = Field(
        ...,
        description="Alternative destination name",
        json_schema_extra={"example": "Pidurangala Rock Peak"},
    )
    category: str = Field(
        ..., description="Category tag", json_schema_extra={"example": "nature"}
    )
    district: str = Field(
        ..., description="District location", json_schema_extra={"example": "Matale"}
    )
    crowd_status: str = Field(
        ...,
        description="Alternative site crowd status",
        json_schema_extra={"example": "Moderate"},
    )
    crowd_reduction_pct: float = Field(
        ...,
        description="Estimated percentage reduction in crowds",
        json_schema_extra={"example": 75.0},
    )
    distance_km: float = Field(
        ...,
        description="Distance from original crowded site in km",
        json_schema_extra={"example": 2.4},
    )
    rating: float = Field(
        ..., description="Visitor rating", json_schema_extra={"example": 4.91}
    )
    image_url: str = Field(
        ...,
        description="Thumbnail image URL",
        json_schema_extra={"example": "/stitch_images/discover.png"},
    )
    recommendation_reason: str = Field(
        ...,
        description="Why this alternative is suggested",
        json_schema_extra={
            "example": "Offers panoramic views of Sigiriya with 75% lower crowd density."
        },
    )


class VisitorLoadCurveResponse(BaseModel):
    destination_id: int = Field(..., description="Target destination ID")
    destination_name: str = Field(..., description="Destination name")
    hourly_curve: list[DensityPoint] = Field(
        ..., description="Hourly visitor density distribution"
    )
    peak_hour: str = Field(..., description="Identified peak visitor hour")
    recommended_offpeak_hours: list[str] = Field(
        ..., description="Best off-peak visiting windows"
    )


class EnvironmentalReportRecord(BaseModel):
    id: int = Field(
        ..., description="Unique report ID", json_schema_extra={"example": 1}
    )
    location: str = Field(
        ...,
        description="Location of hazard",
        json_schema_extra={"example": "Pidurangala North Access Trail"},
    )
    description: str = Field(
        ...,
        description="Hazard details",
        json_schema_extra={"example": "Heavy erosion near summit steps"},
    )
    reporter_name: str = Field(
        ..., description="Reporter name", json_schema_extra={"example": "Dinuka Silva"}
    )
    status: str = Field(
        ...,
        description="Status ('pending', 'investigating', 'resolved')",
        json_schema_extra={"example": "investigating"},
    )
    reward_points_awarded: int = Field(
        ..., description="Eco reward points awarded", json_schema_extra={"example": 50}
    )
    created_at: str = Field(
        ...,
        description="ISO creation timestamp",
        json_schema_extra={"example": "2026-09-14T12:00:00Z"},
    )
