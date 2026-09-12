from pydantic import BaseModel, Field


class ExifMetadata(BaseModel):
    camera: str = Field(
        "Generic Smartphone / Camera",
        description="Camera make & model",
        json_schema_extra={"example": "Apple iPhone 15 Pro"},
    )
    lens: str = Field(
        "Standard Wide Lens",
        description="Lens specification",
        json_schema_extra={"example": "24mm f/1.78"},
    )
    timestamp: str = Field(
        "2026-09-12 08:30:00",
        description="Photo capture timestamp",
        json_schema_extra={"example": "2026-09-12 06:15:00"},
    )
    latitude: float | None = Field(
        None,
        description="Extracted GPS Latitude",
        json_schema_extra={"example": 6.8768},
    )
    longitude: float | None = Field(
        None,
        description="Extracted GPS Longitude",
        json_schema_extra={"example": 81.0608},
    )
    width: int = Field(
        1920, description="Image width in pixels", json_schema_extra={"example": 4032}
    )
    height: int = Field(
        1080, description="Image height in pixels", json_schema_extra={"example": 3024}
    )
    has_gps: bool = Field(
        True,
        description="Flag indicating if valid GPS EXIF tag was detected",
        json_schema_extra={"example": True},
    )


class AiValidationResult(BaseModel):
    passed: bool = Field(True, description="Overall AI verification decision")
    confidence_score: float = Field(
        0.92,
        description="Confidence score out of 1.00",
        json_schema_extra={"example": 0.94},
    )
    boundary_check: str = Field(
        "PASSED (Sri Lanka Boundary & Destination Geofence Verified)",
        description="Geofence result",
    )
    quality_check: str = Field(
        "PASSED (High Resolution & Natural Image Stream)",
        description="Image quality decision",
    )
    text_safety_check: str = Field(
        "PASSED (No Profanity or Spam Detected)",
        description="NLP text analysis decision",
    )
    wcag_alt_check: str = Field(
        "PASSED (WCAG Compliant Alt-Text)", description="WCAG accessibility decision"
    )
    notes: str = Field(
        "Verified cartographic discovery ready for publication.",
        description="AI summary notes",
    )


class ContributionCreate(BaseModel):
    author_name: str = Field(
        "Cartographer Explorer",
        description="Author name",
        json_schema_extra={"example": "Chaminda Perera"},
    )
    title: str = Field(
        ...,
        description="Discovery title",
        json_schema_extra={"example": "Secret Waterfall at Ella Gap"},
    )
    category: str = Field(
        "Cultural",
        description="Category tag (Cultural, Nature, Beach, Dining, Stay)",
        json_schema_extra={"example": "Nature"},
    )
    destination_id: int | None = Field(
        None, description="Linked destination ID", json_schema_extra={"example": 1}
    )
    description: str = Field(
        ...,
        description="Discovery notes and access story",
        json_schema_extra={
            "example": "Follow the trail past the second tea bungalow at dawn."
        },
    )
    alt_text: str = Field(
        ...,
        description="WCAG accessible alt-text",
        json_schema_extra={"example": "A green misty tea estate valley at sunrise."},
    )
    tags: list[str] = Field(
        default_factory=list,
        description="Hashtags list",
        json_schema_extra={"example": ["#EllaGap", "#Waterfall"]},
    )
    rating: float = Field(
        5.0, description="Rating from 1.0 to 5.0", json_schema_extra={"example": 4.9}
    )
    latitude: float | None = Field(
        None,
        description="GPS Latitude coordinate",
        json_schema_extra={"example": 6.8768},
    )
    longitude: float | None = Field(
        None,
        description="GPS Longitude coordinate",
        json_schema_extra={"example": 81.0608},
    )
    image_url: str = Field(
        "/stitch_images/discover.png",
        description="Photo asset path or URL",
        json_schema_extra={"example": "/stitch_images/discover.png"},
    )


