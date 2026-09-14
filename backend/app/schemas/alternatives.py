"""Pydantic schemas for EPIC 17 — Alternative Destination Engine."""

from pydantic import BaseModel, Field


class AlternativeMatchSubScores(BaseModel):
    """Sub-scores breakdown for multi-criteria alternative matching (0.0 to 1.0)."""

    proximity_score: float = Field(
        ..., description="Score based on geographic distance"
    )
    category_similarity_score: float = Field(
        ..., description="Score based on category alignment"
    )
    activity_overlap_score: float = Field(
        ..., description="Score based on activity overlap"
    )
    budget_fit_score: float = Field(
        ..., description="Score based on cost compatibility"
    )
    crowd_advantage_score: float = Field(
        ..., description="Score based on lower crowd pressure"
    )
    trust_score: float = Field(
        ..., description="Destination trust & verification score"
    )
    rating_score: float = Field(..., description="Community rating score")
    travel_time_score: float = Field(
        ..., description="Estimated travel time convenience score"
    )


class AlternativeMatchExplanation(BaseModel):
    """Explainable rationale detailing why an alternative is recommended over an overcrowded site."""

    overall_match_score: float = Field(
        ..., description="Composite match score (0.0 to 1.0)"
    )
    match_percentage: float = Field(
        ..., description="User-facing match percentage (0 to 100)"
    )
    crowd_reduction_pct: float = Field(
        ..., description="Percentage crowd reduction vs original site"
    )
    estimated_drive_time_minutes: int = Field(
        ..., description="Estimated drive duration in minutes"
    )
    drive_time_formatted: str = Field(
        ..., description="Formatted drive duration string (e.g. '15 mins')"
    )
    distance_km: float = Field(..., description="Geographic distance in kilometers")
    sub_scores: AlternativeMatchSubScores
    key_reasons: list[str] = Field(
        ..., description="Human-readable bullet points explaining the match rationale"
    )


class AlternativeMatchResult(BaseModel):
    """Single alternative match result with full destination metadata and match explanation."""

    original_destination_id: int
    original_destination_name: str
    original_crowd_status: str
    alternative_destination: dict
    explanation: AlternativeMatchExplanation


class AlternativeMatchRequest(BaseModel):
    """Request payload for dedicated alternative destination matching engine."""

    destination_id: int = Field(
        ..., description="ID of the original/overcrowded destination"
    )
    max_distance_km: float = Field(
        120.0, description="Maximum search radius in kilometers"
    )
    max_budget: float | None = Field(
        None, description="Optional maximum baseline cost per visit"
    )
    preferred_categories: list[str] | None = Field(
        None, description="Filter for specific preferred categories"
    )
    min_rating: float | None = Field(
        None, description="Minimum acceptable destination rating"
    )
    min_trust_score: float | None = Field(
        None, description="Minimum trust score threshold"
    )
    max_crowd_level: str | None = Field(
        "Moderate", description="Maximum allowed crowd status ('Low' or 'Moderate')"
    )
    limit: int = Field(5, description="Maximum number of alternatives to return")


class AlternativeMatchResponse(BaseModel):
    """Response payload containing explainable alternative destination recommendations."""

    original_destination: dict
    alternatives: list[AlternativeMatchResult]
    total_found: int
    query_time_ms: float


class FeatureDifference(BaseModel):
    """Individual feature comparison between original and alternative destination."""

    attribute: str
    original_value: str
    alternative_value: str
    advantage: str  # 'alternative', 'original', 'neutral'
    note: str


class SideBySideComparisonResponse(BaseModel):
    """Detailed side-by-side comparison response between original and alternative destination."""

    original_destination: dict
    alternative_destination: dict
    explanation: AlternativeMatchExplanation
    feature_differences: list[FeatureDifference]
    recommendation_summary: str
