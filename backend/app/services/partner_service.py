"""Local Tourism Partner Network Service for LankaLens (EPIC 19)."""

import time
from abc import ABC, abstractmethod
from typing import Any

from app.schemas.partners import (
    PartnerListResponse,
    PartnerOnboardingPayload,
    PartnerProfile,
)
from app.services.search_service import haversine_distance_km

# Seed local partner network dataset covering all 5 partner types
SEED_PARTNERS: list[dict[str, Any]] = [
    {
        "id": 1,
        "name": "Dinuka Silva",
        "business_name": "Dinuka Heritage & Trekking Guides",
        "partner_type": "guide",
        "district": "Matale",
        "province": "Central",
        "latitude": 7.957,
        "longitude": 80.760,
        "address": "Sigiriya Rock Access Road, Sigiriya",
        "contact_number": "+94 77 334 5566",
        "email": "dinuka@lankalens.lk",
        "website": "https://lankalens.lk/guides/dinuka",
        "sltda_license_number": "SLTDA/G/4489",
        "verification_state": "verified",
        "is_verified": True,
        "is_featured": True,
        "featured_tier": "gold",
        "rating": 4.98,
        "reviews_count": 142,
        "price_range": "$$",
        "baseline_rate": 35.00,
        "services": [
            "Heritage Guided Tours",
            "Sunrise Rock Climbing",
            "Flora & Fauna Excursions",
        ],
        "associated_destination_ids": [1, 101],
        "image_url": "/stitch_images/discover.png",
        "created_at": "2026-08-01T10:00:00Z",
    },
    {
        "id": 2,
        "name": "Sigiriya Tuk Transport Co-op",
        "business_name": "Sigiriya Eco-Tuk Drivers Collective",
        "partner_type": "transport",
        "district": "Matale",
        "province": "Central",
        "latitude": 7.955,
        "longitude": 80.758,
        "address": "Central Bus Stand & Tuk Hub, Sigiriya",
        "contact_number": "+94 66 223 1144",
        "email": "transport@sigiriya-ecotuk.lk",
        "website": "https://sigiriya-ecotuk.lk",
        "sltda_license_number": "SLTDA/T/1120",
        "verification_state": "verified",
        "is_verified": True,
        "is_featured": True,
        "featured_tier": "silver",
        "rating": 4.90,
        "reviews_count": 210,
        "price_range": "$",
        "baseline_rate": 15.00,
        "services": [
            "Local Sightseeing Shuttles",
            "Station Transfers",
            "Custom Day Hires",
        ],
        "associated_destination_ids": [1],
        "image_url": "/stitch_images/map.png",
        "created_at": "2026-08-05T12:00:00Z",
    },
    {
        "id": 3,
        "name": "Kasun Kalhara",
        "business_name": "Matale Organic Farm & Eco Lodge",
        "partner_type": "hotel",
        "district": "Matale",
        "province": "Central",
        "latitude": 7.942,
        "longitude": 80.750,
        "address": "Inamaluwa Road, Sigiriya",
        "contact_number": "+94 66 224 8899",
        "email": "info@matalefarm.lk",
        "website": "https://matalefarm.lk",
        "sltda_license_number": "SLTDA/H/9941",
        "verification_state": "verified",
        "is_verified": True,
        "is_featured": False,
        "featured_tier": "standard",
        "rating": 4.85,
        "reviews_count": 98,
        "price_range": "$$",
        "baseline_rate": 65.00,
        "services": [
            "Farm-to-Table Breakfast",
            "Solar Heated Rooms",
            "Bicycle Rentals",
        ],
        "associated_destination_ids": [1, 101],
        "image_url": "/stitch_images/planner.png",
        "created_at": "2026-08-10T14:30:00Z",
    },
    {
        "id": 4,
        "name": "Lanka Lens Expedition Tours",
        "business_name": "Lanka Lens Cultural Tour Agency",
        "partner_type": "agency",
        "district": "Kandy",
        "province": "Central",
        "latitude": 7.2906,
        "longitude": 80.6337,
        "address": "Dalada Veediya, Kandy",
        "contact_number": "+94 81 222 3344",
        "email": "expeditions@lankalens.lk",
        "website": "https://lankalens.lk/agency",
        "sltda_license_number": "SLTDA/A/5512",
        "verification_state": "verified",
        "is_verified": True,
        "is_featured": True,
        "featured_tier": "gold",
        "rating": 4.94,
        "reviews_count": 310,
        "price_range": "$$$",
        "baseline_rate": 120.00,
        "services": [
            "Multi-Day Cultural Triangle Expeditions",
            "Private AC Coach Charters",
            "Curated Tea Country Safaris",
        ],
        "associated_destination_ids": [1, 2, 3],
        "image_url": "/stitch_images/discover.png",
        "created_at": "2026-08-12T09:00:00Z",
    },
    {
        "id": 5,
        "name": "Ella Mountain Wheels",
        "business_name": "Ella Scooter & Vehicle Rentals",
        "partner_type": "vehicle",
        "district": "Badulla",
        "province": "Uva",
        "latitude": 6.872,
        "longitude": 81.046,
        "address": "Main Street, Ella",
        "contact_number": "+94 57 222 8899",
        "email": "rentals@ellawheels.lk",
        "website": "https://ellawheels.lk",
        "sltda_license_number": "SLTDA/V/3310",
        "verification_state": "verified",
        "is_verified": True,
        "is_featured": False,
        "featured_tier": "standard",
        "rating": 4.88,
        "reviews_count": 175,
        "price_range": "$$",
        "baseline_rate": 20.00,
        "services": [
            "Automatic Scooter Rentals",
            "Royal Enfield Motorbikes",
            "Helmets & Breakdown Support",
        ],
        "associated_destination_ids": [2],
        "image_url": "/stitch_images/map.png",
        "created_at": "2026-08-15T11:20:00Z",
    },
]


