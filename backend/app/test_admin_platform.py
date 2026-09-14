"""Test suite for EPIC 22 — Admin & Moderation Platform."""

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def run_tests():
    print("=" * 70)
    print("   LankaLens EPIC 22 — Admin & Moderation Platform Test Suite")
    print("=" * 70)

    # 1. Test Operations Analytics Metrics
    print("\n1. Testing Operations Analytics Summary (GET /api/admin/metrics)...")
    headers = {"X-Admin-Role": "super_admin"}
    res_metrics = client.get("/api/admin/metrics", headers=headers)
    assert res_metrics.status_code == 200, f"Error: {res_metrics.text}"
    body_metrics = res_metrics.json()
    assert body_metrics["total_destinations"] > 0
    assert body_metrics["system_status"] == "operational"
    print(f"   Total Destinations: {body_metrics['total_destinations']}")
    print(f"   Active Partners: {body_metrics['active_partners_count']}")
    print(f"   Pending Moderation Queue: {body_metrics['pending_moderation_count']}")
    print(f"   Health Score: {body_metrics['platform_health_score']}%")

    # 2. Test Admin Role Header Protection
    print("\n2. Testing Admin Role Header Protection (Invalid Role)...")
    bad_headers = {"X-Admin-Role": "unauthorized_role"}
    res_bad = client.get("/api/admin/metrics", headers=bad_headers)
    assert (
        res_bad.status_code == 403
    ), f"Expected 403 Forbidden, got {res_bad.status_code}"
    print(
        f"   HTTP 403 Forbidden confirmed for invalid role '{bad_headers['X-Admin-Role']}'."
    )

    # 3. Test AI Moderation Queue & Action Decision
    print(
        "\n3. Testing AI Moderation Queue Decision (POST /api/admin/moderation/action/1)..."
    )
    mod_payload = {
        "action": "approve",
        "moderator_name": "Senior Moderator (Nimali)",
        "feedback": "GPS coordinates and WCAG alt-text verified by human moderator.",
    }
    res_mod = client.post(
        "/api/admin/moderation/action/1", json=mod_payload, headers=headers
    )
    assert res_mod.status_code == 200, f"Error: {res_mod.text}"
    body_mod = res_mod.json()
    assert body_mod["status"] == "success"
    assert body_mod["item"]["status"] == "approved"
    print(
        f"   Moderation Action Success: Contribution #1 set to '{body_mod['item']['status']}'."
    )

    # 4. Test Destination Editing Capability
    print("\n4. Testing Destination Editing (PUT /api/admin/destinations/1)...")
    dest_payload = {
        "name": "Sigiriya Ancient Rock Fortress (UNESCO World Heritage Site)",
        "baseline_cost": 36.00,
        "crowd_status": "Moderate",
        "description": "5th-century ancient citadel and palace complex built by King Kashyapa.",
    }
    res_dest = client.put(
        "/api/admin/destinations/1?admin_name=Editor+Saman",
        json=dest_payload,
        headers=headers,
    )
    assert res_dest.status_code == 200, f"Error: {res_dest.text}"
    body_dest = res_dest.json()
    assert body_dest["destination"]["baseline_cost"] == 36.00
    assert body_dest["destination"]["crowd_info"]["density"] == "Moderate"
    print(
        f"   Destination #1 Updated: Title '{body_dest['destination']['name']}', Cost ${body_dest['destination']['baseline_cost']}"
    )

    # 5. Test Local Partner Approval & Featured Tier Setting
    print(
        "\n5. Testing Partner Approval & Tier Setting (POST /api/admin/partners/1/approval)..."
    )
    partner_payload = {
        "partner_id": 1,
        "is_verified": True,
        "verification_state": "verified",
        "is_featured": True,
        "featured_tier": "gold",
        "admin_notes": "SLTDA national guide license verified for 2026 season.",
    }
    res_partner = client.post(
        "/api/admin/partners/1/approval", json=partner_payload, headers=headers
    )
    assert res_partner.status_code == 200, f"Error: {res_partner.text}"
    body_partner = res_partner.json()
    assert body_partner["partner"]["verification_state"] == "verified"
    assert body_partner["partner"]["featured_tier"] == "gold"
    print(
        f"   Partner #1 Approved: Verification '{body_partner['partner']['verification_state']}', Tier '{body_partner['partner']['featured_tier']}'"
    )

    # 6. Test Guide Marketplace Application Verification
    print(
        "\n6. Testing Guide Upgrade Application Verification (POST /api/admin/guides/1/verification)..."
    )
    guide_payload = {
        "application_id": 1,
        "status": "certified",
        "admin_notes": "Passed national guide registry verification.",
    }
    res_guide = client.post(
        "/api/admin/guides/1/verification", json=guide_payload, headers=headers
    )
    assert res_guide.status_code == 200, f"Error: {res_guide.text}"
    body_guide = res_guide.json()
    assert body_guide["application"]["status"] == "certified"
    print(
        f"   Guide Application #1 Status Updated to '{body_guide['application']['status']}'."
    )

    # 7. Test Environmental Hazard Report Verification
    print(
        "\n7. Testing Environmental Hazard Report Verification (POST /api/admin/hazards/1/verify)..."
    )
    hazard_payload = {
        "hazard_id": 1,
        "status": "verified",
        "admin_notes": "Trail obstacle confirmed near Ella Rock route.",
    }
    res_hazard = client.post(
        "/api/admin/hazards/1/verify", json=hazard_payload, headers=headers
    )
    assert res_hazard.status_code == 200, f"Error: {res_hazard.text}"
    body_hazard = res_hazard.json()
    assert body_hazard["hazard"]["status"] == "verified"
    print(f"   Hazard Report #1 Status Updated to '{body_hazard['hazard']['status']}'.")

    # 8. Test Administrative Audit Trail Log Stream
    print("\n8. Testing Audit Trail Logs Stream (GET /api/admin/audit-logs)...")
    res_logs = client.get("/api/admin/audit-logs", headers=headers)
    assert res_logs.status_code == 200, f"Error: {res_logs.text}"
    logs_list = res_logs.json()
    assert len(logs_list) >= 5, f"Expected at least 5 audit logs, got {len(logs_list)}"
    print(f"   Audit Logs Stream Returned {len(logs_list)} recorded admin actions.")
    for log in logs_list[:3]:
        print(
            f"   - Log #{log['id']}: [{log['admin_role'].upper()}] {log['admin_name']} executed '{log['action_type']}' on {log['target_type']} #{log['target_id']}"
        )

    # 9. Exporting OpenAPI Specification
    print("\n9. Exporting Updated OpenAPI Specification...")
    openapi_spec = app.openapi()
    openapi_path = Path(__file__).parent.parent / "openapi.json"
    with open(openapi_path, "w", encoding="utf-8") as f:
        json.dump(openapi_spec, f, indent=2)
    print(
        f"   OpenAPI specification successfully updated at '{openapi_path.resolve()}'"
    )

    print("\n" + "=" * 70)
    print("   ALL EPIC 22 ADMIN & MODERATION PLATFORM TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
