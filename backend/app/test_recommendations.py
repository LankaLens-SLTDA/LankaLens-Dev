import sys
from pathlib import Path

# Add backend parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.openapi_export import export_openapi_schema
from app.routers.destinations import IN_MEMORY_DESTINATIONS, format_destination_record
from app.routers.recommendations import (
    get_personalized_recommendations,
    get_quick_recommendations,
)
from app.schemas.recommendations import UserRecommendationRequest
from app.services.recommendation_engine import (
    BaseRecommender,
    MLPipelineAdapter,
)


def run_recommendation_tests():
    print("=" * 70)
    print("      LankaLens EPIC 13 — Recommendation Engine Test Suite")
    print("=" * 70)

    # ------------------------------------------------------------------
    # 1. Test Input Parameter Sensitivity (Heritage vs Surfing)
    # ------------------------------------------------------------------
    print("\n1. Testing Interest Sensitivity (Heritage vs Surfing)...")
    req_heritage = UserRecommendationRequest(
        interests=["Heritage", "History"],
        travel_style="Cultural Explorer",
        max_budget_per_day=50.0,
        crowd_tolerance="medium",
    )
    res_heritage = get_personalized_recommendations(req_heritage)
    recs_h = res_heritage["recommendations"]
    top_h = recs_h[0]["destination"]
    print(
        f"   Heritage Request Top Match: {top_h['title']} (Match: {recs_h[0]['match_percentage']}%)"
    )
    assert "temple" in top_h["category"] or "heritage" in top_h["category"], (
        "Heritage request should prioritize cultural/heritage sites"
    )

    req_beach = UserRecommendationRequest(
        interests=["Surfing", "Whale Watching"],
        travel_style="Adventure Seeker",
        max_budget_per_day=50.0,
        crowd_tolerance="medium",
    )
    res_beach = get_personalized_recommendations(req_beach)
    recs_b = res_beach["recommendations"]
    top_b = recs_b[0]["destination"]
    print(
        f"   Surfing Request Top Match: {top_b['title']} (Match: {recs_b[0]['match_percentage']}%)"
    )
    assert "beach" in top_b["category"] or "nature" in top_b["category"], (
        "Beach/surfing request should prioritize coastal sites"
    )

    # ------------------------------------------------------------------
    # 2. Test Budget Constraint Influence ($10 vs $100/day)
    # ------------------------------------------------------------------
    print("\n2. Testing Budget Constraint Influence ($10 vs $100/day)...")
    req_low_budget = UserRecommendationRequest(
        interests=["Heritage", "Nature"],
        max_budget_per_day=5.0,  # Tight budget
        travel_style="Budget Backpacker",
    )
    res_low_budget = get_personalized_recommendations(req_low_budget)
    top_low = res_low_budget["recommendations"][0]
    print(
        f"   $5 Budget Top Match: {top_low['destination']['title']} (Cost: ${top_low['destination']['baseline_cost']})"
    )
    assert top_low["destination"]["baseline_cost"] <= 10.0, (
        "Low budget should favor free or low entry fee destinations"
    )

    # ------------------------------------------------------------------
    # 3. Test Crowd Tolerance Alignment ("low" vs "high")
    # ------------------------------------------------------------------
    print("\n3. Testing Crowd Tolerance Alignment ('low' vs 'high')...")
    req_low_crowd = UserRecommendationRequest(
        interests=["Hiking", "Nature"],
        crowd_tolerance="low",
        max_budget_per_day=100.0,
    )
    res_low_crowd = get_personalized_recommendations(req_low_crowd)
    top_crowd = res_low_crowd["recommendations"][0]
    print(
        f"   Low Crowd Request Top Match: {top_crowd['destination']['title']} (Density: {top_crowd['destination']['crowd_info']['density']})"
    )
    assert top_crowd["explanation"]["score_breakdown"]["crowd_score"] >= 0.60

    # ------------------------------------------------------------------
    # 4. Test Explainability Breakdown & Reasoning Generator
    # ------------------------------------------------------------------
    print("\n4. Testing Explainability Breakdown & Reasoning Output...")
    rec_sample = res_heritage["recommendations"][0]
    explanation = rec_sample["explanation"]
    print(f"   Match Percentage: {rec_sample['match_percentage']}%")
    print(f"   Score Breakdown: {explanation['score_breakdown']}")
    print("   Generated Reasons:")
    for reason in explanation["reasons"]:
        print(f"   - {reason}")
    assert "score_breakdown" in explanation
    assert len(explanation["reasons"]) > 0, "Should generate explainability reasons"

    # ------------------------------------------------------------------
    # 5. Test Quick GET Recommendation Query
    # ------------------------------------------------------------------
    print("\n5. Testing Quick GET Recommendation Endpoint...")
    res_quick = get_quick_recommendations(
        interests="Tea Tasting,Hiking", max_budget=40.0, crowd_tolerance="low", limit=3
    )
    print(
        f"   Quick Recs Count: {res_quick['total']} (Execution Time: {res_quick['query_time_ms']}ms)"
    )
    assert res_quick["total"] > 0, "Quick recommendations should return results"

    # ------------------------------------------------------------------
    # 6. Test BaseRecommender Contract & MLPipelineAdapter
    # ------------------------------------------------------------------
    print("\n6. Testing BaseRecommender & MLPipelineAdapter Interface...")
    adapter = MLPipelineAdapter()
    assert isinstance(adapter, BaseRecommender), (
        "MLPipelineAdapter must implement BaseRecommender"
    )
    raw_dataset = [format_destination_record(d) for d in IN_MEMORY_DESTINATIONS]
    ml_res = adapter.recommend(req_heritage.model_dump(), raw_dataset)
    print(f"   ML Adapter Response Model: {ml_res['engine_metadata']['model_name']}")
    assert ml_res["engine_metadata"]["supports_ml_pipeline"] is True

    # ------------------------------------------------------------------
    # 7. Export OpenAPI JSON
    # ------------------------------------------------------------------
    print("\n7. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 13 RECOMMENDATION ENGINE TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_recommendation_tests()
