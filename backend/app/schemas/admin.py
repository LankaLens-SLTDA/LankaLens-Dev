"""Pydantic schemas for EPIC 22 — Admin & Moderation Platform."""

from enum import StrEnum

from pydantic import BaseModel, Field


class AdminRoleEnum(StrEnum):
    """Admin and moderator authorization roles."""

    SUPER_ADMIN = "super_admin"
    MODERATOR = "moderator"
    PARTNER_MANAGER = "partner_manager"
    CONTENT_EDITOR = "content_editor"


class AdminDashboardMetrics(BaseModel):
    """Platform operations summary metrics."""

    total_users: int = Field(..., description="Total registered community explorers")
    total_destinations: int = Field(
        ..., description="Active published tourism destinations"
    )
    pending_moderation_count: int = Field(
        ..., description="Content items pending AI/human moderation"
    )
    active_partners_count: int = Field(
        ..., description="Listed local tourism partner providers"
    )
    total_referrals_count: int = Field(
        ..., description="Total booking referral inquiries tracked"
    )
    platform_health_score: float = Field(
        ..., description="Platform operational health score (0-100%)"
    )
    flagged_hazards_count: int = Field(
        ..., description="Active unverified hazard reports"
    )
    system_status: str = Field("operational", description="System operational status")


class AdminAuditLogRecord(BaseModel):
    """Administrative action audit trail log entry."""

    id: int = Field(..., description="Unique audit log ID")
    admin_name: str = Field(..., description="Admin or moderator name")
    admin_role: AdminRoleEnum = Field(..., description="Role tier")
    action_type: str = Field(
        ...,
        description="Action executed (e.g. approve_contribution, update_destination)",
    )
    target_type: str = Field(
        ..., description="Target entity type (e.g. contribution, partner, destination)"
    )
    target_id: str = Field(..., description="Target entity ID or code")
    details: str = Field(..., description="Audit details and rationale notes")
    created_at: str = Field(..., description="ISO timestamp")


class DestinationUpdatePayload(BaseModel):
    """Payload to update an existing destination record."""

    name: str | None = Field(None, description="Destination title")
    category: str | None = Field(
        None, description="Category tag (Cultural, Nature, Beach, etc.)"
    )
    district: str | None = Field(None, description="District location")
    province: str | None = Field(None, description="Province location")
    baseline_cost: float | None = Field(
        None, description="Baseline entry ticket cost in USD"
    )
    crowd_status: str | None = Field(
        None, description="Crowd density status ('Low', 'Moderate', 'High')"
    )
    description: str | None = Field(None, description="Destination overview text")


class PartnerApprovalPayload(BaseModel):
    """Payload to review and approve a local partner listing."""

    partner_id: int = Field(..., description="Target partner ID")
    is_verified: bool = Field(True, description="SLTDA or platform verification status")
    verification_state: str = Field(
        "verified", description="'verified', 'pending_verification', 'unverified'"
    )
    is_featured: bool = Field(True, description="Featured listing status")
    featured_tier: str = Field("gold", description="'gold', 'silver', 'standard'")
    admin_notes: str | None = Field(
        None, description="Approval rationale or review feedback"
    )


class GuideVerificationPayload(BaseModel):
    """Payload to verify or certify a guide marketplace upgrade application."""

    application_id: int = Field(..., description="Target guide application ID")
    status: str = Field("certified", description="'certified' or 'rejected'")
    admin_notes: str | None = Field(None, description="Verification review notes")


class HazardVerificationPayload(BaseModel):
    """Payload to verify or resolve crowdsourced environmental hazard reports."""

    hazard_id: int = Field(..., description="Hazard report ID")
    status: str = Field("verified", description="'verified', 'resolved', 'false_alarm'")
    admin_notes: str | None = Field(None, description="Inspector verification feedback")
