from pydantic import BaseModel, Field


class Post(BaseModel):
    id: int = Field(
        ..., description="Unique community post ID", json_schema_extra={"example": 1}
    )
    author: str = Field(
        ...,
        description="Display name of the author",
        json_schema_extra={"example": "Chaminda Perera"},
    )
    role: str = Field(
        ...,
        description="User role (e.g. Local Guide, Explorer)",
        json_schema_extra={"example": "Local Guide"},
    )
    avatar: str = Field(
        ...,
        description="Avatar image URL path",
        json_schema_extra={"example": "/stitch_images/discover.png"},
    )
    time: str = Field(
        ...,
        description="Human-readable relative timestamp",
        json_schema_extra={"example": "2 hours ago"},
    )
    verified: bool = Field(
        ...,
        description="Verified contributor badge status",
        json_schema_extra={"example": True},
    )
    location: str = Field(
        ...,
        description="Geographic location of post",
        json_schema_extra={"example": "Ella, Uva Province"},
    )
    image: str = Field(
        ...,
        description="Post main photo URL path",
        json_schema_extra={"example": "/stitch_images/discover.png"},
    )
    caption: str = Field(
        ...,
        description="Text caption or story",
        json_schema_extra={
            "example": "Discovered this secret vantage point just past the second tea bungalow."
        },
    )
    tags: list[str] = Field(
        ...,
        description="Hashtags associated with post",
        json_schema_extra={"example": ["#EllaRock", "#HiddenVistas"]},
    )
    ecoPoints: int = Field(
        ...,
        description="Earned eco community points",
        json_schema_extra={"example": 248},
    )
    commentsCount: int = Field(
        ..., description="Total comment count", json_schema_extra={"example": 32}
    )
