import math
import re
from datetime import datetime, timezone
from typing import Any

from app.schemas.contribution import AiTrustAudit, ContributionCreate, ExifMetadata

# Author submission velocity memory: {author_name: [timestamp, ...]}
AUTHOR_SUBMISSION_TIMESTAMPS: dict[str, list[float]] = {}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    r = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)


def compute_text_jaccard_similarity(text1: str, text2: str) -> float:
    """Calculates Jaccard similarity coefficient between two text strings based on word tokens."""
    words1 = set(re.findall(r"\w+", text1.lower()))
    words2 = set(re.findall(r"\w+", text2.lower()))
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return round(len(intersection) / len(union), 2)


class AiTrustEngine:
    """AI-powered Multi-Layered Verification Engine for LankaLens Community Content.

    Screening Layers:
    1. Geographic Verification: Geofence bounds & distance to target destination.
    2. Image Verification & Authenticity: Detects synthetic/AI markers & non-tourism imagery.
    3. NLP Content Safety & Spam: Checks profanity, scam URLs, commercial spam keywords.
    4. Velocity & Duplicate Signals: Submissions rate limiting & duplicate content detection.
    5. Aggregation & Graceful Degradation: Exception-isolated score computation.
    """

    @classmethod
    def evaluate_contribution(
        cls,
        payload: ContributionCreate,
        exif: ExifMetadata,
        destinations: list[dict[str, Any]],
        existing_contributions: list[dict[str, Any]],
    ) -> tuple[AiTrustAudit, str]:
        """Evaluates contribution and returns (AiTrustAudit, status_string). Guaranteed never to raise unhandled exceptions."""
        try:
            return cls._run_evaluation(
                payload, exif, destinations, existing_contributions
            )
        except Exception as e:
            # Graceful Degradation / AI Failure Fallback
            print(f"[AiTrustEngine Fallback Error] {e}")
            fallback_audit = AiTrustAudit(
                overall_trust_score=0.50,
                geo_consistency_score=0.50,
                distance_to_destination_km=None,
                image_authenticity_score=0.50,
                is_synthetic_image=False,
                text_safety_score=0.50,
                spam_risk_score=0.50,
                duplicate_risk_score=0.50,
                ai_fallback_triggered=True,
                flags=["AI_SERVICE_FALLBACK_TRIGGERED"],
                summary_notes="AI evaluation encountered an internal error. Routed safely to human moderation queue.",
            )
            return fallback_audit, "pending_review"

    @classmethod
    def _run_evaluation(
        cls,
        payload: ContributionCreate,
        exif: ExifMetadata,
        destinations: list[dict[str, Any]],
        existing_contributions: list[dict[str, Any]],
    ) -> tuple[AiTrustAudit, str]:
        flags: list[str] = []

        # -------------------------------------------------------------
        # Layer 1: Geographic Verification
        # -------------------------------------------------------------
        geo_score = 1.00
        dist_km: float | None = None
        lat = payload.latitude if payload.latitude is not None else exif.latitude
        lng = payload.longitude if payload.longitude is not None else exif.longitude

        # 1a. Sri Lanka Geofence Check (Lat: 5.5° - 10.0° N, Lng: 79.5° - 82.2° E)
        if lat is not None and lng is not None:
            in_sri_lanka = 5.5 <= lat <= 10.0 and 79.5 <= lng <= 82.2
            if not in_sri_lanka:
                geo_score -= 0.50
                flags.append("OOB_SRI_LANKA_BOUNDARY")
        else:
            geo_score -= 0.25
            flags.append("MISSING_GPS_COORDINATES")

        # 1b. Distance to Linked Destination
        if payload.destination_id is not None and lat is not None and lng is not None:
            dest = next(
                (d for d in destinations if d.get("id") == payload.destination_id), None
            )
            if dest and "latitude" in dest and "longitude" in dest:
                dest_lat = float(dest["latitude"])
                dest_lng = float(dest["longitude"])
                dist_km = haversine_distance_km(lat, lng, dest_lat, dest_lng)
                if dist_km > 25.0:
                    geo_score -= 0.40
                    flags.append("GEOGRAPHIC_MISMATCH")
                elif dist_km > 10.0:
                    geo_score -= 0.15

        # 1c. EXIF GPS vs User Coordinates Mismatch
        if (
            exif.has_gps
            + (
                exif.latitude is not None
                and exif.longitude is not None
                and payload.latitude is not None
                and payload.longitude is not None
            )
            >= 2
        ):
            if exif.latitude is not None and exif.longitude is not None:
                exif_user_dist = haversine_distance_km(
                    exif.latitude, exif.longitude, payload.latitude, payload.longitude
                )
                if exif_user_dist > 5.0:
                    geo_score -= 0.20
                    flags.append("EXIF_USER_GPS_MISMATCH")

        geo_score = max(0.00, min(1.00, round(geo_score, 2)))

        # -------------------------------------------------------------
        # Layer 2: Image Verification & Authenticity
        # -------------------------------------------------------------
        image_score = 0.95
        is_synthetic = False

        img_url = (payload.image_url or "").lower()
        # Synthetic AI Image Detection markers
        synthetic_keywords = [
            "ai_generated",
            "midjourney",
            "dalle",
            "stable_diffusion",
            "synthetic",
            "prompt_",
        ]
        if any(kw in img_url for kw in synthetic_keywords) or (
            "ai" in payload.tags or "#aigen" in [t.lower() for t in payload.tags]
        ):
            is_synthetic = True
            image_score -= 0.45
            flags.append("SYNTHETIC_IMAGE_PROBABLE")

        # Inappropriate / non-tourism imagery signals
        inappropriate_keywords = ["nsfw", "casino", "gambling", "weapon", "explicit"]
        if any(kw in img_url for kw in inappropriate_keywords) or any(
            kw in payload.description.lower() for kw in inappropriate_keywords
        ):
            image_score -= 0.80
            flags.append("INAPPROPRIATE_IMAGE_SIGNAL")

        image_score = max(0.00, min(1.00, round(image_score, 2)))

        # -------------------------------------------------------------
        # Layer 3: NLP Content Moderation & Spam Detection
        # -------------------------------------------------------------
        text_safety_score = 1.00
        spam_risk_score = 0.00

        full_text = f"{payload.title} {payload.description}".lower()

        # Profanity & abusive language check
        abusive_keywords = ["scam", "fraud", "fake", "idiot", "hate", "abuse"]
        if any(kw in full_text for kw in abusive_keywords):
            text_safety_score -= 0.40
            flags.append("ABUSIVE_TEXT_SIGNAL")

        # Commercial spam & URL detection
        spam_keywords = [
            "casino",
            "crypto",
            "free money",
            "viagra",
            "cheap loans",
            "whatsapp",
            "telegram",
            "http://",
            "https://",
            "www.",
            ".com",
            ".net",
        ]
        spam_matches = [kw for kw in spam_keywords if kw in full_text]
        if spam_matches:
            spam_risk_score += min(1.0, 0.40 * len(spam_matches))
            text_safety_score -= 0.35 * len(spam_matches)
            flags.append("SUSPICIOUS_SPAM")

        text_safety_score = max(0.00, min(1.00, round(text_safety_score, 2)))
        spam_risk_score = max(0.00, min(1.00, round(spam_risk_score, 2)))

        # -------------------------------------------------------------
        # Layer 4: Velocity & Duplicate Detection
        # -------------------------------------------------------------
        now_ts = datetime.now(timezone.utc).timestamp()
        author = payload.author_name.strip()

        # 4a. Velocity Check (max 3 posts in 2 minutes per author)
        timestamps = AUTHOR_SUBMISSION_TIMESTAMPS.get(author, [])
        recent_timestamps = [t for t in timestamps if now_ts - t < 120.0]
        recent_timestamps.append(now_ts)
        AUTHOR_SUBMISSION_TIMESTAMPS[author] = recent_timestamps

        velocity_flag = len(recent_timestamps) > 3
        if velocity_flag:
            flags.append("HIGH_VELOCITY_SUBMISSION")

        # 4b. Duplicate Content Check
        duplicate_risk_score = 0.00
        for item in existing_contributions:
            existing_title = item.get("title", "")
            existing_desc = item.get("description", "")
            title_sim = compute_text_jaccard_similarity(
                payload.title, existing_title
            )
            desc_sim = compute_text_jaccard_similarity(
                payload.description, existing_desc
            )
            if title_sim > 0.80 or desc_sim > 0.75:
                duplicate_risk_score = max(
                    duplicate_risk_score, max(title_sim, desc_sim)
                )
                if "DUPLICATE_CONTENT" not in flags:
                    flags.append("DUPLICATE_CONTENT")

        if velocity_flag:
            duplicate_risk_score = max(duplicate_risk_score, 0.60)

        # -------------------------------------------------------------
        # Layer 5: Aggregation & Final Trust Decision
        # -------------------------------------------------------------
        overall_score = (
            (0.30 * geo_score)
            + (0.25 * image_score)
            + (0.25 * text_safety_score)
            + (0.10 * (1.00 - spam_risk_score))
            + (0.10 * (1.00 - duplicate_risk_score))
        )

        if velocity_flag:
            overall_score -= 0.15

        overall_score = max(0.00, min(1.00, round(overall_score, 2)))

        # Categorization Decision Rules
        # Auto-Approve: score >= 0.85 and no critical anomaly flags
        critical_flags = [
            "GEOGRAPHIC_MISMATCH",
            "SYNTHETIC_IMAGE_PROBABLE",
            "INAPPROPRIATE_IMAGE_SIGNAL",
            "SUSPICIOUS_SPAM",
            "HIGH_VELOCITY_SUBMISSION",
            "DUPLICATE_CONTENT",
            "OOB_SRI_LANKA_BOUNDARY",
        ]
        has_critical = any(f in flags for f in critical_flags)

        if overall_score >= 0.85 and not has_critical:
            status_str = "approved"
            notes = "High-trust contribution verified across geographic, image, and text parameters."
        elif overall_score >= 0.40 or has_critical:
            status_str = "pending_review"
            notes = f"Flagged for moderation review due to: {', '.join(flags) if flags else 'borderline trust score'}."
        else:
            status_str = "rejected"
            notes = "Content failed minimum AI trust threshold."

        audit = AiTrustAudit(
            overall_trust_score=overall_score,
            geo_consistency_score=geo_score,
            distance_to_destination_km=dist_km,
            image_authenticity_score=image_score,
            is_synthetic_image=is_synthetic,
            text_safety_score=text_safety_score,
            spam_risk_score=spam_risk_score,
            duplicate_risk_score=duplicate_risk_score,
            ai_fallback_triggered=False,
            flags=flags,
            summary_notes=notes,
        )

        return audit, status_str
