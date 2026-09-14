import json
import os

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analytics_suite():
    print("\n================================================ catalog ===")
    print("   LankaLens EPIC 23 — Analytics & Intelligence Test Suite   ")
    print("============================================================")

    # 1. Test Ingesting Telemetry Event with PII Sanitization
    print("\n1. Testing Anonymized Telemetry Event Ingestion & PII Sanitization...")
    payload_with_pii = {
        "session_id": "sess_test_9901",
        "user_id": "usr_test_100",
        "category": "sustainability",
        "event_name": "high_crowd_warning_viewed",
        "entity_type": "destination",
        "entity_id": "1",
        "properties": {
            "destination_name": "Sigiriya Ancient Rock Fortress",
            "crowd_density": "High",
            "email": "user_secret@example.com",  # Should be stripped
            "phone": "+94771234567",  # Should be stripped
        },
        "device_type": "desktop",
    }
    response = client.post("/api/analytics/track", json=payload_with_pii)
    assert (
        response.status_code == 201
    ), f"Expected 201, got {response.status_code}: {response.text}"
    event_data = response.json()
    assert event_data["event_name"] == "high_crowd_warning_viewed"
    assert "email" not in event_data["properties"], "PII email was NOT sanitized!"
    assert "phone" not in event_data["properties"], "PII phone was NOT sanitized!"
    assert (
        event_data["properties"]["destination_name"] == "Sigiriya Ancient Rock Fortress"
    )
    print("   Successfully tracked telemetry event with PII sanitization.")

    # 2. Test Tracking Alternative Accepted Event
    print("\n2. Testing Alternative Destination Acceptance Tracking...")
    alt_payload = {
        "session_id": "sess_test_9901",
        "user_id": "usr_test_100",
        "category": "sustainability",
        "event_name": "alternative_accepted",
        "entity_type": "destination",
        "entity_id": "2",
        "properties": {
            "original_destination": "Sigiriya",
            "accepted_destination": "Pidurangala Rock",
        },
        "device_type": "desktop",
    }
    response = client.post("/api/analytics/track", json=alt_payload)
    assert response.status_code == 201
    print("   Successfully tracked alternative destination acceptance event.")

    # 3. Test Dashboard Aggregated Metrics
    print(
        "\n3. Testing Aggregated Product Intelligence Dashboard (GET /api/analytics/dashboard)..."
    )
    dashboard_res = client.get("/api/analytics/dashboard")
    assert (
        dashboard_res.status_code == 200
    ), f"Expected 200, got {dashboard_res.status_code}"
    dashboard_data = dashboard_res.json()
    assert dashboard_data["total_events"] >= 2
    assert dashboard_data["active_sessions"] >= 1
    assert "alternative_acceptance_rate" in dashboard_data
    assert "marketplace_conversion_rate" in dashboard_data
    assert "category_breakdown" in dashboard_data
    print(f"   Total Telemetry Events: {dashboard_data['total_events']}")
    print(f"   Active Sessions: {dashboard_data['active_sessions']}")
    print(
        f"   Alternative Acceptance Rate: {dashboard_data['alternative_acceptance_rate']}%"
    )
    print(
        f"   Marketplace Conversion Rate: {dashboard_data['marketplace_conversion_rate']}%"
    )

    # 4. Test Key Conversion Funnels
    print("\n4. Testing Multi-Stage Conversion Funnels (GET /api/analytics/funnels)...")
    funnels_res = client.get("/api/analytics/funnels")
    assert funnels_res.status_code == 200
    funnels = funnels_res.json()
    assert len(funnels) >= 2
    sustainability_funnel = next(
        (f for f in funnels if "Sustainability" in f["funnel_name"]), None
    )
    assert sustainability_funnel is not None
    assert len(sustainability_funnel["stages"]) == 3
    print(
        f"   {sustainability_funnel['funnel_name']}: Overall Conversion = {sustainability_funnel['overall_conversion_rate']}%"
    )

    # 5. Test Querying Filtered Telemetry Events
    print(
        "\n5. Testing Filtered Anonymized Telemetry Event Stream (GET /api/analytics/events)..."
    )
    events_res = client.get("/api/analytics/events?category=sustainability")
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) > 0
    assert all(e["category"] == "sustainability" for e in events)
    print(f"   Retrieved {len(events)} sustainability category telemetry records.")

    # 6. Export Updated OpenAPI Spec
    print("\n6. Exporting Updated OpenAPI Specification...")
    openapi_spec = app.openapi()
    openapi_path = os.path.join(os.path.dirname(__file__), "..", "openapi.json")
    with open(openapi_path, "w", encoding="utf-8") as f:
        json.dump(openapi_spec, f, indent=2)
    print(f"   OpenAPI specification updated at '{openapi_path}'")

    print("\n============================================================")
    print("   ALL EPIC 23 ANALYTICS & INTELLIGENCE TESTS PASSED!       ")
    print("============================================================\n")


if __name__ == "__main__":
    test_analytics_suite()
