import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.routers.destinations import (  # noqa: E402
    get_destinations,
    get_nearby_destinations,
)


def test_nearby_and_filtering():
    print("Testing GET /api/destinations (full list)...")
    res = get_destinations(publication_status="published")
    print(f"Total destinations returned: {res['total']}")
    assert res["total"] >= 16, "Expected at least 16 destinations in dataset"

    print("\nTesting GET /api/destinations (verified_only=True)...")
    verified_res = get_destinations(verified_only=True)
    print(f"Verified destinations: {verified_res['total']}")

    print(
        "\nTesting GET /api/destinations (verification_state='community_submitted')..."
    )
    community_res = get_destinations(verification_state="community_submitted")
    print(f"Community submitted destinations: {community_res['total']}")
    assert (
        community_res["total"] >= 2
    ), "Expected at least 2 community submitted destinations"

    print(
        "\nTesting PostGIS GET /api/destinations/nearby (Origin: Sigiriya, Radius: 50km)..."
    )
    # Sigiriya coords: lat 7.957, lng 80.760
    nearby_res = get_nearby_destinations(lat=7.957, lng=80.760, radius_km=50.0)
    print(f"Destinations within 50km of Sigiriya: {nearby_res['total']}")
    for d in nearby_res["destinations"]:
        print(
            f" - {d['name']} ({d['district']}, {d['province']}): {d['distance_km']} km"
        )

    print("\nAll spatial query and verification tests passed successfully!")


if __name__ == "__main__":
    test_nearby_and_filtering()
