"""Test suite for EPIC 21 — Contributor -> Trusted Guide Marketplace Pipeline."""

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def run_tests():
    print("=" * 70)
    print("   LankaLens EPIC 21 — Contributor -> Trusted Guide Pipeline Test Suite")
    print("=" * 70)

    # 1. Test Automatic Guide Eligibility Calculation for Trusted Contributor
    print("\n1. Testing Automatic Guide Eligibility Calculation (Chaminda Perera)...")
    res_chaminda = client.get("/api/reputation/eligibility/Chaminda Perera")
    assert res_chaminda.status_code == 200, f"Error: {res_chaminda.text}"
    body_chaminda = res_chaminda.json()
    assert body_chaminda["is_eligible"] is True
    assert body_chaminda["guide_level"] == "certified_trusted_guide"
    assert body_chaminda["preferential_commission_pct"] == 5.0
    print(f"   Author: {body_chaminda['author_name']}")
    print(f"   Rank: {body_chaminda['rank']}")
    print(f"   Eligible Level: {body_chaminda['guide_level']}")
    print(
        f"   Preferential Commission: {body_chaminda['preferential_commission_pct']}%"
    )
    print("   Criteria Checklist:")
    for crit in body_chaminda["criteria_breakdown"]:
        status_icon = "PASS" if crit["passed"] else "FAIL"
        print(
            f"   - [{status_icon}] {crit['metric']}: Actual '{crit['actual_value']}' (Req '{crit['required_value']}')"
        )

    # 2. Test Eligibility Calculation for Ineligible Contributor
    print("\n2. Testing Eligibility Checklist for New Contributor (NewbieExplorer)...")
    res_newbie = client.get("/api/reputation/eligibility/NewbieExplorer")
    assert res_newbie.status_code == 200, f"Error: {res_newbie.text}"
    body_newbie = res_newbie.json()
    assert body_newbie["is_eligible"] is False
    assert body_newbie["guide_level"] == "not_eligible"
    print(
        f"   Newbie Status: Eligible = {body_newbie['is_eligible']} ({body_newbie['guide_level']})"
    )

    # 3. Test Contributor Upgrade to Listed Local Partner Guide
    print(
        "\n3. Testing Contributor Upgrade to Listed Guide (POST /api/reputation/upgrade-to-partner)..."
    )
    upgrade_payload = {
        "author_name": "Chaminda Perera",
        "contact_number": "+94771239988",
        "district": "Matale",
        "province": "Central",
        "sltda_license_number": "SLTDA/NTG/2026/0991",
        "niche_specialization": "Sigiriya Wildlife & Cultural Heritage",
        "baseline_rate": 45.00,
        "services": [
            "Sigiriya Sunrise Heritage Walking Tours",
            "Elephant Corridor Wildlife Tracking",
            "Ancient Rock Interpretation",
        ],
        "associated_destination_ids": [1, 101],
        "custom_title": "Chaminda Perera — Master Heritage & Wildlife Guide",
    }
    upgrade_res = client.post(
        "/api/reputation/upgrade-to-partner", json=upgrade_payload
    )
    assert upgrade_res.status_code == 201, f"Error: {upgrade_res.text}"
    upgrade_body = upgrade_res.json()

    assert upgrade_body["author_name"] == "Chaminda Perera"
    assert upgrade_body["partner_type"] == "guide"
    assert upgrade_body["preferential_commission_pct"] == 5.0
    assert upgrade_body["hidden_gem_badge"] is True
    assert upgrade_body["featured_tier"] == "gold"
    partner_id = upgrade_body["partner_id"]

    print(
        f"   Success! Contributor '{upgrade_body['author_name']}' converted into Listed Guide Partner #{partner_id}"
    )
    print(f"   Listing Title: {upgrade_body['business_name']}")
    print(
        f"   Preferential Commission: {upgrade_body['preferential_commission_pct']}% (vs 15% standard)"
    )
    print(f"   Matching Boost: +{upgrade_body['matching_boost_pct']}%")
    print(f"   Hidden-Gem Badge: {upgrade_body['hidden_gem_badge']}")

    # 4. Test Partner Profile Retrieval via Partner Network Endpoint
    print("\n4. Testing Partner Network Retrieval (GET /api/partners/{partner_id})...")
    partner_res = client.get(f"/api/partners/{partner_id}")
    assert partner_res.status_code == 200, f"Error: {partner_res.text}"
    partner_body = partner_res.json()
    assert partner_body["contributor_author_name"] == "Chaminda Perera"
    assert partner_body["contributor_eco_points"] >= 750
    assert partner_body["preferential_commission_pct"] == 5.0
    print(f"   Retrieved Listed Partner #{partner_id}: {partner_body['business_name']}")
    print(
        f"   Preserved History: {partner_body['contributor_rank']} • {partner_body['contributor_eco_points']} Eco-Points"
    )

    # 5. Test Arrangement Broker Matching with Converted Contributor Guide
    print("\n5. Testing Trip Arrangement Broker Matching with Converted Guide...")
    match_payload = {
        "trip_id": 1,
        "mode": "guided",
        "destination_ids": [1, 101],
        "starting_location": "Colombo",
    }
    match_res = client.post("/api/arrangements/match", json=match_payload)
    assert match_res.status_code == 200, f"Error: {match_res.text}"
    match_body = match_res.json()

    # Find Chaminda's partner listing in matches
    chaminda_match = next(
        (m for m in match_body["matched_partners"] if m["partner"]["id"] == partner_id),
        None,
    )
    assert (
        chaminda_match is not None
    ), "Converted guide missing from arrangement matches!"
    assert chaminda_match["match_score"] >= 95.0
    print(f"   Arrangement Match Found: {chaminda_match['partner']['business_name']}")
    print(
        f"   Match Score: {chaminda_match['match_score']}% (with +10% Contributor Boost)"
    )
    print(f"   Relevance: {chaminda_match['relevance_reason']}")

    # 6. Exporting OpenAPI Specification
    print("\n6. Exporting Updated OpenAPI Specification...")
    openapi_spec = app.openapi()
    openapi_path = Path(__file__).parent.parent / "openapi.json"
    with open(openapi_path, "w", encoding="utf-8") as f:
        json.dump(openapi_spec, f, indent=2)
    print(
        f"   OpenAPI specification successfully updated at '{openapi_path.resolve()}'"
    )

    print("\n" + "=" * 70)
    print("   ALL EPIC 21 CONTRIBUTOR -> TRUSTED GUIDE PIPELINE TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
