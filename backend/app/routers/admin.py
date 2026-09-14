"""FastAPI Router for EPIC 22 — Admin & Moderation Platform."""

from typing import Any

from fastapi import APIRouter, Header, HTTPException, Query, status

from app.routers.arrangements import IN_MEMORY_INQUIRIES
from app.routers.contribution import IN_MEMORY_CONTRIBUTIONS, IN_MEMORY_REPORTS
from app.routers.destinations import IN_MEMORY_DESTINATIONS
from app.routers.partners import IN_MEMORY_PARTNERS
from app.routers.reputation import IN_MEMORY_GUIDE_APPLICATIONS
from app.schemas.admin import (
    AdminAuditLogRecord,
    AdminDashboardMetrics,
    DestinationUpdatePayload,
    GuideVerificationPayload,
    HazardVerificationPayload,
    PartnerApprovalPayload,
)
from app.schemas.contribution import ModerationQueueResponse, ModerationRequest
from app.services.admin_service import IN_MEMORY_AUDIT_LOGS, AdminPlatformService

router = APIRouter(prefix="/api/admin", tags=["Admin & Moderation Platform"])


def _verify_admin_role(x_admin_role: str | None = Header(None)) -> str:
    """Verifies admin authorization role from HTTP request header."""
    role = x_admin_role or "super_admin"
    valid_roles = ["super_admin", "moderator", "partner_manager", "content_editor"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Unauthorized admin role '{role}'. Valid roles: {valid_roles}",
        )
    return role


@router.get(
    "/metrics",
    response_model=AdminDashboardMetrics,
    status_code=status.HTTP_200_OK,
    summary="Get centralized platform operations analytics",
    description="Rolls up total users, active destinations, pending queue count, partner count, booking referrals, and system health.",
)
def get_admin_metrics(
    x_admin_role: str | None = Header(None),
) -> AdminDashboardMetrics:
    """Retrieve operational analytics summary."""
    _verify_admin_role(x_admin_role)
    return AdminPlatformService.get_dashboard_analytics(
        destinations_dataset=IN_MEMORY_DESTINATIONS,
        contributions_dataset=IN_MEMORY_CONTRIBUTIONS,
        partners_dataset=IN_MEMORY_PARTNERS,
        referrals_dataset=IN_MEMORY_INQUIRIES,
        reports_dataset=IN_MEMORY_REPORTS,
    )


@router.get(
    "/moderation/queue",
    response_model=ModerationQueueResponse,
    status_code=status.HTTP_200_OK,
    summary="Get AI-flagged content moderation queue",
    description="Retrieves contributions and discoveries pending human moderator review.",
)
def get_moderation_queue(
    x_admin_role: str | None = Header(None),
) -> ModerationQueueResponse:
    """Retrieves AI moderation queue items."""
    _verify_admin_role(x_admin_role)
    pending_items = [
        c
        for c in IN_MEMORY_CONTRIBUTIONS
        if c.get("status") in ("pending", "pending_review", "flagged")
    ]
    avg_score = (
        round(
            sum(c.get("ai_confidence_score", 0.90) for c in pending_items)
            / len(pending_items),
            2,
        )
        if pending_items
        else 0.92
    )

    return ModerationQueueResponse(
        queue=pending_items,
        total_pending=len(pending_items),
        flagged_count=sum(1 for c in pending_items if c.get("status") == "flagged"),
        average_trust_score=avg_score,
    )


