from pydantic import BaseModel, Field


class Badge(BaseModel):
    id: str = Field(
        ...,
        description="Badge unique ID",
        json_schema_extra={"example": "verified_local"},
    )
    title: str = Field(
        ...,
        description="Badge title",
        json_schema_extra={"example": "Verified Local Guide"},
    )
    description: str = Field(
        ...,
        description="Badge description",
        json_schema_extra={
            "example": "Achieved >= 80% AI pass rate and 250+ Eco-Points."
        },
    )
    icon: str = Field(
        "shield",
        description="Badge icon identifier",
        json_schema_extra={"example": "shield_check"},
    )
    unlocked_at: str | None = Field(None, description="Unlock timestamp")


class UserReputationProfile(BaseModel):
    author_name: str = Field(
        ...,
        description="Contributor name",
        json_schema_extra={"example": "Chaminda Perera"},
    )
    rank: str = Field(
        "New Contributor",
        description="Rank: 'New Contributor', 'Verified Local', 'Trusted Guide'",
    )
    eco_points: int = Field(0, description="Total Eco-Points accumulated")
    reputation_score: float = Field(
        0.00, description="Calculated reputation score out of 100.00"
    )
    ai_pass_rate: float = Field(
        100.0,
        description="Percentage of submitted contributions passing AI verification",
    )
    approved_count: int = Field(0, description="Total approved contributions")
    rejected_count: int = Field(0, description="Total rejected contributions")
    total_submissions: int = Field(0, description="Total contribution submissions")
    total_likes_received: int = Field(0, description="Community likes received")
    total_comments_received: int = Field(0, description="Community comments received")
    badges: list[Badge] = Field(
        default_factory=list, description="Unlocked contributor badges"
    )
    is_guide_eligible: bool = Field(
        False,
        description="Flag indicating eligibility for SLTDA Guide Marketplace onboarding",
    )
    guide_upgrade_status: str = Field(
        "none", description="Guide status: 'none', 'eligible', 'applied', 'certified'"
    )
    daily_points_accrued: int = Field(
        0, description="Points earned in current 24-hour window"
    )


class GuideApplicationRequest(BaseModel):
    author_name: str = Field(
        ...,
        description="Applicant author name",
        json_schema_extra={"example": "Chaminda Perera"},
    )
    contact_number: str = Field(
        ...,
        description="Phone/WhatsApp contact",
        json_schema_extra={"example": "+94 77 123 4567"},
    )
    sltda_license_number: str | None = Field(
        None,
        description="Optional SLTDA guide license number",
        json_schema_extra={"example": "SLTDA/NTG/2026/0892"},
    )
    niche_specialization: str = Field(
        "Heritage & Trekking",
        description="Specialization (e.g. Cultural, Wildlife, Trekking, Food)",
        json_schema_extra={"example": "Wildlife & Cultural Heritage"},
    )
    bio_summary: str = Field(
        ...,
        description="Guide bio and experience summary",
        json_schema_extra={
            "example": "Licensed local guide in Central Province with 8 years of experience."
        },
    )
    portfolio_links: list[str] = Field(
        default_factory=list, description="Optional social/website portfolio links"
    )


class GuideApplicationResponse(BaseModel):
    application_id: int = Field(..., description="Unique application ID")
    status: str = Field(
        "pending_verification",
        description="Status: 'pending_verification', 'certified'",
    )
    message: str = Field(
        "Application submitted successfully for SLTDA Guide Marketplace onboarding.",
        description="Status message",
    )
