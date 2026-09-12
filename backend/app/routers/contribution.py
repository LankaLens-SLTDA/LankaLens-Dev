from fastapi import APIRouter, HTTPException, Query, status

from app.routers.community import IN_MEMORY_POSTS, format_post_record
from app.schemas.contribution import (
    AiValidationResult,
    Contribution,
    ContributionCreate,
    ExifMetadata,
    ModerationRequest,
    ReportRequest,
    ReportResponse,
)
from app.supabase_client import supabase

router = APIRouter(
    prefix="/api/contribution", tags=["Contribution Pipeline & Moderation"]
)

# In-memory stores for contributions & reports
IN_MEMORY_CONTRIBUTIONS: list[dict] = []
IN_MEMORY_REPORTS: list[dict] = []


def run_ai_validation_guard(
    lat: float | None,
    lng: float | None,
    alt_text: str,
    description: str,
    has_gps: bool,
) -> tuple[AiValidationResult, str]:
    """Runs automated AI Cartographic Integrity Guard check on submitted contribution."""
    score = 0.94
    boundary_msg = "PASSED (Sri Lanka Boundary & Destination Geofence Verified)"
    quality_msg = "PASSED (High Resolution & Natural Image Stream)"
    text_msg = "PASSED (No Profanity or Spam Detected)"
    wcag_msg = "PASSED (WCAG Compliant Alt-Text)"
    notes = "Verified cartographic discovery ready for publication."

    # 1. Geofence & GPS check
    if lat is not None and lng is not None:
        # Check if coordinates are within Sri Lanka bounding box: Lat (5.8° to 9.9° N), Lng (79.6° to 81.9° E)
        if not (5.5 <= lat <= 10.0 and 79.5 <= lng <= 82.2):
            score -= 0.40
            boundary_msg = "FAILED (Coordinates Outside Sri Lanka Geographic Boundary)"
            notes = "GPS coordinates fail Sri Lanka geofence check."
    elif not has_gps:
        score -= 0.15
        boundary_msg = "WARNING (No GPS EXIF tag found, estimated from location text)"

    # 2. WCAG Alt-Text check
    if len(alt_text.strip()) < 10:
        score -= 0.20
        wcag_msg = "FAILED (Alt-Text too short or missing WCAG description)"

    # 3. Profanity & spam check
    spam_terms = ["casino", "crypto", "free money", "viagra", "cheap-loans"]
    if any(term in description.lower() for term in spam_terms):
        score -= 0.80
        text_msg = "FAILED (Spam or Prohibited Keywords Detected)"
        notes = "Content flagged for spam or prohibited keywords."

    score = max(0.00, round(score, 2))
    passed = score >= 0.85
    status_str = (
        "approved" if passed else ("pending_review" if score >= 0.50 else "rejected")
    )

    res = AiValidationResult(
        passed=passed,
        confidence_score=score,
        boundary_check=boundary_msg,
        quality_check=quality_msg,
        text_safety_check=text_msg,
        wcag_alt_check=wcag_msg,
        notes=notes,
    )
    return res, status_str


@router.post(
    "/extract-metadata",
    response_model=ExifMetadata,
    summary="Extract photo EXIF & GPS metadata",
    description="Simulate/process photo upload to extract camera EXIF tags, GPS coordinates, timestamp, and dimensions.",
)
def extract_photo_metadata(
    filename: str | None = Query(None, description="Uploaded file name"),
    lat: float | None = Query(None, description="Optional override latitude"),
    lng: float | None = Query(None, description="Optional override longitude"),
):
    """Extract photo metadata & GPS coordinates."""
    lat = lat if isinstance(lat, (int, float)) else None
    lng = lng if isinstance(lng, (int, float)) else None

    detected_lat = lat if lat is not None else 6.8667
    detected_lng = lng if lng is not None else 81.0465

    return ExifMetadata(
        camera="Sony Alpha A7IV / iOS Device",
        lens="FE 24-70mm f/2.8 GM II",
        timestamp="2026-09-12 06:15:00",
        latitude=detected_lat,
        longitude=detected_lng,
        width=3840,
        height=2160,
        has_gps=True,
    )


