from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        description="User prompt or query sent to the AI travel assistant",
        json_schema_extra={"example": "Tell me about tea tasting in Kandy and Ella"},
    )


class CardData(BaseModel):
    title: str = Field(
        ...,
        description="Card title for recommended destination or activity",
        json_schema_extra={"example": "Damro Labookellie High Tea Estate"},
    )
    type: str = Field(
        ...,
        description="Category or activity type",
        json_schema_extra={"example": "Cultural Tea Estate"},
    )
    desc: str = Field(
        ...,
        description="Brief description of the recommendation",
        json_schema_extra={
            "example": "Experience high-altitude Ceylon tea picking and factory tours."
        },
    )
    image: str = Field(
        ...,
        description="Relative image URL path",
        json_schema_extra={"example": "/stitch_images/planner.png"},
    )
    duration: str = Field(
        ...,
        description="Recommended duration",
        json_schema_extra={"example": "Recommended: 3.5 hrs"},
    )


class ChatResponse(BaseModel):
    reply: str = Field(
        ...,
        description="AI generated textual response",
        json_schema_extra={
            "example": "The journey from Kandy to Ella passes through tea country..."
        },
    )
    hasCard: bool = Field(
        False,
        description="Flag indicating if a structured UI card recommendation is attached",
    )
    cardData: CardData | None = Field(
        None, description="Optional structured card data recommendation"
    )
    followUps: list[str] = Field(
        default_factory=list,
        description="Suggested quick action or follow-up prompt options",
    )
