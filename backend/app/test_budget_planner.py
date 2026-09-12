"""Automated Test Suite for EPIC 14 — Smart Budget Planner.

Tests all 6 acceptance criteria:
1. User can calculate a trip estimate (POST /api/planner/calculate-budget).
2. Costs are itemized into 5 categories (Accommodation, Transport, Food, Activities, Misc).
3. Total budget, per-person cost, and daily cost are calculated.
4. Budget influences recommendations (POST /api/planner/budget-recommendations).
5. Static baseline rates work deterministically without requiring ML models.
6. Architecture supports future ML pricing via BaseBudgetEstimator & MLBudgetPricingAdapter.
"""

from app.openapi_export import export_openapi_schema
from app.routers.planner import (
    calculate_trip_budget,
    get_budget_recommendations,
    get_planner_data,
)
from app.schemas.planner import BudgetCalculationRequest, BudgetRecommendationRequest
from app.services.budget_service import (
    DeterministicBudgetEstimator,
    MLBudgetPricingAdapter,
)


def run_all_budget_planner_tests():
    print("=" * 70)
    print("      LankaLens EPIC 14 — Smart Budget Planner Test Suite")
    print("=" * 70)

    # -------------------------------------------------------------
    # Test 1: GET Planner Overview Baseline Endpoint
    # -------------------------------------------------------------
    print("\n1. Testing GET /api/planner overview endpoint...")
    overview = get_planner_data()
    print(f"   Total Days: {len(overview['days'])}")
    print(f"   Calculated Baseline Total Budget: ${overview['totalBudget']}")
    print(
        f"   Breakdown Categories: {[b['name'] for b in overview['budgetBreakdown']]}"
    )
    assert len(overview["days"]) == 5
    assert overview["totalBudget"] > 0
    assert len(overview["budgetBreakdown"]) == 5

    # -------------------------------------------------------------
    # Test 2: Calculate Itemized Trip Estimate (1 Traveler, 5 Days, Mid-Range)
    # -------------------------------------------------------------
    print("\n2. Testing Itemized Trip Calculation (1 Traveler, 5 Days, Mid-Range)...")
    req1 = BudgetCalculationRequest(
        travellers_count=1,
        duration_days=5,
        accommodation_style="mid_range",
        transport_mode="private_car",
        food_preference="mid_tier_restaurants",
        activity_level="moderate_cultural",
    )
    res1 = calculate_trip_budget(req1)
    print(f"   Total Trip Budget: ${res1.total_budget}")
    print(f"   Cost Per Person: ${res1.per_person_budget}")
    print(f"   Cost Per Day: ${res1.per_day_budget}")
    print(f"   Travel Style Tier: {res1.travel_style_tier}")
    print(f"   Itemized Categories ({len(res1.breakdown)}):")
    for item in res1.breakdown:
        print(
            f"   - {item.category}: ${item.amount} ({item.percentage}%) -> {item.description}"
        )

    assert res1.total_budget > 0
    assert res1.per_person_budget == res1.total_budget
    assert res1.per_day_budget == round(res1.total_budget / 5, 2)
    assert len(res1.breakdown) == 5

    # Check 5 categories present
    cats = {item.category for item in res1.breakdown}
    expected_cats = {
        "Accommodation",
        "Transport",
        "Food & Dining",
        "Activities & Experiences",
        "Miscellaneous & Emergency",
    }
    assert expected_cats.issubset(cats)

    # -------------------------------------------------------------
    # Test 3: Group Size & Travel Tier Multipliers (4 Travelers, 10 Days, Luxury)
    # -------------------------------------------------------------
    print(
        "\n3. Testing Group & Travel Tier Multipliers (4 Travelers, 10 Days, Luxury)..."
    )
    req2 = BudgetCalculationRequest(
        travellers_count=4,
        duration_days=10,
        accommodation_style="luxury",
        transport_mode="flight",
        food_preference="fine_dining",
        activity_level="all_inclusive_safari",
        destination_ids=[1, 2, 3],
    )
    res2 = calculate_trip_budget(req2)
    print(f"   Total Group Budget: ${res2.total_budget}")
    print(f"   Per-Person Budget: ${res2.per_person_budget}")
    print(f"   Travel Tier: {res2.travel_style_tier}")
    assert res2.total_budget > res1.total_budget
    assert res2.per_person_budget > res1.per_person_budget

    # -------------------------------------------------------------
    # Test 4: Budget-Fitted Destination Recommendations
    # -------------------------------------------------------------
    print("\n4. Testing Budget-Fitted Recommendations (Max Budget: $600)...")
    rec_req = BudgetRecommendationRequest(
        max_budget=600.0,
        travellers_count=2,
        duration_days=4,
    )
    rec_res = get_budget_recommendations(rec_req)
    print(f"   Recommended Destinations Count: {len(rec_res.recommended_destinations)}")
    print(f"   Estimated Trip Cost: ${rec_res.estimated_trip_cost}")
    print(f"   Budget Fit Status: {rec_res.budget_fit_status}")
    print(f"   Budget Utilization: {rec_res.budget_utilization_pct}%")
    for d in rec_res.recommended_destinations:
        print(f"   - {d['name']} (Cost: ${d['baseline_cost']}, Rating: {d['rating']})")

    assert len(rec_res.recommended_destinations) > 0
    assert rec_res.estimated_trip_cost > 0
    assert rec_res.budget_fit_status in ["Under Budget", "Exact Fit", "Over Budget"]

    # -------------------------------------------------------------
    # Test 5: Abstract Base Class & ML Pricing Adapter Fallback
    # -------------------------------------------------------------
    print("\n5. Testing Abstract Base Class & ML Pricing Adapter Interface...")
    adapter = MLBudgetPricingAdapter(DeterministicBudgetEstimator())
    adapter_res = adapter.calculate_trip_budget(req1)
    print(f"   Calculation Model String: {adapter_res.calculation_model}")
    print(f"   Total Budget: ${adapter_res.total_budget}")
    assert "ML Dynamic Pricing Adapter" in adapter_res.calculation_model
    assert adapter_res.total_budget == res1.total_budget

    # -------------------------------------------------------------
    # Test 6: Export OpenAPI Specification
    # -------------------------------------------------------------
    print("\n6. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 14 SMART BUDGET PLANNER TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_budget_planner_tests()
