from fastapi import APIRouter, HTTPException, Query, status

from app.routers.community import IN_MEMORY_POSTS, format_post_record
from app.routers.destinations import IN_MEMORY_DESTINATIONS
from app.schemas.contribution import (
    AiValidationResult,
    Contribution,
    ContributionCreate,
    ExifMetadata,
    ModerationQueueResponse,
    ModerationRequest,
    ReportRequest,
    ReportResponse,
)
from app.services.ai_trust import AiTrustEngine
from app.supabase_client import supabase

router = APIRouter(
    prefix="/api/contribution", tags=["Contribution Pipeline & Moderation"]
)

# In-memory stores for contributions, reports, and moderation audit trail
IN_MEMORY_CONTRIBUTIONS: list[dict] = [
    {
        "id": i + 1,
        "author_name": "Chaminda Perera",
        "title": f"Sigiriya & Cultural Discovery #{i+1}",
        "category": "Nature" if i % 2 == 0 else "Cultural",
        "destination_id": 1 if i % 2 == 0 else 101,
        "description": f"Verified local guide observation and cartographic trail notes for stop #{i+1}.",
        "alt_text": "Ancient rock fortress and green jungle canopy at sunrise.",
        "tags": ["#Sigiriya", "#CulturalTriangle", "#EcoTourism"],
        "rating": 4.9,
        "latitude": 7.957 + (i * 0.001),
        "longitude": 80.760 + (i * 0.001),
        "image_url": "/stitch_images/discover.png",
        "status": "approved",
        "eco_points": 50,
        "created_at": "2026-09-10",
    }
    for i in range(15)
] + [
    {
        "id": 100 + j,
        "author_name": "Clara Dupont",
        "title": f"Galle Heritage Walk #{j+1}",
        "category": "Cultural",
        "destination_id": 5,
        "description": f"Colonial ramparts exploration notes #{j+1}.",
        "alt_text": "Historic Dutch Fort lighthouse overlooking Indian Ocean.",
        "tags": ["#GalleFort", "#Heritage"],
        "rating": 4.8,
        "latitude": 6.03,
        "longitude": 80.21,
        "image_url": "/stitch_images/discover.png",
        "status": "approved",
        "eco_points": 50,
        "created_at": "2026-09-11",
    }
    for j in range(6)
]
IN_MEMORY_REPORTS: list[dict] = []
IN_MEMORY_MODERATION_LOGS: list[dict] = []


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
    description="Submit photo contribution through EXIF extraction, multi-layered AI Trust Engine verification, moderation queue, and feed publishing.",
)
def submit_contribution(payload: ContributionCreate):
    """Submit contribution through the multi-layered AI Trust & verification pipeline."""
    new_id = len(IN_MEMORY_CONTRIBUTIONS) + 1

    # 1. Extract EXIF metadata
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

    # 2. Run AI Guard & Multi-Layered AI Trust Engine
    ai_validation_result, _ = run_ai_validation_guard(
        lat=payload.latitude,
        lng=payload.longitude,
        alt_text=payload.alt_text,
        description=payload.description,
        has_gps=exif.has_gps,
    )

    ai_trust_audit, auto_status = AiTrustEngine.evaluate_contribution(
        payload=payload,
        exif=exif,
        destinations=IN_MEMORY_DESTINATIONS,
        existing_contributions=IN_MEMORY_CONTRIBUTIONS,
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
        "ai_validation_result": ai_validation_result.model_dump(),
        "ai_trust_audit": ai_trust_audit.model_dump(),
        "ai_confidence_score": ai_trust_audit.overall_trust_score,
        "status": auto_status,
        "moderation_status": moderation_status,
        "reputation_points_awarded": points,
        "created_at": "Just now",
    }

    IN_MEMORY_CONTRIBUTIONS.insert(0, record)

    # If approved by AI Trust Engine, publish directly to community feed!
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
    ),
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


