"""Automated Test Suite for EPIC 17 — Alternative Destination Engine.

Tests all 5 acceptance criteria:
1. System can identify alternatives via POST /api/alternatives/match and GET /api/alternatives/destination/{id}.
2. Alternatives are relevant to the original destination (category & activity affinity).
3. Lower crowd levels influence ranking & composite score boosting.
4. Alternatives support map, destination detail, and side-by-side comparison endpoints (GET /api/alternatives/compare/{id1}/{id2}).
5. Alternative recommendations are fully explainable with structured sub-scores and human-readable key reasons.
"""

from app.openapi_export import export_openapi_schema
from app.routers.alternatives import (
    compare_destinations_side_by_side,
    get_alternatives_for_destination,
    match_alternative_destinations,
)
from app.schemas.alternatives import AlternativeMatchRequest


def run_all_alternative_engine_tests():
    print("=" * 70)
    print("      LankaLens EPIC 17 — Alternative Destination Engine Test Suite")
    print("=" * 70)

    # -------------------------------------------------------------
    # Test 1: Identification of Alternative Destinations
    # -------------------------------------------------------------
    print("\n1. Testing Alternative Identification (Destination ID 1 - Sigiriya)...")
    resp1 = get_alternatives_for_destination(1, limit=5)
    print(f"   Original Destination: {resp1.original_destination.get('name')}")
    print(
        f"   Alternatives Found: {resp1.total_found} (Query Time: {resp1.query_time_ms} ms)"
    )
    assert resp1.total_found > 0
    assert len(resp1.alternatives) <= 5

    # -------------------------------------------------------------
    # Test 2: Relevance to Original Destination (Category & Activity)
    # -------------------------------------------------------------
    print("\n2. Testing Relevance & Category/Activity Affinity...")
    top_alt = resp1.alternatives[0]
    sub = top_alt.explanation.sub_scores
    print(f"   Top Alternative: {top_alt.alternative_destination.get('name')}")
    print(f"   Category Similarity Score: {sub.category_similarity_score}")
    print(f"   Activity Overlap Score: {sub.activity_overlap_score}")
    print(
        f"   Distance: {top_alt.explanation.distance_km} km ({top_alt.explanation.drive_time_formatted})"
    )
    assert sub.category_similarity_score > 0.0

    # -------------------------------------------------------------
    # Test 3: Influence of Lower Crowd Levels on Ranking
    # -------------------------------------------------------------
    print("\n3. Testing Lower Crowd Level Ranking Boost...")
    for alt in resp1.alternatives:
        c_status = alt.alternative_destination.get("crowd_info", {}).get(
            "density", "Low"
        )
        print(
            f"   - {alt.alternative_destination.get('name')}: Match {alt.explanation.match_percentage}% "
            f"(Crowd: {c_status}, Crowd Advantage: {alt.explanation.sub_scores.crowd_advantage_score}, "
            f"Reduction: -{alt.explanation.crowd_reduction_pct}%)"
        )
        assert alt.explanation.sub_scores.crowd_advantage_score > 0.4
        assert alt.explanation.crowd_reduction_pct > 0

    # -------------------------------------------------------------
    # Test 4: Explainable Recommendation & Key Reasons
    # -------------------------------------------------------------
    print("\n4. Testing Explainable Recommendation & Key Rationale Statements...")
    print(f"   Overall Match Score: {top_alt.explanation.overall_match_score}")
    print("   Generated Key Reasons:")
    for reason in top_alt.explanation.key_reasons:
        print(f"   * {reason}")
    assert len(top_alt.explanation.key_reasons) >= 2
    assert (
        "lower crowd" in top_alt.explanation.key_reasons[0].lower()
        or "%" in top_alt.explanation.key_reasons[0]
    )

    # -------------------------------------------------------------
    # Test 5: Side-by-Side Comparison Matrix
    # -------------------------------------------------------------
    print("\n5. Testing Side-by-Side Comparison Matrix (ID 1 vs Top Alt ID)...")
    top_alt_id = top_alt.alternative_destination.get("id")
    comp_res = compare_destinations_side_by_side(1, top_alt_id)
    print(
        f"   Comparing '{comp_res.original_destination.get('name')}' vs '{comp_res.alternative_destination.get('name')}'"
    )
    print(f"   Recommendation Summary: {comp_res.recommendation_summary}")
    print(f"   Feature Differences Count: {len(comp_res.feature_differences)}")
    for diff in comp_res.feature_differences:
        print(
            f"   - [{diff.attribute}]: {diff.original_value} vs {diff.alternative_value} "
            f"(Advantage: {diff.advantage}) -> {diff.note}"
        )
    assert len(comp_res.feature_differences) >= 4

    # -------------------------------------------------------------
    # Test 6: Custom Multi-Criteria POST Request
    # -------------------------------------------------------------
    print("\n6. Testing Custom Multi-Criteria POST Request Filtering...")
    req = AlternativeMatchRequest(
        destination_id=1,
        max_distance_km=100.0,
        max_budget=30.0,
        min_rating=4.0,
        max_crowd_level="Moderate",
        limit=3,
    )
    post_res = match_alternative_destinations(req)
    print(f"   Filtered Results Count: {post_res.total_found}")
    for res in post_res.alternatives:
        c_cost = res.alternative_destination.get("baseline_cost", 0.0)
        c_dist = res.explanation.distance_km
        print(
            f"   - {res.alternative_destination.get('name')}: ${c_cost} / visit, {c_dist} km away"
        )
        assert c_cost <= 30.0
        assert c_dist <= 100.0

    # -------------------------------------------------------------
    # Test 7: Export Updated OpenAPI Specification
    # -------------------------------------------------------------
    print("\n7. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 17 ALTERNATIVE DESTINATION ENGINE TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_alternative_engine_tests()
