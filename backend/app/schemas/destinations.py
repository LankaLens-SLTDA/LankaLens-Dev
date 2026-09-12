from pydantic import BaseModel, Field


class Coords(BaseModel):
    x: str = Field(
        ...,
        description="Map coordinate percentage on the X axis",
        json_schema_extra={"example": "28%"},
    )
    y: str = Field(
        ...,
        description="Map coordinate percentage on the Y axis",
        json_schema_extra={"example": "22%"},
    )


class Destination(BaseModel):
    id: int = Field(
        ...,
        description="Unique destination identifier",
        json_schema_extra={"example": 1},
    )
    title: str = Field(
        ...,
        description="Name of the tourist destination or landmark",
        json_schema_extra={"example": "Sigiriya Ancient Rock Fortress"},
    )
    category: str = Field(
        ...,
        description="Category tag (e.g. temple, nature, beach, wildlife)",
        json_schema_extra={"example": "temple"},
    )
    region: str = Field(
        ...,
        description="Geographical region in Sri Lanka",
        json_schema_extra={"example": "Cultural Triangle"},
    )
    rating: float = Field(
        ...,
        description="Average visitor rating out of 5.0",
        json_schema_extra={"example": 4.9},
    )
    reviews: int = Field(
        ..., description="Total review count", json_schema_extra={"example": 320}
    )
    desc: str = Field(
        ...,
        description="Detailed description of the destination",
        json_schema_extra={
            "example": "5th-century royal citadel towering 200 meters over emerald jungle."
        },
    )
    image: str = Field(
        ...,
        description="Relative URL path to the destination image asset",
        json_schema_extra={"example": "/stitch_images/planner.png"},
    )
    coords: Coords = Field(..., description="2D map coordinate placement")
    elevation: str = Field(
        ...,
        description="Elevation above sea level",
        json_schema_extra={"example": "349 m"},
    )
    distance: str = Field(
        ...,
        description="Travel distance from Colombo",
        json_schema_extra={"example": "165 km from Colombo"},
    )


class DestinationResponse(BaseModel):
    destinations: list[Destination] = Field(
        ..., description="List of matching destination items"
    )
    total: int = Field(
        ...,
        description="Total number of destinations returned",
        json_schema_extra={"example": 4},
    )
