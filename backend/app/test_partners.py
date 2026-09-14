"""Automated Test Suite for EPIC 19 — Local Partner Network.

Tests all 5 acceptance criteria:
1. Partner onboarding capability (POST /api/partners/onboard).
2. Displaying partner profiles (GET /api/partners/{id}).
3. Spatial proximity partner discovery near selected destinations or coordinates (GET /api/partners/nearby).
4. Partner type filtering across all 5 types: 'guide', 'agency', 'hotel', 'vehicle', 'transport' (GET /api/partners).
5. Associating partner information with relevant trip destinations (GET /api/partners/destination/{id}).
"""

from app.openapi_export import export_openapi_schema
from app.routers.partners import (
    discover_nearby_partners,
    get_destination_partners,
    get_partner_by_id,
    get_partners,
    onboard_partner,
)
from app.schemas.partners import PartnerOnboardingPayload, PartnerTypeEnum


def run_all_partner_network_tests():
    print("=" * 70)
    print("      LankaLens EPIC 19 — Local Partner Network Test Suite")
    print("=" * 70)

    # -------------------------------------------------------------
    # Test 1: Partner Onboarding Capability
    # -------------------------------------------------------------
    print("\n1. Testing Partner Onboarding (New Safari & Driver Collective)...")
    onboard_payload = PartnerOnboardingPayload(
        name="Sunil Perera",
        business_name="Sigiriya Elephant & Wildlife Safaris",
        partner_type=PartnerTypeEnum.TRANSPORT,
        district="Matale",
        province="Central",
        latitude=7.950,
        longitude=80.755,
        address="Safari Station, Sigiriya Park Road",
        contact_number="+94 77 990 1122",
        email="sunil@sigiriyasafari.lk",
        website="https://sigiriyasafari.lk",
        sltda_license_number="SLTDA/T/8812",
        price_range="$$",
        baseline_rate=45.00,
        services=[
            "National Park Jeep Safaris",
            "Elephant Corridor Transfers",
            "Night Wildlife Tracking",
        ],
        associated_destination_ids=[1, 101],
        image_url="/stitch_images/discover.png",
    )
    new_partner = onboard_partner(onboard_payload)
    print(f"   Onboarded Partner ID: {new_partner.id}")
    print(f"   Business Name: {new_partner.business_name}")
    print(f"   SLTDA License: {new_partner.sltda_license_number}")
    print(
        f"   Verification State: {new_partner.verification_state} (Is Verified: {new_partner.is_verified})"
    )
    assert new_partner.id > 0
    assert new_partner.is_verified is True
    assert new_partner.verification_state == "verified"

    # -------------------------------------------------------------
    # Test 2: Display Partner Profile by ID
    # -------------------------------------------------------------
    print("\n2. Testing Display Partner Profile by ID...")
    profile = get_partner_by_id(new_partner.id)
    print(f"   Retrieved Partner: {profile.name} ({profile.business_name})")
    print(f"   Type: {profile.partner_type}, District: {profile.district}")
    print(f"   Services: {profile.services}")
    assert profile.id == new_partner.id
    assert profile.contact_number == "+94 77 990 1122"

    # -------------------------------------------------------------
    # Test 3: Spatial Proximity Partner Discovery
    # -------------------------------------------------------------
    print(
        "\n3. Testing Spatial Proximity Partner Discovery (Sigiriya 7.957°N, 80.760°E, Radius 25km)..."
    )
    nearby_res = discover_nearby_partners(
        lat=7.957, lng=80.760, radius_km=25.0, partner_type=None
    )
    print(
        f"   Nearby Partners Found: {nearby_res.total} (Featured Count: {nearby_res.featured_count})"
    )
    for p in nearby_res.partners:
        print(
            f"   - {p.business_name} ({p.partner_type.capitalize()}): Dist {p.distance_km} km, Tier: {p.featured_tier}"
        )
        assert p.distance_km is not None
        assert p.distance_km <= 25.0

    assert nearby_res.total >= 3

    # -------------------------------------------------------------
    # Test 4: Partner Type Filtering Across All 5 Partner Types
    # -------------------------------------------------------------
    print(
        "\n4. Testing Partner Type Filtering (guide, agency, hotel, vehicle, transport)..."
    )
    for p_type in ["guide", "agency", "hotel", "vehicle", "transport"]:
        type_res = get_partners(partner_type=p_type)
        print(f"   - Type '{p_type}': {type_res.total} partners found.")
        assert type_res.total > 0
        assert all(p.partner_type.lower() == p_type for p in type_res.partners)

    # -------------------------------------------------------------
    # Test 5: Destination Association Lookup
    # -------------------------------------------------------------
    print(
        "\n5. Testing Destination Association Lookup (Destination ID 1 - Sigiriya)..."
    )
    dest_partners_res = get_destination_partners(1)
    print(f"   Partners Associated with Destination #1: {dest_partners_res.total}")
    for p in dest_partners_res.partners:
        print(
            f"   - {p.business_name} ({p.partner_type}): Associated IDs {p.associated_destination_ids}"
        )
        assert 1 in p.associated_destination_ids

    assert dest_partners_res.total >= 2

    # -------------------------------------------------------------
    # Test 6: Export Updated OpenAPI Specification
    # -------------------------------------------------------------
    print("\n6. Exporting Updated OpenAPI Specification...")
    export_openapi_schema()
    print("   OpenAPI specification successfully updated!")

    print("\n" + "=" * 70)
    print("   ALL EPIC 19 LOCAL PARTNER NETWORK TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_partner_network_tests()
