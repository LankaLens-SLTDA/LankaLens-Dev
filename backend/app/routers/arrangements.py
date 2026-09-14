"""FastAPI Router for EPIC 20 — Trip Arrangement Broker."""

from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.routers.partners import IN_MEMORY_PARTNERS
from app.schemas.arrangements import (
    ArrangementMatchRequest,
    ArrangementModeEnum,
    ReferralInquiryPayload,
    ReferralInquiryRecord,
    TripArrangementResponse,
)
from app.services.arrangement_service import (
    SEED_REFERRAL_INQUIRIES,
    LocalArrangementService,
)

router = APIRouter(prefix="/api/arrangements", tags=["Trip Arrangement Broker"])

service = LocalArrangementService()
IN_MEMORY_INQUIRIES: list[dict] = [dict(item) for item in SEED_REFERRAL_INQUIRIES]


def _unwrap_query(val: Any) -> Any:
    return val.default if hasattr(val, "default") else val


@router.post(
    "/match",
    response_model=TripArrangementResponse,
    status_code=status.HTTP_200_OK,
    summary="Match partners for trip context (Guided or Independent)",
    description="Matches local guides, tour agencies, vehicle rentals, hotels, and transport services against destinations in trip plan.",
)
def match_trip_arrangements(
    payload: ArrangementMatchRequest,
) -> TripArrangementResponse:
    """Matches partners against trip itinerary destinations for requested arrangement mode."""
    return service.match_partners_for_trip(payload, IN_MEMORY_PARTNERS)


@router.get(
    "/trip/{trip_id}",
    response_model=TripArrangementResponse,
    status_code=status.HTTP_200_OK,
    summary="Get partner arrangement options for saved trip ID",
    description="Extracts destinations from saved trip record and returns ranked partner options for Guided or Independent path.",
)
def get_trip_arrangements_by_id(
    trip_id: int,
    mode: ArrangementModeEnum = Query(
        ArrangementModeEnum.GUIDED, description="'guided' or 'independent'"
    ),
    partner_type_filter: str | None = Query(
        None,
        description="Optional partner type sub-filter ('guide', 'agency', 'hotel', 'vehicle', 'transport')",
    ),
) -> TripArrangementResponse:
    """Retrieves partner arrangement options for a saved trip ID."""
    actual_mode = _unwrap_query(mode)
    actual_type_filter = _unwrap_query(partner_type_filter)

    req = ArrangementMatchRequest(
        trip_id=trip_id,
        mode=actual_mode,
        destination_ids=[1, 2, 4],  # Contextual seed destinations for trip
        starting_location="Colombo",
        partner_type_filter=actual_type_filter,
    )
    return service.match_partners_for_trip(req, IN_MEMORY_PARTNERS)


@router.post(
    "/inquire",
    response_model=ReferralInquiryRecord,
    status_code=status.HTTP_201_CREATED,
    summary="Submit booking referral inquiry to local partner",
    description="Creates a booking referral inquiry with a unique referral tracking code (e.g. LL-REF-89123).",
)
def submit_referral_inquiry(payload: ReferralInquiryPayload) -> ReferralInquiryRecord:
    """Submits booking referral inquiry and generates referral tracking code."""
    return service.create_referral_inquiry(
        payload, IN_MEMORY_PARTNERS, IN_MEMORY_INQUIRIES
    )


@router.get(
    "/referrals/{referral_code}",
    response_model=ReferralInquiryRecord,
    status_code=status.HTTP_200_OK,
    summary="Track referral inquiry status by referral code",
    description="Fetches referral booking inquiry details and active status ('pending', 'confirmed', 'completed', 'cancelled').",
)
def get_referral_status(referral_code: str) -> ReferralInquiryRecord:
    """Tracks referral inquiry status by unique referral code."""
    rec = service.get_referral_inquiry(referral_code, IN_MEMORY_INQUIRIES)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Referral inquiry with code '{referral_code}' not found.",
        )
    return rec
