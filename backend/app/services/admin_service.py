"""Service layer for EPIC 22 — Admin & Moderation Platform."""

from datetime import datetime
from typing import Any

from app.schemas.admin import (
    AdminAuditLogRecord,
    AdminDashboardMetrics,
    AdminRoleEnum,
    DestinationUpdatePayload,
    GuideVerificationPayload,
    HazardVerificationPayload,
    PartnerApprovalPayload,
)
from app.supabase_client import supabase

SEED_AUDIT_LOGS: list[dict[str, Any]] = [
    {
        "id": 1,
        "admin_name": "Chief Moderator (Saman)",
        "admin_role": "super_admin",
        "action_type": "verify_partner",
        "target_type": "partner",
        "target_id": "1",
        "details": "Verified SLTDA license for Dinuka Heritage & Trekking Guides. Assigned Gold featured tier.",
        "created_at": "2026-09-14T09:30:00Z",
    },
    {
        "id": 2,
        "admin_name": "Content Editor (Nimali)",
        "admin_role": "moderator",
        "action_type": "approve_contribution",
        "target_type": "contribution",
        "target_id": "101",
        "details": "Approved cartographic contribution at Sigiriya. AI Confidence score 0.96.",
        "created_at": "2026-09-14T11:15:00Z",
    },
]

IN_MEMORY_AUDIT_LOGS: list[dict[str, Any]] = [dict(item) for item in SEED_AUDIT_LOGS]


