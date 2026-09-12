"""Automated Test Suite for EPIC 10 — Search & Discovery.

Tests all 8 acceptance criteria:
1. Free-text Search Query by Name/Title.
2. Activity Tag Filter ("Train Spotting", "Hiking").
3. Category & Regional Filtering (District & Province).
4. Budget (max_cost) & Crowd Level Density Filters.
5. PostGIS Spatial Proximity Search (lat, lng, radius_km).
6. Weighted Relevance Ranking Order.
7. Search Result Pagination (limit & offset).
8. Query Cache Hit Performance (CacheManager TTL).
"""

from app.routers.destinations import search_destinations_api
from app.services.search_service import CacheManager


def run_all_search_tests():
    print("=" * 70)
    print("      LankaLens EPIC 10 — Search & Discovery Test Suite")
    print("=" * 70)

    CacheManager.clear()

    # -------------------------------------------------------------
    # Test 1: Free Text Search Query by Name
    # -------------------------------------------------------------
    print("\n1. Testing Free-Text Search Query ('Nine Arch')...")
    res1 = search_destinations_api(q="Nine Arch")
    print(f"   Matches Found: {res1['total']}")
    print(f"   Top Result: {res1['destinations'][0]['name']}")
    print(f"   Relevance Score: {res1['destinations'][0]['relevance_score']}")
    assert res1["total"] >= 1
    assert "Nine Arch" in res1["destinations"][0]["name"]

    # -------------------------------------------------------------
    # Test 2: Activity Tag Filter
    # -------------------------------------------------------------
    print("\n2. Testing Activity Tag Filter ('Train Spotting')...")
    res2 = search_destinations_api(activity="Train Spotting")
    print(f"   Matches Found for 'Train Spotting': {res2['total']}")
    for d in res2["destinations"]:
        print(f"   - {d['name']} ({d['activities']})")
    assert res2["total"] >= 1
    assert any("train" in a.lower() for a in res2["destinations"][0]["activities"])

    # -------------------------------------------------------------
    # Test 3: Multi-attribute Category & Regional Filtering
    # -------------------------------------------------------------
    print(
        "\n3. Testing Category & Regional Filters (Category: heritage, District: Matale)..."
    )
    res3 = search_destinations_api(category="heritage", district="Matale")
    print(f"   Matches Found: {res3['total']}")
    for d in res3["destinations"]:
        print(
            f"   - {d['name']} (Category: {d['category']}, District: {d['district']})"
        )
        assert d["category"].lower() == "heritage"
        assert "matale" in d["district"].lower()

    # -------------------------------------------------------------
    # Test 4: Budget & Crowd Level Filters
    # -------------------------------------------------------------
    print(
        "\n4. Testing Budget & Crowd Level Filters (max_cost: 5.0, crowd: Moderate)..."
    )
    res4 = search_destinations_api(max_cost=5.0, crowd_level="Moderate")
    print(f"   Matches Found: {res4['total']}")
    for d in res4["destinations"]:
        print(
            f"   - {d['name']} (Cost: ${d['baseline_cost']}, Crowd: {d['crowd_info']['density']})"
        )
        assert d["baseline_cost"] <= 5.0

    # -------------------------------------------------------------
    # Test 5: PostGIS Spatial Proximity Search
    # -------------------------------------------------------------
    print(
        "\n5. Testing PostGIS Proximity Search (Lat 6.8768, Lng 81.0608, Radius 25km)..."
    )
    res5 = search_destinations_api(lat=6.8768, lng=81.0608, radius_km=25.0)
    print(f"   Destinations Within 25km of Ella: {res5['total']}")
    for d in res5["destinations"]:
        print(f"   - {d['name']} ({d['distance_km']} km away)")
        assert d["distance_km"] <= 25.0

    # -------------------------------------------------------------
    # Test 6: Weighted Relevance Ranking Order
    # -------------------------------------------------------------
    print("\n6. Testing Weighted Relevance Ranking Order ('Rock')...")
    res6 = search_destinations_api(q="Rock")
    print(f"   Matches Found: {res6['total']}")
    scores = [d["relevance_score"] for d in res6["destinations"]]
    print(f"   Relevance Scores: {scores}")
    assert scores == sorted(scores, reverse=True), (
        "Expected items sorted by relevance score descending"
    )

    # -------------------------------------------------------------
    # Test 7: Search Pagination (Limit & Offset)
    # -------------------------------------------------------------
    print("\n7. Testing Search Result Pagination (limit: 2, offset: 0)...")
    res7_p1 = search_destinations_api(limit=2, offset=0)
    res7_p2 = search_destinations_api(limit=2, offset=2)
    print(
        f"   Page 1 Total Items: {len(res7_p1['destinations'])} (Page {res7_p1['page']})"
    )
    print(
        f"   Page 2 Total Items: {len(res7_p2['destinations'])} (Page {res7_p2['page']})"
    )
    assert len(res7_p1["destinations"]) == 2
    assert res7_p1["destinations"][0]["id"] != res7_p2["destinations"][0]["id"]

    # -------------------------------------------------------------
    # Test 8: Query Caching Hit Performance
    # -------------------------------------------------------------
    print("\n8. Testing Query Cache Hit Performance...")
    # First query populates cache
    _ = search_destinations_api(q="Sigiriya", category="heritage")
    # Second identical query must return cached == True
    res8_cached = search_destinations_api(q="Sigiriya", category="heritage")
    print(f"   Cache Hit Flag: {res8_cached['cached']}")
    print(f"   Execution Time: {res8_cached['query_time_ms']} ms")
    assert res8_cached["cached"] is True
    assert res8_cached["query_time_ms"] < 20.0

    print("\n" + "=" * 70)
    print("      ALL EPIC 10 SEARCH & DISCOVERY TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_search_tests()
