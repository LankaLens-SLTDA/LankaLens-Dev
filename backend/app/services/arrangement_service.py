"""Service layer for EPIC 20 — Trip Arrangement Broker."""

import random
import time
from datetime import datetime

from app.schemas.arrangements import (
    ArrangementMatchRequest,
    ArrangementModeEnum,
    ReferralInquiryPayload,
    ReferralInquiryRecord,
    TripArrangementResponse,
    TripPartnerMatchItem,
)
from app.schemas.partners import PartnerProfile
from app.services.partner_service import SEED_PARTNERS

# Seed Destination Name Lookup Table
DESTINATION_NAME_MAP: dict[int, dict[str, str]] = {
    1: {
        "name": "Sigiriya Ancient Rock Fortress",
        "district": "Matale",
        "province": "Central",
    },
    2: {
        "name": "Temple of the Tooth Kandy",
        "district": "Kandy",
        "province": "Central",
    },
    3: {"name": "Nine Arches Bridge Ella", "district": "Badulla", "province": "Uva"},
    4: {
        "name": "Yala National Park Safari",
        "district": "Hambantota",
        "province": "Southern",
    },
    5: {
        "name": "Galle Dutch Fort Heritage",
        "district": "Galle",
        "province": "Southern",
    },
    101: {"name": "Dambulla Cave Temple", "district": "Matale", "province": "Central"},
    102: {"name": "Little Adam's Peak Trek", "district": "Badulla", "province": "Uva"},
}

SEED_REFERRAL_INQUIRIES: list[dict] = [
    {
        "referral_id": 1,
        "referral_code": "LL-REF-89123",
        "trip_id": 1,
        "partner_id": 1,
        "partner_name": "Dinuka Heritage & Trekking Guides",
        "partner_type": "guide",
        "arrangement_mode": "guided",
        "customer_name": "Alexander Wright",
        "customer_contact": "+94778899100",
        "customer_email": "alex.wright@example.com",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "group_size": 2,
        "status": "confirmed",
        "estimated_cost": 180.00,
        "custom_notes": "Interested in sunrise Sigiriya climb with English speaking guide",
        "created_at": "2026-09-14T10:00:00Z",
    }
]


class BaseArrangementService:
    """Base interface for arrangement broker operations."""

    def match_partners_for_trip(
        self, request: ArrangementMatchRequest, partner_dataset: list[dict]
    ) -> TripArrangementResponse:
        raise NotImplementedError

    def create_referral_inquiry(
        self,
        payload: ReferralInquiryPayload,
        partner_dataset: list[dict],
        inquiries_store: list[dict],
    ) -> ReferralInquiryRecord:
        raise NotImplementedError

    def get_referral_inquiry(
        self, referral_code: str, inquiries_store: list[dict]
    ) -> ReferralInquiryRecord | None:
        raise NotImplementedError


