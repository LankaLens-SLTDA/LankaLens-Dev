import sys
from pathlib import Path

# Add backend parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.openapi_export import export_openapi_schema
from app.routers.destinations import (
    get_destination_alternatives,
    get_destination_partners,
    get_viewport_discovery,
)


def run_map_discovery_tests():
    print("=" * 70)
    print("      LankaLens EPIC 11 — Map Discovery Test Suite")
    print("=" * 70)

    # ------------------------------------------------------------------
    # 1. Test Viewport Bounding Box Filtering (Sigiriya / Cultural Triangle area)
    # ------------------------------------------------------------------
    print("\n1. Testing Viewport Bounding Box Filtering (Cultural Triangle)...")
    res1 = get_viewport_discovery(
        min_lat=7.5,
        min_lng=80.5,
        max_lat=8.5,
        max_lng=81.5,
        zoom=11.0,
        include_partners=True,
    )
    dests = res1.get("destinations", [])
    print(
        f"   Viewport Bounds: 7.5N-8.5N, 80.5E-81.5E -> Found {len(dests)} destinations (Time: {res1['query_time_ms']}ms)"
    )
    assert len(dests) > 0, "Should find destinations in Cultural Triangle viewport"
    top_dest = dests[0]
    print(
        f"   Matched Destination: {top_dest['title']} ({top_dest['category']} - {top_dest['district']})"
    )

    # ------------------------------------------------------------------
    # 2. Test Marker Clustering at Zoom < 10
    # ------------------------------------------------------------------
    print("\n2. Testing Spatial Marker Clustering at Zoom 7.0...")
    res2 = get_viewport_discovery(
        min_lat=5.0,
        min_lng=79.0,
        max_lat=10.0,
        max_lng=82.0,
        zoom=7.0,
        include_partners=False,
    )
    clusters = res2.get("clusters", [])
    print(f"   Zoom Level 7.0 -> Generated {len(clusters)} spatial marker clusters")
    if clusters:
        c1 = clusters[0]
        print(
            f"   Cluster #{c1['cluster_id']}: Centroid ({c1['latitude']}, {c1['longitude']}) - Points: {c1['point_count']}"
        )
        print(f"   Categories inside cluster: {c1['category_distribution']}")

    # ------------------------------------------------------------------
    # 3. Test Recommended Alternatives Engine (Target: Sigiriya ID 1)
    # ------------------------------------------------------------------
    print("\n3. Testing Recommended Alternatives Engine (Target ID 1 - Sigiriya)...")
    alt_res = get_destination_alternatives(id=1, limit=3)
    alts = alt_res.get("destinations", [])
    print(f"   Found {len(alts)} recommended alternatives for Sigiriya:")
    for idx, alt in enumerate(alts, 1):
        print(
            f"   Alternative #{idx}: {alt['title']} ({alt['category']} - Rating: {alt['rating']})"
        )
    assert len(alts) > 0, "Should return alternative recommendations"

    # ------------------------------------------------------------------
    # 4. Test Local Partner Locations Layer
    # ------------------------------------------------------------------
    print("\n4. Testing Local Partner Locations Layer...")
    partners_res = get_destination_partners(id=1)
    print(f"   Found {len(partners_res)} verified partner locations near Sigiriya:")
    for p in partners_res:
        print(
            f"   - Partner #{p['id']}: {p['name']} ({p['type']} - Rating: {p['rating']} - Verified: {p['verified']})"
        )
    assert len(partners_res) > 0, "Should return verified partner co-ops"

    # ------------------------------------------------------------------
    # 5. Test Full Viewport Discovery Payload with Selected Target ID
    # ------------------------------------------------------------------
    print(
        "\n5. Testing Full Viewport Discovery Payload with Selected Destination ID 2..."
    )
    res5 = get_viewport_discovery(
        min_lat=5.0,
        min_lng=79.0,
        max_lat=10.0,
        max_lng=82.0,
        zoom=8.5,
        selected_dest_id=2,
        include_partners=True,
    )
    print(f"   Total Destinations in Viewport: {res5['total_in_viewport']}")
    print(f"   Total Partner Locations: {len(res5['partner_locations'])}")
    print(f"   Recommended Alternatives Count: {len(res5['recommended_alternatives'])}")
    assert "recommended_alternatives" in res5
    assert "partner_locations" in res5

    # ------------------------------------------------------------------
    # 6. Export OpenAPI JSON
    # ------------------------------------------------------------------
    print("\n6. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 11 MAP DISCOVERY TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_map_discovery_tests()
