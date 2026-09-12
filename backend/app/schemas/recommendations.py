from pydantic import BaseModel, Field

from app.schemas.destinations import Destination


class UserRecommendationRequest(BaseModel):
    interests: list[str] = Field(
        default_factory=lambda: ["Heritage", "Hiking", "Nature"],
        description="List of user travel interests",
        json_schema_extra={"example": ["Heritage", "Hiking", "Tea Tasting"]},
    )
    travel_style: str = Field(
        "Eco-Tourist",
        description="Travel style: 'Eco-Tourist', 'Cultural Explorer', 'Adventure Seeker', 'Budget Backpacker', 'Luxury Relaxer'",
        json_schema_extra={"example": "Eco-Tourist"},
    )
    max_budget_per_day: float = Field(
        50.0,
        description="Maximum daily budget in USD",
        json_schema_extra={"example": 50.0},
    )
    group_size: int = Field(
        2, description="Number of travelers in party", json_schema_extra={"example": 2}
    )
    trip_duration_days: int = Field(
        3,
        description="Estimated trip duration in days",
        json_schema_extra={"example": 5},
    )
    lat: float | None = Field(
        None,
        description="Origin latitude coordinate for spatial proximity weighting",
        json_schema_extra={"example": 6.9271},
    )
    lng: float | None = Field(
        None,
        description="Origin longitude coordinate for spatial proximity weighting",
        json_schema_extra={"example": 79.8612},
    )
    crowd_tolerance: str = Field(
        "medium",
        description="Crowd tolerance preference: 'low', 'medium', 'high'",
        json_schema_extra={"example": "low"},
    )
    preferred_activities: list[str] = Field(
        default_factory=list,
        description="Explicit activity preferences",
        json_schema_extra={"example": ["Rock Climbing", "Photography"]},
    )
    limit: int = Field(
        10,
        description="Maximum recommendations to return",
        json_schema_extra={"example": 10},
    )


class ScoreBreakdown(BaseModel):
    interest_score: float = Field(..., description="Interest alignment sub-score (0-1)")
    budget_score: float = Field(..., description="Budget suitability sub-score (0-1)")
    crowd_score: float = Field(
        ..., description="Crowd tolerance alignment sub-score (0-1)"
    )
    trust_score: float = Field(..., description="AI Trust verification sub-score (0-1)")
    distance_score: float = Field(
        ..., description="Proximity alignment sub-score (0-1)"
    )
    rating_score: float = Field(..., description="Visitor rating sub-score (0-1)")
    total_score: float = Field(..., description="Final combined weighted score (0-1)")


class RecommendationExplanation(BaseModel):
    match_percentage: int = Field(
        ..., description="Overall calculated match percentage (0-100%)"
    )
    score_breakdown: ScoreBreakdown = Field(
        ..., description="Itemized sub-score metrics"
    )
    reasons: list[str] = Field(
        default_factory=list, description="Human-readable explainability reasoning list"
    )


class RecommendedDestination(BaseModel):
    destination: Destination = Field(
        ..., description="Full recommended destination object"
    )
    match_percentage: int = Field(..., description="Overall match percentage (0-100%)")
    explanation: RecommendationExplanation = Field(
        ..., description="Transparent scoring breakdown & human-readable reasoning"
    )


class EngineMetadata(BaseModel):
    model_name: str = Field(
        "LankaLens Explainable Deterministic Recommender v1.0",
        description="Algorithm engine identifier",
    )
    version: str = Field("1.0.0", description="Engine version string")
    supports_ml_pipeline: bool = Field(
        True, description="Abstract interface flag for ML model replacement"
    )
    ranking_weights: dict[str, float] = Field(
        default_factory=dict, description="Active feature weight configuration"
    )


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendedDestination] = Field(
        default_factory=list, description="Ranked list of recommended destinations"
    )
    total: int = Field(0, description="Total count of recommendations returned")
    query_params: UserRecommendationRequest = Field(
        ..., description="Parameters used for recommendation calculation"
    )
    engine_metadata: EngineMetadata = Field(
        default_factory=EngineMetadata, description="Engine architectural metadata"
    )
    query_time_ms: float = Field(0.0, description="Execution duration in milliseconds")