class LocalArrangementService(BaseArrangementService):
    """In-memory and spatial arrangement broker implementation."""

    def match_partners_for_trip(
        self,
        request: ArrangementMatchRequest,
        partner_dataset: list[dict] | None = None,
    ) -> TripArrangementResponse:
        """Matches partners against trip destinations for Guided or Independent travel paths."""
        start_time = time.perf_counter()
        dataset = partner_dataset if partner_dataset is not None else SEED_PARTNERS

        target_dest_ids = set(request.destination_ids)
        if not target_dest_ids:
            # Default to Sigiriya (1) and Kandy (2) if no explicit IDs passed
            target_dest_ids = {1, 2}

        # Resolve target destination names & districts
        matched_dest_names: dict[int, str] = {}
        target_districts: set[str] = set()

        for dest_id in target_dest_ids:
            if dest_id in DESTINATION_NAME_MAP:
                matched_dest_names[dest_id] = DESTINATION_NAME_MAP[dest_id]["name"]
                target_districts.add(DESTINATION_NAME_MAP[dest_id]["district"])
            else:
                matched_dest_names[dest_id] = f"Destination #{dest_id}"

        # Categorize dataset by mode availability
        guided_candidates = [
            p for p in dataset if p.get("partner_type") in ("guide", "agency")
        ]
        independent_candidates = [
            p
            for p in dataset
            if p.get("partner_type") in ("hotel", "vehicle", "transport")
        ]

        # Select candidate list based on requested mode
        candidates = (
            guided_candidates
            if request.mode == ArrangementModeEnum.GUIDED
            else independent_candidates
        )

        # Apply optional partner_type_filter
        if request.partner_type_filter:
            filter_val = str(request.partner_type_filter).lower().strip()
            candidates = [p for p in candidates if p.get("partner_type") == filter_val]

        matched_items: list[TripPartnerMatchItem] = []

        for p in candidates:
            p_profile = PartnerProfile(**p)
            partner_dest_ids = set(p.get("associated_destination_ids", []))
            overlap_ids = target_dest_ids.intersection(partner_dest_ids)
            overlap_names = [
                matched_dest_names[did]
                for did in overlap_ids
                if did in matched_dest_names
            ]

            # Base score calculation
            base_score = 60.0
            if overlap_ids:
                base_score += len(overlap_ids) * 15.0
            elif p.get("district") in target_districts:
                base_score += 15.0

            # Rating and Featured Tier Bonuses
            base_score += (p.get("rating", 4.5) - 4.0) * 10.0
            if p.get("featured_tier") == "gold":
                base_score += 10.0
            elif p.get("featured_tier") == "silver":
                base_score += 5.0

            final_score = round(min(base_score, 98.5), 1)

            # Generate contextual relevance explanation
            if request.mode == ArrangementModeEnum.GUIDED:
                if overlap_names:
                    reason = f"Certified tour partner covering scheduled visits to {', '.join(overlap_names[:2])}."
                else:
                    reason = f"Licensed guide operating across {p.get('district')} & {p.get('province')} Province."
            else:
                if overlap_names:
                    reason = f"Direct service provider ({p.get('partner_type')}) stationed near {overlap_names[0]}."
                else:
                    reason = f"Verified {p.get('partner_type')} fleet serving travelers in {p.get('district')}."

            matched_items.append(
                TripPartnerMatchItem(
                    partner=p_profile,
                    match_score=final_score,
                    matching_destinations=(
                        overlap_names
                        if overlap_names
                        else [f"{p.get('district')} District"]
                    ),
                    recommended_for_mode=request.mode,
                    relevance_reason=reason,
                    estimated_cost_per_day=float(p.get("baseline_rate", 25.0)),
                )
            )

        # Sort matches descending by match score
        matched_items.sort(key=lambda x: x.match_score, reverse=True)

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return TripArrangementResponse(
            trip_id=request.trip_id,
            mode=request.mode,
            matched_partners=matched_items,
            guided_options_count=len(guided_candidates),
            independent_options_count=len(independent_candidates),
            total_matched=len(matched_items),
            query_time_ms=elapsed_ms,
        )

    def create_referral_inquiry(
        self,
        payload: ReferralInquiryPayload,
        partner_dataset: list[dict] | None = None,
        inquiries_store: list[dict] | None = None,
    ) -> ReferralInquiryRecord:
        """Submits booking referral inquiry and generates tracking code."""
        dataset = partner_dataset if partner_dataset is not None else SEED_PARTNERS
        store = (
            inquiries_store if inquiries_store is not None else SEED_REFERRAL_INQUIRIES
        )

        # Find target partner
        partner_dict = next(
            (p for p in dataset if p.get("id") == payload.partner_id), None
        )
        partner_name = (
            partner_dict.get("business_name", "LankaLens Partner")
            if partner_dict
            else "LankaLens Partner"
        )
        partner_type = (
            partner_dict.get("partner_type", "transport")
            if partner_dict
            else "transport"
        )
        baseline_rate = (
            partner_dict.get("baseline_rate", 30.0) if partner_dict else 30.0
        )

        referral_code = f"LL-REF-{random.randint(10000, 99999)}"
        new_id = len(store) + 1
        est_cost = round(baseline_rate * max(payload.group_size, 1), 2)

        record_dict = {
            "referral_id": new_id,
            "referral_code": referral_code,
            "trip_id": payload.trip_id,
            "partner_id": payload.partner_id,
            "partner_name": partner_name,
            "partner_type": partner_type,
            "arrangement_mode": payload.arrangement_mode,
            "customer_name": payload.customer_name,
            "customer_contact": payload.customer_contact,
            "customer_email": payload.customer_email,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "group_size": payload.group_size,
            "status": "pending",
            "estimated_cost": est_cost,
            "custom_notes": payload.custom_notes,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }

        store.append(record_dict)
        return ReferralInquiryRecord(**record_dict)

    def get_referral_inquiry(
        self, referral_code: str, inquiries_store: list[dict] | None = None
    ) -> ReferralInquiryRecord | None:
        """Retrieves referral inquiry record by referral code."""
        store = (
            inquiries_store if inquiries_store is not None else SEED_REFERRAL_INQUIRIES
        )
        match = next(
            (
                r
                for r in store
                if r.get("referral_code").upper() == referral_code.upper()
            ),
            None,
        )
        if match:
            return ReferralInquiryRecord(**match)
        return None
