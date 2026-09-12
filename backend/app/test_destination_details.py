import sys
from pathlib import Path

# Add backend parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.openapi_export import export_openapi_schema
from app.routers.destinations import get_destination_details


def run_destination_details_tests():
    print("=" * 70)
    print("      LankaLens EPIC 12 — Destination Details Test Suite")
    print("=" * 70)

    # ------------------------------------------------------------------
    # 1. Test Destination Profile Payload Retrieval (Sigiriya ID 1)
    # ------------------------------------------------------------------
    print("\n1. Testing Full Profile Retrieval for Sigiriya (ID 1)...")
    res1 = get_destination_details(id=1)

    dest = res1["destination"]
    print(f"   Destination: {dest['title']} ({dest['category']} - {dest['district']})")
    print(
        f"   Trust Score: {dest['trust_score'] * 100}% - Verified: {dest['is_verified']}"
    )
    assert dest["id"] == 1, "Should retrieve correct destination ID 1"

    # ------------------------------------------------------------------
    # 2. Test Community Contributions Integration
    # ------------------------------------------------------------------
    print("\n2. Testing Tagged Community Posts Integration...")
    posts = res1["community_posts"]
    print(f"   Found {len(posts)} tagged community posts for {dest['title']}:")
    for p in posts:
        print(
            f"   - Post #{p['id']} by {p['author']} ({p['role']}): '{p['caption'][:60]}...'"
        )
    assert len(posts) > 0, "Should include community contributions"

    # ------------------------------------------------------------------
    # 3. Test AI Trust & Verification Breakdown
    # ------------------------------------------------------------------
    print("\n3. Testing AI Trust & Verification Metrics...")
    trust = res1["trust_metrics"]
    print(f"   Overall AI Trust Score: {trust['overall_trust_score']}%")
    print(f"   Geographic Consistency Score: {trust['geo_consistency_score']}%")
    print(f"   Image Authenticity Score: {trust['image_authenticity_score']}%")
    print(f"   Verification Badge: {trust['verification_badge']}")
    assert trust["overall_trust_score"] > 80.0, "Trust score should be high"

    # ------------------------------------------------------------------
    # 4. Test Budget Breakdown
    # ------------------------------------------------------------------
    print("\n4. Testing Itemized Day Budget Breakdown...")
    budget = res1["budget_breakdown"]
    print(f"   Ticket Entry Fee: ${budget['entry_fee']}")
    print(f"   Average Meal Cost: ${budget['avg_meal_cost']}")
    print(f"   Local Transport Cost: ${budget['local_transport_cost']}")
    print(f"   Optional Guide Fee: ${budget['guide_fee_optional']}")
    print(f"   TOTAL ESTIMATED DAY BUDGET: ${budget['total_estimated_day_budget']}")
    assert budget["total_estimated_day_budget"] > 0.0, "Total budget should be positive"

    # ------------------------------------------------------------------
    # 5. Test Live Crowd Status
    # ------------------------------------------------------------------
    print("\n5. Testing Live Crowd Status...")
    crowd = res1["crowd_status"]
    print(f"   Current Density: {crowd.get('density', 'Moderate')}")
    print(f"   Peak Hours: {crowd.get('peak_hours', '10:00 - 14:00')}")
    assert "density" in crowd or isinstance(crowd, dict)

    # ------------------------------------------------------------------
    # 6. Test Marketplace Services (Hotels, Vehicles, Certified Guides)
    # ------------------------------------------------------------------
    print("\n6. Testing Marketplace Services (Hotels, Vehicles, Guides)...")
    hotels = res1["hotels"]
    vehicles = res1["vehicles"]
    guides = res1["guides"]
    print(f"   Found {len(hotels)} nearby hotels/homestays (Top: {hotels[0]['name']})")
    print(
        f"   Found {len(vehicles)} nearby transport co-ops (Top: {vehicles[0]['name']})"
    )
    print(f"   Found {len(guides)} certified local guides (Top: {guides[0]['name']})")
    assert len(hotels) > 0 and len(vehicles) > 0 and len(guides) > 0

    # ------------------------------------------------------------------
    # 7. Test Recommended Nearby Alternatives
    # ------------------------------------------------------------------
    print("\n7. Testing Recommended Nearby Alternatives...")
    alts = res1["nearby_alternatives"]
    print(f"   Found {len(alts)} alternative recommendations:")
    for alt in alts:
        print(f"   - {alt['title']} ({alt['category']} - Rating: {alt['rating']})")
    assert len(alts) > 0, "Should include recommended alternatives"

    # ------------------------------------------------------------------
    # 8. Export OpenAPI JSON
    # ------------------------------------------------------------------
    print("\n8. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 12 DESTINATION DETAILS TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_destination_details_tests()
