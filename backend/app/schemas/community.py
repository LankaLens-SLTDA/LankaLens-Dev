from pydantic import BaseModel, Field


class CommentItem(BaseModel):
    id: int = Field(
        ..., description="Unique comment ID", json_schema_extra={"example": 1}
    )
    author: str = Field(
        ...,
        description="Commenter display name",
        json_schema_extra={"example": "Kavinda Silva"},
    )
    avatar: str = Field(
        "/stitch_images/planner.png", description="Commenter avatar URL"
    )
    text: str = Field(
        ...,
        description="Comment text message",
        json_schema_extra={
            "example": "Incredible morning light! What time did you arrive?"
        },
    )
    time: str = Field(
        "Just now",
        description="Relative time description",
        json_schema_extra={"example": "10 minutes ago"},
    )


class Post(BaseModel):
    id: int = Field(
        ..., description="Unique community post ID", json_schema_extra={"example": 1}
    )
    author: str = Field(
        ...,
        description="Display name of post author",
        json_schema_extra={"example": "Chaminda Perera"},
    )
    role: str = Field(
        "Explorer",
        description="Contributor role (e.g. Local Guide, Explorer, Ranger)",
        json_schema_extra={"example": "Local Guide"},
    )
    avatar: str = Field(
        "/stitch_images/discover.png", description="Author avatar image URL path"
    )
    time: str = Field(
        "2 hours ago",
        description="Relative human-readable time string",
        json_schema_extra={"example": "2 hours ago"},
    )
    verified: bool = Field(
        True,
        description="AI-Verified route or official contributor status",
        json_schema_extra={"example": True},
    )
    location: str = Field(
        ...,
        description="Geo-tagged location name",
        json_schema_extra={"example": "Ella, Uva Province"},
    )
    destination_id: int | None = Field(
        None,
        description="Optional associated destination ID",
        json_schema_extra={"example": 1},
    )
    latitude: float | None = Field(
        None, description="Latitude coordinate", json_schema_extra={"example": 6.8768}
    )
    longitude: float | None = Field(
        None, description="Longitude coordinate", json_schema_extra={"example": 81.0608}
    )
    rating: float = Field(
        5.0,
        description="Destination rating out of 5.0",
        json_schema_extra={"example": 4.9},
    )
    image: str = Field(
        "/stitch_images/discover.png",
        description="Main photo URL",
        json_schema_extra={"example": "/stitch_images/discover.png"},
    )
    caption: str = Field(
        ...,
        description="Post story or dispatch text caption",
        json_schema_extra={
            "example": "Discovered this secret vantage point just past the second tea bungalow."
        },
    )
    tags: list[str] = Field(
        default_factory=list,
        description="Hashtags associated with post",
        json_schema_extra={"example": ["#EllaRock", "#HiddenVistas"]},
    )
    ecoPoints: int = Field(
        0,
        description="Earned eco community points (likes count)",
        json_schema_extra={"example": 248},
    )
    likes_count: int = Field(
        0, description="Total likes count", json_schema_extra={"example": 248}
    )
    commentsCount: int = Field(
        0, description="Total comments count", json_schema_extra={"example": 32}
    )
    comments_count: int = Field(
        0,
        description="Snake_case alias for comments count",
        json_schema_extra={"example": 32},
    )
    saves_count: int = Field(
        0, description="Total watchlist saves count", json_schema_extra={"example": 85}
    )
    comments: list[CommentItem] = Field(
        default_factory=list, description="List of user comments"
    )
    liked: bool = Field(
        False, description="Flag indicating if active user has liked this post"
    )
    saved: bool = Field(
        False,
        description="Flag indicating if active user has saved this post to watchlist",
    )


class PostCreate(BaseModel):
    author: str = Field("Travel Explorer", description="Author display name")
    role: str = Field("Explorer", description="Contributor role")
    location: str = Field(..., description="Location name or title")
    destination_id: int | None = Field(
        None, description="Optional linked destination ID"
    )
    latitude: float | None = Field(None, description="Latitude coordinate")
    longitude: float | None = Field(None, description="Longitude coordinate")
    rating: float = Field(5.0, description="Star rating (1.0 to 5.0)")
    caption: str = Field(..., description="Dispatch caption or discovery notes")
    tags: list[str] = Field(default_factory=list, description="Hashtag array")
    image: str = Field("/stitch_images/discover.png", description="Image asset URL")


class InteractionRequest(BaseModel):
    action: str = Field(
        ...,
        description="Interaction action: 'like', 'unlike', 'save', 'unsave', 'comment'",
    )
    comment_text: str | None = Field(None, description="Text for comment action")
    author_name: str | None = Field("Explorer", description="Author name for comment")


class LeaderboardContributor(BaseModel):
    name: str = Field(
        ...,
        description="Contributor name",
        json_schema_extra={"example": "Chaminda Perera"},
    )
    role: str = Field(
        ..., description="Role tag", json_schema_extra={"example": "Local Guide"}
    )
    avatar: str = Field(..., description="Avatar image URL")
    eco_points: int = Field(
        ...,
        description="Total accumulated eco points",
        json_schema_extra={"example": 1240},
    )
    verified_count: int = Field(
        ...,
        description="Total verified route contributions",
        json_schema_extra={"example": 142},
    )
