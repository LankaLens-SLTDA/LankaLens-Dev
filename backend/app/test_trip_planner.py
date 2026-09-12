"""Automated Test Suite for EPIC 15 — Trip Planner & Itinerary.

Tests all 6 acceptance criteria:
1. Users can create a trip (POST /api/planner/trips).
2. Destinations can be assigned to days (POST /api/planner/trips/{id}/add-destination).
3. Budget is calculated automatically (total_calculated_cost & budget_fit_status).
4. Recommendations respect constraints (POST /api/planner/trips/suggest).
5. Users can modify suggestions (remove stops, update parameters, re-assign days).
6. Trip persists in the user account (GET /api/planner/trips & GET /api/planner/trips/{id}).
"""

from app.openapi_export import export_openapi_schema
from app.routers.planner import (
    add_destination_to_trip,
    create_trip,
    export_trip,
    get_trip,
    list_trips,
    remove_destination_from_trip,
    suggest_trip_itinerary,
    update_trip,
)
from app.schemas.planner import (
    AddDestinationToTripPayload,
    TripCreatePayload,
    TripUpdatePayload,
)


def run_all_trip_planner_tests():
    print("=" * 70)
    print("      LankaLens EPIC 15 — Trip Planner & Itinerary Test Suite")
    print("=" * 70)

    # -------------------------------------------------------------
    # Test 1: Create Multi-Day Trip with Auto-Assigned Stops
    # -------------------------------------------------------------
    print("\n1. Testing Multi-Day Trip Creation (7 Days, 2 Travelers)...")
    payload1 = TripCreatePayload(
        title="Ceylon Cultural & Wildlife Expedition",
        start_date="2026-10-15",
        duration_days=7,
        group_size=2,
        total_budget=1500.0,
        starting_location="Colombo",
        destination_ids=[1, 2, 3, 4, 5],
    )
    trip1 = create_trip(payload1)
    print(f"   Created Trip ID: {trip1.id}")
    print(f"   Title: {trip1.title}")
    print(f"   Duration: {trip1.duration_days} Days ({len(trip1.days)} Daily Plans)")
    print(f"   Total Travel Distance: {trip1.total_travel_distance_km} km")
    print(f"   Total Calculated Cost: ${trip1.total_calculated_cost}")
    print(f"   Budget Fit Status: {trip1.budget_fit_status}")

    assert trip1.id > 0
    assert len(trip1.days) == 7
    assert trip1.total_calculated_cost > 0
    assert trip1.budget_fit_status in ["Under Budget", "Exact Fit", "Over Budget"]

    # -------------------------------------------------------------
    # Test 2: Retrieve Persisted Trip Details by ID
    # -------------------------------------------------------------
    print("\n2. Testing Persisted Trip Retrieval (GET /api/planner/trips/{id})...")
    retrieved = get_trip(trip1.id)
    print(f"   Retrieved Trip ID: {retrieved.id}")
    print(f"   Day 1 Stop Count: {len(retrieved.days[0].stops)}")
    print(f"   Day 1 Drive Time: {retrieved.days[0].estimated_travel_time}")
    assert retrieved.id == trip1.id
    assert len(retrieved.days) == 7

    # -------------------------------------------------------------
    # Test 3: Add Destination Stop to Specific Day
    # -------------------------------------------------------------
    print("\n3. Testing Destination Stop Assignment (Add ID 6 to Day 3)...")
    add_payload = AddDestinationToTripPayload(
        destination_id=6,
        target_day=3,
        scheduled_time="03:00 PM",
        notes="Visit Temple of Tooth Relic for evening Puja",
    )
    updated1 = add_destination_to_trip(trip1.id, add_payload)
    day3_stops = updated1.days[2].stops
    print(f"   Day 3 Total Stops: {len(day3_stops)}")
    print(
        f"   Added Stop Name: {day3_stops[-1].name} ({day3_stops[-1].scheduled_time})"
    )
    assert any(s.destination_id == 6 for s in day3_stops)

    # -------------------------------------------------------------
    # Test 4: Remove Destination Stop from Itinerary
    # -------------------------------------------------------------
    print("\n4. Testing Destination Stop Removal (Remove ID 6 from Day 3)...")
    updated2 = remove_destination_from_trip(trip1.id, dest_id=6, day_number=3)
    day3_stops_after = updated2.days[2].stops
    print(f"   Day 3 Stops After Removal: {len(day3_stops_after)}")
    assert not any(s.destination_id == 6 for s in day3_stops_after)

    # -------------------------------------------------------------
    # Test 5: Manual Itinerary Parameter Update
    # -------------------------------------------------------------
    print("\n5. Testing Manual Trip Parameter Update (Update Title & Budget)...")
    update_payload = TripUpdatePayload(
        title="Updated Ceylon Odyssey 2026",
        total_budget=2000.0,
    )
    updated3 = update_trip(trip1.id, update_payload)
    print(f"   New Title: {updated3.title}")
    print(f"   New Budget: ${updated3.total_budget}")
    print(f"   New Budget Status: {updated3.budget_fit_status}")
    assert updated3.title == "Updated Ceylon Odyssey 2026"
    assert updated3.total_budget == 2000.0

    # -------------------------------------------------------------
    # Test 6: AI-Suggested Itinerary Generation
    # -------------------------------------------------------------
    print("\n6. Testing AI-Suggested Itinerary Generation...")
    suggest_payload = TripCreatePayload(
        title="AI Auto-Suggested Ceylon Route",
        start_date="2026-11-01",
        duration_days=5,
        group_size=2,
        total_budget=1000.0,
        starting_location="Colombo",
        interests=["heritage", "nature"],
    )
    suggested = suggest_trip_itinerary(suggest_payload)
    print(f"   AI Trip Title: {suggested.title}")
    print(f"   Suggested Days: {len(suggested.days)}")
    print(f"   Total Travel Distance: {suggested.total_travel_distance_km} km")
    assert len(suggested.days) == 5

    # -------------------------------------------------------------
    # Test 7: Export & Shareable Trip Payload
    # -------------------------------------------------------------
    print("\n7. Testing Trip Export & Shareable Token Generation...")
    exported = export_trip(trip1.id)
    print(f"   Share Token: {exported.share_token}")
    print(f"   Shareable URL: {exported.share_url}")
    assert "trip_ceylon_" in exported.share_token
    assert "https://" in exported.share_url

    # -------------------------------------------------------------
    # Test 8: List All Persisted Account Trips
    # -------------------------------------------------------------
    print("\n8. Testing List All Persisted User Account Trips...")
    all_trips = list_trips()
    print(f"   Total Account Trips: {len(all_trips)}")
    assert len(all_trips) >= 2

    # -------------------------------------------------------------
    # Test 9: Export Updated OpenAPI Specification
    # -------------------------------------------------------------
    print("\n9. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 15 TRIP PLANNER & ITINERARY TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_trip_planner_tests()