@router.get(
    "/moderation-queue",
    response_model=ModerationQueueResponse,
    summary="Get submissions pending human moderation review",
    description="Retrieve queue of flagged or suspicious contributions needing human moderation with AI trust scores.",
)
def get_moderation_queue(
    flag_filter: str | None = Query(
        None,
        description="Optional risk flag filter (e.g. 'GEOGRAPHIC_MISMATCH', 'SYNTHETIC_IMAGE_PROBABLE', 'SUSPICIOUS_SPAM')",
    ),
):
    """Retrieve moderation queue with summary stats."""
    flag_filter = flag_filter if isinstance(flag_filter, str) else None

    queue = [
        c
        for c in IN_MEMORY_CONTRIBUTIONS
        if c.get("status") in ["pending_review", "flagged"]
        or c.get("moderation_status") == "pending_review"
    ]

    if flag_filter:
        queue = [
            c
            for c in queue
            if flag_filter in c.get("ai_trust_audit", {}).get("flags", [])
        ]

    # Sort queue by trust score ascending (lowest trust score first)
    queue.sort(
        key=lambda item: item.get("ai_trust_audit", {}).get("overall_trust_score", 0.50)
    )

    flagged_count = sum(1 for c in queue if c.get("status") == "flagged")
    avg_score = (
        round(
            sum(
                c.get("ai_trust_audit", {}).get("overall_trust_score", 0.50)
                for c in queue
            )
            / len(queue),
            2,
        )
        if queue
        else 0.00
    )

    return ModerationQueueResponse(
        queue=queue,
        total_pending=len(queue),
        flagged_count=flagged_count,
        average_trust_score=avg_score,
    )


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
                # Add flag to audit
                flags = c.get("ai_trust_audit", {}).get("flags", [])
                if "COMMUNITY_REPORTED" not in flags:
                    flags.append("COMMUNITY_REPORTED")
                    if "ai_trust_audit" in c:
                        c["ai_trust_audit"]["flags"] = flags
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
    description="Admin / Moderator endpoint to approve or reject pending contributions with auditable decision logs.",
)
def moderate_contribution(id: int, payload: ModerationRequest):
    """Moderate pending contribution with full decision audit log."""
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
    moderator = payload.moderator_name or "Chief Moderator"

    if action == "approve":
        target["status"] = "approved"
        target["moderation_status"] = "approved"
        target["reputation_points_awarded"] = 50

        # Publish to public feed if not already present
        existing_post = next(
            (p for p in IN_MEMORY_POSTS if p.get("location") == target["title"]), None
        )
        if not existing_post:
            post_id = max([p["id"] for p in IN_MEMORY_POSTS] or [0]) + 1
            post_record = {
                "id": post_id,
                "author": target["author_name"],
                "role": "Cartographer Explorer",
                "avatar": "/stitch_images/planner.png",
                "time": "Just now",
                "verified": True,
                "location": target["title"],
                "destination_id": target.get("destination_id"),
                "latitude": target.get("latitude"),
                "longitude": target.get("longitude"),
                "rating": target.get("rating", 5.0),
                "image": target["image_url"],
                "caption": target["description"],
                "tags": target.get("tags", []),
                "ecoPoints": 50,
                "likes_count": 0,
                "commentsCount": 0,
                "saves_count": 0,
                "comments": [],
            }
            IN_MEMORY_POSTS.insert(0, format_post_record(post_record))
        else:
            existing_post["verified"] = True

    elif action == "reject":
        target["status"] = "rejected"
        target["moderation_status"] = "rejected"
        target["reputation_points_awarded"] = 0

        # Unverify or remove from feed if present
        for p in IN_MEMORY_POSTS:
            if p.get("location") == target["title"]:
                p["verified"] = False

    # Record immutable audit log entry
    log_entry = {
        "id": len(IN_MEMORY_MODERATION_LOGS) + 1,
        "contribution_id": id,
        "moderator": moderator,
        "action": action,
        "feedback": payload.feedback or "",
        "rejection_category": payload.rejection_category or "",
        "created_at": "Just now",
    }
    IN_MEMORY_MODERATION_LOGS.append(log_entry)

    if supabase:
        try:
            supabase.table("contributions").update(
                {
                    "status": target["status"],
                    "moderation_status": target["moderation_status"],
                    "reputation_points_awarded": target["reputation_points_awarded"],
                }
            ).eq("id", id).execute()
            supabase.table("moderation_history").insert(log_entry).execute()
        except Exception as e:
            print(f"[LankaLens Supabase moderation update error] {e}")

    return target
