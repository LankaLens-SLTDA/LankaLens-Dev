"""Test suite for EPIC 20 — Trip Arrangement Broker."""

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.schemas.arrangements import (
    ArrangementMatchRequest,
    ArrangementModeEnum,
)
from app.services.arrangement_service import LocalArrangementService

client = TestClient(app)
service = LocalArrangementService()


def run_tests():
    print("=" * 70)
    print("   LankaLens EPIC 20 — Trip Arrangement Broker Test Suite")
    print("=" * 70)

    # 1. Test Guided Trip Arrangement Matching
    print("\n1. Testing Guided Trip Arrangement Matching (Guides & Agencies)...")
    guided_req = ArrangementMatchRequest(
        trip_id=1,
        mode=ArrangementModeEnum.GUIDED,
        destination_ids=[1, 101],  # Sigiriya & Dambulla
        starting_location="Colombo",
    )
    res = service.match_partners_for_trip(guided_req)
    assert res.mode == ArrangementModeEnum.GUIDED
    assert res.total_matched > 0
    assert all(
        item.partner.partner_type in ("guide", "agency")
        for item in res.matched_partners
    )
    print(f"   Guided Partners Matched: {res.total_matched}")
    top_match = res.matched_partners[0]
    print(
        f"   Top Match: {top_match.partner.business_name} ({top_match.partner.partner_type})"
    )
    print(f"   Match Score: {top_match.match_score}%")
    print(f"   Relevance: {top_match.relevance_reason}")

    # 2. Test Independent Travel Arrangement Matching
    print(
        "\n2. Testing Independent Travel Arrangement Matching (Hotels, Vehicles, Transport)..."
    )
    indep_req = ArrangementMatchRequest(
        trip_id=1,
        mode=ArrangementModeEnum.INDEPENDENT,
        destination_ids=[1, 3],  # Sigiriya & Ella
        starting_location="Colombo",
    )
    res_indep = service.match_partners_for_trip(indep_req)
    assert res_indep.mode == ArrangementModeEnum.INDEPENDENT
    assert res_indep.total_matched > 0
    assert all(
        item.partner.partner_type in ("hotel", "vehicle", "transport")
        for item in res_indep.matched_partners
    )
    print(f"   Independent Partners Matched: {res_indep.total_matched}")
    for item in res_indep.matched_partners[:3]:
        print(
            f"   - {item.partner.business_name} ({item.partner.partner_type}): "
            f"Score {item.match_score}%, Rate ${item.estimated_cost_per_day}/day"
        )

    # 3. Test API Endpoint POST /api/arrangements/match
    print("\n3. Testing API Endpoint POST /api/arrangements/match...")
    payload_data = {
        "trip_id": 101,
        "mode": "guided",
        "destination_ids": [1, 2],
        "starting_location": "Colombo",
    }
    http_res = client.post("/api/arrangements/match", json=payload_data)
    assert http_res.status_code == 200, f"Error: {http_res.text}"
    body = http_res.json()
    assert body["mode"] == "guided"
    assert len(body["matched_partners"]) > 0
    print(
        f"   HTTP 200 OK: {len(body['matched_partners'])} guided options returned via REST endpoint."
    )

    # 4. Test API Endpoint GET /api/arrangements/trip/{trip_id}
    print("\n4. Testing API Endpoint GET /api/arrangements/trip/{trip_id}...")
    http_res_trip = client.get("/api/arrangements/trip/1?mode=independent")
    assert http_res_trip.status_code == 200, f"Error: {http_res_trip.text}"
    body_trip = http_res_trip.json()
    assert body_trip["mode"] == "independent"
    print(
        f"   HTTP 200 OK: Saved Trip #1 returned {body_trip['total_matched']} independent service options."
    )

    # 5. Test Booking Referral Inquiry Submission
    print(
        "\n5. Testing Booking Referral Inquiry Flow (POST /api/arrangements/inquire)..."
    )
    inquiry_payload = {
        "trip_id": 1,
        "partner_id": 1,
        "arrangement_mode": "guided",
        "customer_name": "Samantha Miller",
        "customer_contact": "+94775551234",
        "customer_email": "samantha.m@example.com",
        "start_date": "2026-11-10",
        "end_date": "2026-11-15",
        "group_size": 2,
        "custom_notes": "Require driver guide with cultural triangle expertise",
    }
    inquiry_res = client.post("/api/arrangements/inquire", json=inquiry_payload)
    assert inquiry_res.status_code == 201, f"Error: {inquiry_res.text}"
    inquiry_body = inquiry_res.json()
    referral_code = inquiry_body["referral_code"]
    assert referral_code.startswith("LL-REF-")
    assert inquiry_body["status"] == "pending"
    print("   Referral Inquiry Submitted Successfully!")
    print(f"   Referral Code: {referral_code}")
    print(
        f"   Partner: {inquiry_body['partner_name']} ({inquiry_body['partner_type']})"
    )
    print(
        f"   Customer: {inquiry_body['customer_name']} ({inquiry_body['customer_contact']})"
    )
    print(f"   Estimated Cost: ${inquiry_body['estimated_cost']}")

    # 6. Test Referral Inquiry Tracking by Code
    print(
        "\n6. Testing Referral Tracking Lookup (GET /api/arrangements/referrals/{code})..."
    )
    track_res = client.get(f"/api/arrangements/referrals/{referral_code}")
    assert track_res.status_code == 200, f"Error: {track_res.text}"
    track_body = track_res.json()
    assert track_body["referral_code"] == referral_code
    assert track_body["customer_name"] == "Samantha Miller"
    print(
        f"   HTTP 200 OK: Retrieved referral status for {referral_code} -> Status: {track_body['status']}"
    )

    # 7. OpenAPI Export Verification
    print("\n7. Exporting Updated OpenAPI Specification...")
    openapi_spec = app.openapi()
    openapi_path = Path(__file__).parent.parent / "openapi.json"
    with open(openapi_path, "w", encoding="utf-8") as f:
        json.dump(openapi_spec, f, indent=2)
    print(
        f"   OpenAPI specification successfully updated at '{openapi_path.resolve()}'"
    )

    print("\n" + "=" * 70)
    print("   ALL EPIC 20 TRIP ARRANGEMENT BROKER TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
