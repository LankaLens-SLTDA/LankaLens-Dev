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


# =========================================================
# EPIC 21 — CONTRIBUTOR TO TRUSTED GUIDE MARKETPLACE PIPELINE SCHEMAS
# =========================================================


class EligibilityCriterionItem(BaseModel):
    """Specific metric criterion evaluated during guide eligibility calculation."""

    metric: str = Field(..., description="Metric name (e.g. Eco-Points, AI Pass Rate)")
    required_value: str = Field(..., description="Required threshold value")
    actual_value: str = Field(..., description="Contributor's actual metric value")
    passed: bool = Field(..., description="Whether contributor met threshold")


class EligibilityCheckResponse(BaseModel):
    """Response detailing automatic guide upgrade eligibility breakdown."""

    author_name: str
    is_eligible: bool = Field(..., description="Overall guide upgrade eligibility flag")
    rank: str = Field(..., description="Current recognition ladder rank")
    guide_level: str = Field(
        ...,
        description="Eligible tier ('certified_trusted_guide', 'community_local_guide', 'not_eligible')",
    )
    criteria_breakdown: list[EligibilityCriterionItem] = Field(
        default_factory=list, description="Itemized multi-factor criteria checklist"
    )
    preferential_commission_pct: float = Field(
        5.00,
        description="Incentivized platform fee (5.0% for trusted guides vs 15.0% standard)",
    )
    matching_boost_pct: float = Field(
        10.0, description="Matching score bonus in Trip Arrangement Broker"
    )
    message: str = Field(..., description="Status summary message")


class GuideUpgradePayload(BaseModel):
    """Payload to upgrade a high-trust contributor into a listed Local Partner guide."""

    author_name: str = Field(
        ...,
        description="Contributor name",
        json_schema_extra={"example": "Chaminda Perera"},
    )
    contact_number: str = Field(
        ...,
        description="Contact phone or WhatsApp",
        json_schema_extra={"example": "+94771234567"},
    )
    district: str = Field(
        "Matale",
        description="Primary operating district",
        json_schema_extra={"example": "Matale"},
    )
    province: str = Field(
        "Central",
        description="Primary operating province",
        json_schema_extra={"example": "Central"},
    )
    sltda_license_number: str | None = Field(
        None,
        description="Optional SLTDA guide license number",
        json_schema_extra={"example": "SLTDA/NTG/8821"},
    )
    niche_specialization: str = Field(
        "Heritage & Eco Trekking",
        description="Specialization tag",
        json_schema_extra={"example": "Heritage & Eco Trekking"},
    )
    baseline_rate: float = Field(
        35.00,
        description="Baseline rate per day in USD",
        json_schema_extra={"example": 35.0},
    )
    services: list[str] = Field(
        default_factory=lambda: [
            "Cultural Heritage Walking Tours",
            "Sigiriya Wildlife Trekking",
            "Historical Interpretation",
        ],
        description="Offered guide services",
    )
    associated_destination_ids: list[int] = Field(
        default_factory=lambda: [1, 101], description="Target destination IDs covered"
    )
    custom_title: str | None = Field(
        None, description="Custom business title for partner listing"
    )


class ConvertedPartnerGuideResponse(BaseModel):
    """Confirmed partner profile created from community contributor upgrade."""

    partner_id: int = Field(..., description="Created Partner Profile ID")
    author_name: str = Field(..., description="Contributor author name")
    business_name: str = Field(..., description="Listed guide title")
    partner_type: str = Field("guide", description="Partner type ('guide')")
    district: str
    province: str
    verification_state: str = Field(
        "verified", description="SLTDA or Community verified status"
    )
    is_verified: bool = True
    is_featured: bool = True
    featured_tier: str = Field("gold", description="'gold' or 'silver'")
    reputation_score: float
    contributor_eco_points: int
    contributor_rank: str
    approved_contributions_count: int
    preferential_commission_pct: float = 5.00
    matching_boost_pct: float = 10.00
    hidden_gem_badge: bool = True
    message: str = Field(..., description="Confirmation outcome message")