@router.post(
    "/moderation/action/{contribution_id}",
    status_code=status.HTTP_200_OK,
    summary="Moderate content submission (Approve or Reject)",
    description="Moderates a pending/flagged submission and records audit log entry.",
)
def moderate_contribution(
    contribution_id: int,
    payload: ModerationRequest,
    x_admin_role: str | None = Header(None),
) -> dict[str, Any]:
    """Moderates content item decision."""
    role = _verify_admin_role(x_admin_role)
    admin_name = payload.moderator_name or f"Moderator ({role})"

    try:
        updated = AdminPlatformService.moderate_content_item(
            contribution_id=contribution_id,
            action=payload.action,
            admin_name=admin_name,
            feedback=payload.feedback,
            contributions_dataset=IN_MEMORY_CONTRIBUTIONS,
        )
        return {
            "status": "success",
            "message": f"Contribution #{contribution_id} {payload.action.lower()}d successfully.",
            "item": updated,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.get(
    "/reports",
    status_code=status.HTTP_200_OK,
    summary="Get all crowdsourced user reports & environmental alerts",
)
def get_admin_reports(x_admin_role: str | None = Header(None)) -> list[dict[str, Any]]:
    """Lists user reports and hazard flags."""
    _verify_admin_role(x_admin_role)
    return IN_MEMORY_REPORTS


@router.post(
    "/reports/{report_id}/resolve",
    status_code=status.HTTP_200_OK,
    summary="Resolve or dismiss user report",
)
def resolve_report(
    report_id: int,
    admin_name: str = Query("Admin", description="Admin name"),
    notes: str | None = Query(None, description="Resolution notes"),
    x_admin_role: str | None = Header(None),
) -> dict[str, Any]:
    """Resolves a user report."""
    role = _verify_admin_role(x_admin_role)
    rep = next((r for r in IN_MEMORY_REPORTS if r.get("id") == report_id), None)
    if not rep:
        rep = {"id": report_id, "status": "resolved", "reason": "user_report"}
        IN_MEMORY_REPORTS.append(rep)

    rep["status"] = "resolved"
    AdminPlatformService.log_action(
        admin_name=admin_name,
        admin_role=role,
        action_type="resolve_report",
        target_type="report",
        target_id=str(report_id),
        details=f"Resolved report #{report_id}. Notes: {notes or 'None'}",
    )
    return {"status": "success", "message": f"Report #{report_id} marked as resolved."}


@router.put(
    "/destinations/{destination_id}",
    status_code=status.HTTP_200_OK,
    summary="Edit destination details & crowd status",
)
def update_destination(
    destination_id: int,
    payload: DestinationUpdatePayload,
    admin_name: str = Query("Admin Editor", description="Editor name"),
    x_admin_role: str | None = Header(None),
) -> dict[str, Any]:
    """Edits destination attributes."""
    _verify_admin_role(x_admin_role)
    try:
        updated = AdminPlatformService.update_destination(
            destination_id=destination_id,
            payload=payload,
            destinations_dataset=IN_MEMORY_DESTINATIONS,
            admin_name=admin_name,
        )
        return {
            "status": "success",
            "message": f"Destination #{destination_id} updated successfully.",
            "destination": updated,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post(
    "/partners/{partner_id}/approval",
    status_code=status.HTTP_200_OK,
    summary="Approve partner listing & set featured tier",
)
def approve_partner_listing(
    partner_id: int,
    payload: PartnerApprovalPayload,
    admin_name: str = Query("Partner Manager", description="Manager name"),
    x_admin_role: str | None = Header(None),
) -> dict[str, Any]:
    """Approves partner listing."""
    _verify_admin_role(x_admin_role)
    try:
        updated = AdminPlatformService.approve_partner(
            payload=payload,
            partners_dataset=IN_MEMORY_PARTNERS,
            admin_name=admin_name,
        )
        return {
            "status": "success",
            "message": f"Partner #{partner_id} listing approval updated.",
            "partner": updated,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post(
    "/guides/{application_id}/verification",
    status_code=status.HTTP_200_OK,
    summary="Verify/certify guide marketplace application",
)
def verify_guide_application(
    application_id: int,
    payload: GuideVerificationPayload,
    admin_name: str = Query("Guide Certifier", description="Certifier name"),
    x_admin_role: str | None = Header(None),
) -> dict[str, Any]:
    """Verifies guide application status."""
    _verify_admin_role(x_admin_role)
    updated = AdminPlatformService.verify_guide_upgrade(
        payload=payload,
        guide_apps_dataset=IN_MEMORY_GUIDE_APPLICATIONS,
        admin_name=admin_name,
    )
    return {
        "status": "success",
        "message": f"Guide application #{application_id} updated to '{payload.status}'.",
        "application": updated,
    }


@router.post(
    "/hazards/{hazard_id}/verify",
    status_code=status.HTTP_200_OK,
    summary="Verify environmental hazard report",
)
def verify_environmental_hazard(
    hazard_id: int,
    payload: HazardVerificationPayload,
    admin_name: str = Query("Environmental Inspector", description="Inspector name"),
    x_admin_role: str | None = Header(None),
) -> dict[str, Any]:
    """Verifies or resolves environmental hazard alert."""
    _verify_admin_role(x_admin_role)
    updated = AdminPlatformService.review_environmental_hazard(
        payload=payload,
        reports_dataset=IN_MEMORY_REPORTS,
        admin_name=admin_name,
    )
    return {
        "status": "success",
        "message": f"Hazard #{hazard_id} verification updated to '{payload.status}'.",
        "hazard": updated,
    }


@router.get(
    "/audit-logs",
    response_model=list[AdminAuditLogRecord],
    status_code=status.HTTP_200_OK,
    summary="Get administrative audit trail logs",
    description="Retrieves complete history of moderator and administrative actions.",
)
def get_admin_audit_logs(
    limit: int = Query(50, ge=1, le=500, description="Max logs to retrieve"),
    x_admin_role: str | None = Header(None),
) -> list[AdminAuditLogRecord]:
    """Retrieves administrative audit trail log stream."""
    _verify_admin_role(x_admin_role)
    return [AdminAuditLogRecord(**log) for log in IN_MEMORY_AUDIT_LOGS[:limit]]