class BasePartnerService(ABC):
    """Abstract base class interface for Local Partner Network Service."""

    @abstractmethod
    def onboard_partner(
        self, payload: PartnerOnboardingPayload, dataset: list[dict[str, Any]]
    ) -> PartnerProfile:
        """Registers new partner, validates SLTDA license, and assigns verification tier."""
        pass

    @abstractmethod
    def get_partner_profile(
        self, partner_id: int, dataset: list[dict[str, Any]]
    ) -> PartnerProfile | None:
        """Fetches partner profile details by ID."""
        pass

    @abstractmethod
    def discover_nearby_partners(
        self,
        lat: float,
        lng: float,
        radius_km: float,
        partner_type: str | None,
        destination_id: int | None,
        dataset: list[dict[str, Any]],
    ) -> PartnerListResponse:
        """Executes spatial PostGIS / Haversine proximity matching for nearby partner discovery."""
        pass


class LocalPartnerService(BasePartnerService):
    """Authoritative Local Tourism Partner Network Service Implementation."""

    def onboard_partner(
        self, payload: PartnerOnboardingPayload, dataset: list[dict[str, Any]]
    ) -> PartnerProfile:
        new_id = max([p["id"] for p in dataset], default=0) + 1
        has_license = bool(
            payload.sltda_license_number and payload.sltda_license_number.strip()
        )
        verification_state = "verified" if has_license else "pending_verification"

        new_partner_dict: dict[str, Any] = {
            "id": new_id,
            "name": payload.name,
            "business_name": payload.business_name,
            "partner_type": payload.partner_type.value,
            "district": payload.district,
            "province": payload.province,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "address": payload.address or f"{payload.district}, {payload.province}",
            "contact_number": payload.contact_number,
            "email": payload.email,
            "website": payload.website,
            "sltda_license_number": payload.sltda_license_number,
            "verification_state": verification_state,
            "is_verified": has_license,
            "is_featured": False,
            "featured_tier": "standard",
            "rating": 5.00,
            "reviews_count": 1,
            "price_range": payload.price_range,
            "baseline_rate": payload.baseline_rate,
            "services": payload.services or ["Custom Local Service"],
            "associated_destination_ids": payload.associated_destination_ids or [],
            "image_url": payload.image_url or "/stitch_images/discover.png",
            "created_at": "2026-09-14T12:00:00Z",
        }

        dataset.append(new_partner_dict)
        return PartnerProfile(**new_partner_dict)

    def get_partner_profile(
        self, partner_id: int, dataset: list[dict[str, Any]]
    ) -> PartnerProfile | None:
        partner = next((p for p in dataset if p["id"] == partner_id), None)
        if not partner:
            return None
        return PartnerProfile(**partner)

    def discover_nearby_partners(
        self,
        lat: float,
        lng: float,
        radius_km: float,
        partner_type: str | None,
        destination_id: int | None,
        dataset: list[dict[str, Any]],
    ) -> PartnerListResponse:
        start_time = time.time()
        results: list[PartnerProfile] = []

        for p in dataset:
            p_type = str(p.get("partner_type", "")).lower()
            if partner_type and p_type != partner_type.lower():
                continue

            if destination_id is not None:
                assoc_ids = p.get("associated_destination_ids", [])
                if destination_id not in assoc_ids:
                    # Check spatial fallback distance
                    dist_km = haversine_distance_km(
                        lat,
                        lng,
                        float(p.get("latitude", 7.957)),
                        float(p.get("longitude", 80.760)),
                    )
                    if dist_km > radius_km:
                        continue
            else:
                dist_km = haversine_distance_km(
                    lat,
                    lng,
                    float(p.get("latitude", 7.957)),
                    float(p.get("longitude", 80.760)),
                )
                if dist_km > radius_km:
                    continue

            p_dict = dict(p)
            dist_val = haversine_distance_km(
                lat,
                lng,
                float(p.get("latitude", 7.957)),
                float(p.get("longitude", 80.760)),
            )
            p_dict["distance_km"] = dist_val
            results.append(PartnerProfile(**p_dict))

        # Sort: Featured Gold > Silver > Standard, then by distance
        tier_weights = {"gold": 3, "silver": 2, "standard": 1}
        results.sort(
            key=lambda item: (
                tier_weights.get(item.featured_tier.lower(), 1),
                item.is_featured,
                -(item.distance_km if item.distance_km is not None else 999.0),
            ),
            reverse=True,
        )

        featured_count = sum(1 for item in results if item.is_featured)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return PartnerListResponse(
            partners=results,
            total=len(results),
            featured_count=featured_count,
            filter_type=partner_type,
            filter_district=None,
            query_time_ms=elapsed_ms,
        )

    def get_partners(
        self,
        partner_type: str | None,
        district: str | None,
        province: str | None,
        verified_only: bool,
        featured_only: bool,
        destination_id: int | None,
        dataset: list[dict[str, Any]],
    ) -> PartnerListResponse:
        start_time = time.time()
        filtered: list[PartnerProfile] = []

        for p in dataset:
            if (
                partner_type
                and p.get("partner_type", "").lower() != partner_type.lower()
            ):
                continue
            if district and p.get("district", "").lower() != district.lower():
                continue
            if province and p.get("province", "").lower() != province.lower():
                continue
            if verified_only and not p.get("is_verified", True):
                continue
            if featured_only and not p.get("is_featured", False):
                continue
            if destination_id is not None and destination_id not in p.get(
                "associated_destination_ids", []
            ):
                continue

            filtered.append(PartnerProfile(**p))

        featured_count = sum(1 for item in filtered if item.is_featured)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return PartnerListResponse(
            partners=filtered,
            total=len(filtered),
            featured_count=featured_count,
            filter_type=partner_type,
            filter_district=district,
            query_time_ms=elapsed_ms,
        )