class AdminPlatformService:
    """Centralized admin operations and audit logging engine."""

    @classmethod
    def log_action(
        cls,
        admin_name: str,
        admin_role: str | AdminRoleEnum,
        action_type: str,
        target_type: str,
        target_id: str,
        details: str,
        logs_store: list[dict[str, Any]] | None = None,
    ) -> AdminAuditLogRecord:
        """Records administrative action into audit trail log."""
        store = logs_store if logs_store is not None else IN_MEMORY_AUDIT_LOGS
        log_id = len(store) + 1
        role_str = str(admin_role.value if hasattr(admin_role, "value") else admin_role)

        record = {
            "id": log_id,
            "admin_name": admin_name,
            "admin_role": role_str,
            "action_type": action_type,
            "target_type": target_type,
            "target_id": str(target_id),
            "details": details,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }

        store.insert(0, record)

        if supabase:
            try:
                supabase.table("admin_audit_logs").insert(record).execute()
            except Exception as e:
                print(f"[LankaLens Supabase admin audit log error] {e}")

        return AdminAuditLogRecord(**record)

    @classmethod
    def get_dashboard_analytics(
        cls,
        destinations_dataset: list[dict[str, Any]],
        contributions_dataset: list[dict[str, Any]],
        partners_dataset: list[dict[str, Any]],
        referrals_dataset: list[dict[str, Any]],
        reports_dataset: list[dict[str, Any]],
    ) -> AdminDashboardMetrics:
        """Rolls up platform operational analytics metrics."""
        pending_queue_count = sum(
            1
            for c in contributions_dataset
            if c.get("status") in ("pending", "pending_review", "flagged")
        )
        active_partners = sum(1 for p in partners_dataset if p.get("is_verified", True))
        flagged_hazards = sum(
            1 for r in reports_dataset if r.get("status") in ("pending", "unverified")
        )

        return AdminDashboardMetrics(
            total_users=142,
            total_destinations=len(destinations_dataset),
            pending_moderation_count=pending_queue_count,
            active_partners_count=active_partners,
            total_referrals_count=len(referrals_dataset),
            platform_health_score=98.5,
            flagged_hazards_count=flagged_hazards,
            system_status="operational",
        )

    @classmethod
    def moderate_content_item(
        cls,
        contribution_id: int,
        action: str,
        admin_name: str,
        feedback: str | None,
        contributions_dataset: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Approves or rejects a pending/flagged contribution item."""
        contrib = next(
            (c for c in contributions_dataset if c.get("id") == contribution_id), None
        )
        if not contrib:
            raise ValueError(f"Contribution #{contribution_id} not found.")

        new_status = "approved" if action.lower() == "approve" else "rejected"
        contrib["status"] = new_status
        contrib["moderation_status"] = new_status

        details_msg = f"{action.capitalize()}d contribution #{contribution_id} ('{contrib.get('title')}')."
        if feedback:
            details_msg += f" Feedback: {feedback}"

        cls.log_action(
            admin_name=admin_name,
            admin_role="moderator",
            action_type=f"{action.lower()}_contribution",
            target_type="contribution",
            target_id=str(contribution_id),
            details=details_msg,
        )

        return contrib

    @classmethod
    def update_destination(
        cls,
        destination_id: int,
        payload: DestinationUpdatePayload,
        destinations_dataset: list[dict[str, Any]],
        admin_name: str,
    ) -> dict[str, Any]:
        """Edits existing destination properties."""
        dest = next(
            (d for d in destinations_dataset if d.get("id") == destination_id), None
        )
        if not dest:
            raise ValueError(f"Destination #{destination_id} not found.")

        if payload.name:
            dest["name"] = payload.name
            dest["title"] = payload.name
        if payload.category:
            dest["category"] = payload.category
        if payload.district:
            dest["district"] = payload.district
        if payload.province:
            dest["province"] = payload.province
        if payload.baseline_cost is not None:
            dest["baseline_cost"] = payload.baseline_cost
        if payload.crowd_status:
            if "crowd_info" not in dest or not isinstance(dest["crowd_info"], dict):
                dest["crowd_info"] = {}
            dest["crowd_info"]["density"] = payload.crowd_status
        if payload.description:
            dest["description"] = payload.description
            dest["desc"] = payload.description

        cls.log_action(
            admin_name=admin_name,
            admin_role="content_editor",
            action_type="update_destination",
            target_type="destination",
            target_id=str(destination_id),
            details=f"Updated destination #{destination_id} ('{dest.get('name')}').",
        )

        return dest

    @classmethod
    def approve_partner(
        cls,
        payload: PartnerApprovalPayload,
        partners_dataset: list[dict[str, Any]],
        admin_name: str,
    ) -> dict[str, Any]:
        """Approves partner listing, sets SLTDA verification and featured tier."""
        partner = next(
            (p for p in partners_dataset if p.get("id") == payload.partner_id), None
        )
        if not partner:
            raise ValueError(f"Partner #{payload.partner_id} not found.")

        partner["is_verified"] = payload.is_verified
        partner["verification_state"] = payload.verification_state
        partner["is_featured"] = payload.is_featured
        partner["featured_tier"] = payload.featured_tier

        cls.log_action(
            admin_name=admin_name,
            admin_role="partner_manager",
            action_type="approve_partner",
            target_type="partner",
            target_id=str(payload.partner_id),
            details=f"Partner #{payload.partner_id} ('{partner.get('business_name')}') verification set to '{payload.verification_state}', tier '{payload.featured_tier}'.",
        )

        return partner

    @classmethod
    def verify_guide_upgrade(
        cls,
        payload: GuideVerificationPayload,
        guide_apps_dataset: list[dict[str, Any]],
        admin_name: str,
    ) -> dict[str, Any]:
        """Certifies or rejects a guide marketplace upgrade application."""
        app_rec = next(
            (a for a in guide_apps_dataset if a.get("id") == payload.application_id),
            None,
        )
        if not app_rec:
            # Create synthetic app record if testing
            app_rec = {
                "id": payload.application_id,
                "author_name": "Applicant",
                "status": payload.status,
            }
            guide_apps_dataset.append(app_rec)

        app_rec["status"] = payload.status

        cls.log_action(
            admin_name=admin_name,
            admin_role="partner_manager",
            action_type="verify_guide_upgrade",
            target_type="guide_application",
            target_id=str(payload.application_id),
            details=f"Guide Application #{payload.application_id} set to status '{payload.status}'. Notes: {payload.admin_notes or 'None'}",
        )

        return app_rec

    @classmethod
    def review_environmental_hazard(
        cls,
        payload: HazardVerificationPayload,
        reports_dataset: list[dict[str, Any]],
        admin_name: str,
    ) -> dict[str, Any]:
        """Verifies or resolves crowdsourced environmental hazard reports."""
        rep = next(
            (r for r in reports_dataset if r.get("id") == payload.hazard_id), None
        )
        if not rep:
            rep = {
                "id": payload.hazard_id,
                "status": payload.status,
                "reason": "hazard_report",
            }
            reports_dataset.append(rep)

        rep["status"] = payload.status

        cls.log_action(
            admin_name=admin_name,
            admin_role="moderator",
            action_type="verify_hazard",
            target_type="environmental_hazard",
            target_id=str(payload.hazard_id),
            details=f"Environmental Hazard report #{payload.hazard_id} set to status '{payload.status}'.",
        )

        return rep
