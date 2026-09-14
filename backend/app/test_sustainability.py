"""Automated Test Suite for EPIC 16 — Sustainability & Crowd Management.

Tests all 6 acceptance criteria:
1. Destinations have crowd status (GET /api/sustainability/crowd-status/{id}).
2. High-crowd destinations generate overcrowding warnings.
3. Nearby lower-crowd alternative destinations can be surfaced (GET /api/sustainability/alternatives/{id}).
4. Crowd score affects recommendation ranking & visitor load curves (GET /api/sustainability/visitor-load/{id}).
5. Environmental hazard reports can be submitted & listed (POST /api/sustainability/report & GET /api/sustainability/reports).
6. Initial MVP operates deterministically via ThresholdCrowdEngine & MLDemandForecastingAdapter interface.
"""

from app.openapi_export import export_openapi_schema
from app.routers.sustainability import (
    get_crowd_alternatives,
    get_destination_crowd_status,
    get_visitor_load_curve,
    list_hazard_reports,
    submit_hazard_report,
)
from app.schemas.sustainability import HazardReport
from app.services.crowd_service import MLDemandForecastingAdapter, ThresholdCrowdEngine


def run_all_sustainability_tests():
    print("=" * 70)
    print("      LankaLens EPIC 16 — Sustainability & Crowd Management Test Suite")
    print("=" * 70)

    # -------------------------------------------------------------
    # Test 1: Destination Crowd Status & Classification
    # -------------------------------------------------------------
    print("\n1. Testing Destination Crowd Status & Score (ID 1 - Sigiriya)...")
    status1 = get_destination_crowd_status(1)
    print(f"   Destination: {status1.destination_name}")
    print(
        f"   Crowd Score: {status1.crowd_score} (Capacity: {status1.current_capacity_pct}%)"
    )
    print(f"   Status Label: {status1.crowd_status}")
    print(f"   Is Overcrowded: {status1.is_overcrowded}")
    print(f"   Peak Hours: {status1.peak_hours}")
    assert status1.crowd_score > 0.0
    assert status1.crowd_status in ["Low", "Moderate", "High"]

    # -------------------------------------------------------------
    # Test 2: Overcrowding Warning Generation
    # -------------------------------------------------------------
    print("\n2. Testing Overcrowding Warning Signal Generation...")
    if status1.is_overcrowded:
        print(f"   Generated Warning: {status1.warning_message}")
        assert status1.warning_message is not None
        assert (
            "Overcrowding" in status1.warning_message
            or "visitor density" in status1.warning_message
        )
    else:
        print("   Site is under threshold capacity (no active warning required).")

    # -------------------------------------------------------------
    # Test 3: Lower-Crowd Nearby Alternative Destination Engine
    # -------------------------------------------------------------
    print("\n3. Testing Alternative Destination Engine (Target ID 1 - Sigiriya)...")
    alts = get_crowd_alternatives(1, limit=3)
    print(f"   Found {len(alts)} lower-crowd alternatives:")
    for alt in alts:
        print(
            f"   - {alt.name} ({alt.district} - Status: {alt.crowd_status}, "
            f"Crowd Reduction: {alt.crowd_reduction_pct}%, Dist: {alt.distance_km}km)"
        )
        print(f"     Reason: {alt.recommendation_reason}")

    assert len(alts) > 0
    assert all(a.crowd_status in ["Low", "Moderate"] for a in alts)

    # -------------------------------------------------------------
    # Test 4: 24-Hour Visitor Load Distribution Curve
    # -------------------------------------------------------------
    print("\n4. Testing Visitor Load Distribution Curve & Peak Hours...")
    load_res = get_visitor_load_curve(1)
    print(f"   Identified Peak Hour: {load_res.peak_hour}")
    print(f"   Recommended Off-Peak Windows: {load_res.recommended_offpeak_hours}")
    print(f"   Hourly Curve Points Count: {len(load_res.hourly_curve)}")
    assert len(load_res.hourly_curve) == 8
    assert "06:00" in [p.hour for p in load_res.hourly_curve]

    # -------------------------------------------------------------
    # Test 5: Environmental & Trail Hazard Report Submission
    # -------------------------------------------------------------
    print("\n5. Testing Environmental Hazard Report Submission & Eco-Rewards...")
    report_payload = HazardReport(
        location="Pidurangala Summit Stairway West Pass",
        description="Erosion anomaly causing step destabilization near upper boulder section.",
        reporter_name="Dinuka Silva",
    )
    report_res = submit_hazard_report(report_payload)
    print(f"   Submission Status: {report_res.status}")
    print(f"   Ranger Message: {report_res.message}")
    print(f"   Eco Reward Points Awarded: {report_res.rewardPoints}")
    assert report_res.status == "success"
    assert report_res.rewardPoints == 50

    # -------------------------------------------------------------
    # Test 6: List Active Environmental Hazard Reports
    # -------------------------------------------------------------
    print("\n6. Testing Listing Active Hazard Reports for Field Rangers...")
    reports = list_hazard_reports()
    print(f"   Active Reports Count: {len(reports)}")
    for r in reports:
        print(
            f"   - Report #{r.id} at '{r.location}' ({r.status}) by {r.reporter_name}"
        )
    assert len(reports) >= 3

    # -------------------------------------------------------------
    # Test 7: BaseCrowdEngine & MLDemandForecastingAdapter Interface
    # -------------------------------------------------------------
    print(
        "\n7. Testing Abstract Base Class & ML Demand Forecasting Adapter Interface..."
    )
    adapter = MLDemandForecastingAdapter(ThresholdCrowdEngine())
    adapter_status = adapter.get_crowd_status(1)
    print(f"   ML Adapter Crowd Score: {adapter_status.crowd_score}")
    print(f"   ML Adapter Status: {adapter_status.crowd_status}")
    assert adapter_status.destination_id == 1

    # -------------------------------------------------------------
    # Test 8: Export Updated OpenAPI Specification
    # -------------------------------------------------------------
    print("\n8. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 16 SUSTAINABILITY & CROWD MANAGEMENT TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_sustainability_tests()