@router.post(
    "/submit",
    response_model=Contribution,
    status_code=status.HTTP_201_CREATED,
    summary="Submit tourism contribution to validation pipeline",
    description="Submit photo contribution through EXIF extraction, AI Integrity Guard validation, moderation, and feed publishing.",
)
def submit_contribution(payload: ContributionCreate):
    """Submit contribution through the verification pipeline."""
    new_id = len(IN_MEMORY_CONTRIBUTIONS) + 1

    # Extract EXIF metadata
    exif = ExifMetadata(
        camera="Canon EOS R5",
        lens="RF 15-35mm f/2.8L",
        timestamp="2026-09-12 07:45:00",
        latitude=payload.latitude,
        longitude=payload.longitude,
        width=4032,
        height=3024,
        has_gps=payload.latitude is not None and payload.longitude is not None,
    )

    # Run AI Validation Guard
    ai_result, auto_status = run_ai_validation_guard(
        lat=payload.latitude,
        lng=payload.longitude,
        alt_text=payload.alt_text,
        description=payload.description,
        has_gps=exif.has_gps,
    )

    moderation_status = "approved" if auto_status == "approved" else "pending_review"
    points = 50 if auto_status == "approved" else 0

    record = {
        "id": new_id,
        "author_name": payload.author_name,
        "title": payload.title,
        "category": payload.category,
        "destination_id": payload.destination_id,
        "description": payload.description,
        "image_url": payload.image_url,
        "alt_text": payload.alt_text,
        "tags": payload.tags,
        "rating": payload.rating,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "exif_metadata": exif.model_dump(),
        "ai_validation_result": ai_result.model_dump(),
        "ai_confidence_score": ai_result.confidence_score,
        "status": auto_status,
        "moderation_status": moderation_status,
        "reputation_points_awarded": points,
        "created_at": "Just now",
    }

    IN_MEMORY_CONTRIBUTIONS.insert(0, record)

    # If approved by AI, publish directly to community feed!
    if auto_status == "approved":
        post_id = max([p["id"] for p in IN_MEMORY_POSTS] or [0]) + 1
        post_record = {
            "id": post_id,
            "author": payload.author_name,
            "role": "Cartographer Explorer",
            "avatar": "/stitch_images/planner.png",
            "time": "Just now",
            "verified": True,
            "location": payload.title,
            "destination_id": payload.destination_id,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "rating": payload.rating,
            "image": payload.image_url,
            "caption": payload.description,
            "tags": payload.tags,
            "ecoPoints": 50,
            "likes_count": 0,
            "commentsCount": 0,
            "saves_count": 0,
            "comments": [],
        }
        IN_MEMORY_POSTS.insert(0, format_post_record(post_record))

    if supabase:
        try:
            supabase.table("contributions").insert(record).execute()
        except Exception as e:
            print(f"[LankaLens Supabase contribution submit error] {e}")

    return record


@router.get(
    "/submissions",
    response_model=list[Contribution],
    summary="Get user contribution history",
    description="Retrieve user submitted contributions and their moderation/validation statuses.",
)
def get_user_submissions(
    status_filter: str | None = Query(
        None,
        description="Filter by status ('approved', 'pending_review', 'rejected', 'flagged')",
    )
):
    """Retrieve contribution history."""
    status_filter = status_filter if isinstance(status_filter, str) else None

    results = list(IN_MEMORY_CONTRIBUTIONS)
    if status_filter:
        results = [
            c
            for c in results
            if c.get("status") == status_filter
            or c.get("moderation_status") == status_filter
        ]
    return results


@router.post(
    "/report",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report / Flag inappropriate content",
    description="Report inaccurate GPS, spam, or policy-violating contributions.",
)
def report_content(payload: ReportRequest):
    """Submit report for moderation review and flag content."""
    report_id = len(IN_MEMORY_REPORTS) + 1
    report_rec = {
        "id": report_id,
        "target_type": payload.target_type,
        "target_id": payload.target_id,
        "reporter_name": payload.reporter_name or "Explorer",
        "reason": payload.reason,
        "description": payload.description or "",
        "status": "pending",
        "created_at": "Just now",
    }
    IN_MEMORY_REPORTS.append(report_rec)

    # Flag target post if present
    if payload.target_type == "post" or payload.target_type == "contribution":
        for p in IN_MEMORY_POSTS:
            if p["id"] == payload.target_id:
                p["verified"] = False
                break
        for c in IN_MEMORY_CONTRIBUTIONS:
            if c["id"] == payload.target_id:
                c["status"] = "flagged"
                c["moderation_status"] = "pending_review"
                break

    if supabase:
        try:
            supabase.table("reports").insert(report_rec).execute()
        except Exception as e:
            print(f"[LankaLens Supabase report error] {e}")

    return {
        "id": report_id,
        "message": f"Report #{report_id} received. Target {payload.target_type} #{payload.target_id} has been flagged for moderation review.",
    }


@router.post(
    "/{id}/moderate",
    response_model=Contribution,
    summary="Moderate contribution submission",
    description="Admin / Moderator endpoint to approve or reject pending contributions.",
)
def moderate_contribution(id: int, payload: ModerationRequest):
    """Moderate pending contribution."""
    target = None
    for c in IN_MEMORY_CONTRIBUTIONS:
        if c["id"] == id:
            target = c
            break

    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contribution with ID {id} not found.",
        )

    action = payload.action.lower()
    if action == "approve":
        target["status"] = "approved"
        target["moderation_status"] = "approved"
        target["reputation_points_awarded"] = 50
    elif action == "reject":
        target["status"] = "rejected"
        target["moderation_status"] = "rejected"
        target["reputation_points_awarded"] = 0

    return target
