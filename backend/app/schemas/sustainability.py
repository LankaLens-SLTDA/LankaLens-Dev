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