class AiTrustAudit(BaseModel):
    overall_trust_score: float = Field(
        0.94, description="Composite trust score from 0.00 to 1.00"
    )
    geo_consistency_score: float = Field(
        1.00, description="Geographic score based on PostGIS bounds & distance"
    )
    distance_to_destination_km: float | None = Field(
        None, description="Calculated spherical distance to linked destination in km"
    )
    image_authenticity_score: float = Field(
        0.95, description="Image authenticity & real-world natural photo score"
    )
    is_synthetic_image: bool = Field(
        False, description="Flag if image exhibits synthetic/AI-generated markers"
    )
    text_safety_score: float = Field(
        1.00, description="NLP content safety and profanity score"
    )
    spam_risk_score: float = Field(
        0.00, description="Commercial link and spam risk score"
    )
    duplicate_risk_score: float = Field(
        0.00, description="Duplicate text and image content similarity score"
    )
    ai_fallback_triggered: bool = Field(
        False, description="Flag indicating if AI engine fallback was invoked"
    )
    flags: list[str] = Field(
        default_factory=list, description="Active anomaly detection flags"
    )
    summary_notes: str = Field(
        "Verified cartographic discovery", description="Audit summary"
    )


class Contribution(BaseModel):
    id: int = Field(
        ..., description="Unique contribution ID", json_schema_extra={"example": 1}
    )
    author_name: str = Field("Cartographer Explorer", description="Author name")
    title: str = Field(..., description="Contribution title")
    category: str = Field("Cultural", description="Category")
    destination_id: int | None = Field(None, description="Associated destination ID")
    description: str = Field(..., description="Discovery notes")
    image_url: str = Field("/stitch_images/discover.png", description="Photo URL")
    alt_text: str = Field(..., description="Alt-text")
    tags: list[str] = Field(default_factory=list, description="Tags")
    rating: float = Field(5.0, description="Rating")
    latitude: float | None = Field(None, description="Latitude")
    longitude: float | None = Field(None, description="Longitude")
    exif_metadata: ExifMetadata = Field(
        default_factory=ExifMetadata, description="EXIF camera & GPS metadata"
    )
    ai_validation_result: AiValidationResult = Field(
        default_factory=AiValidationResult, description="AI Guard validation result"
    )
    ai_trust_audit: AiTrustAudit = Field(
        default_factory=AiTrustAudit, description="Detailed AI Trust & Moderation Audit"
    )
    ai_confidence_score: float = Field(0.92, description="Confidence score")
    status: str = Field(
        "approved",
        description="Status: 'pending', 'pending_review', 'approved', 'rejected', 'flagged'",
    )
    moderation_status: str = Field(
        "approved", description="Moderation: 'pending_review', 'approved', 'rejected'"
    )
    reputation_points_awarded: int = Field(50, description="Eco points awarded")
    created_at: str = Field("Just now", description="Creation timestamp")


class ReportRequest(BaseModel):
    target_type: str = Field(
        ...,
        description="Target entity type: 'contribution', 'post', 'comment'",
        json_schema_extra={"example": "contribution"},
    )
    target_id: int = Field(
        ..., description="Target record ID", json_schema_extra={"example": 1}
    )
    reason: str = Field(
        ...,
        description="Reason: 'spam', 'inaccurate_gps', 'inappropriate', 'copyright'",
        json_schema_extra={"example": "inaccurate_gps"},
    )
    description: str | None = Field(
        None,
        description="Optional details",
        json_schema_extra={"example": "The pin is placed 10km away from actual site."},
    )
    reporter_name: str | None = Field("Explorer", description="Reporter name")


class ReportResponse(BaseModel):
    id: int = Field(..., description="Report record ID")
    message: str = Field(
        "Report submitted successfully for moderation review",
        description="Status message",
    )


class ModerationRequest(BaseModel):
    action: str = Field(
        ...,
        description="Moderation action: 'approve' or 'reject'",
        json_schema_extra={"example": "approve"},
    )
    moderator_name: str | None = Field(
        "Chief Moderator", description="Moderator identity"
    )
    feedback: str | None = Field(None, description="Moderator feedback note")
    rejection_category: str | None = Field(
        None, description="Category of rejection if action is 'reject'"
    )


class ModerationQueueResponse(BaseModel):
    queue: list[Contribution] = Field(
        default_factory=list, description="Submissions pending moderation"
    )
    total_pending: int = Field(0, description="Total items pending review")
    flagged_count: int = Field(0, description="Count of flagged items")
    average_trust_score: float = Field(
        0.00, description="Average trust score in current queue"
    )
