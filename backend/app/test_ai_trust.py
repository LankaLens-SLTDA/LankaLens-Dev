"""Automated Test Suite for EPIC 08 — AI Trust & Moderation System.

Tests all 8 acceptance criteria:
1. High Trust Contribution (Auto-approved).
2. Geographic Mismatch Flagging (>25km from linked destination).
3. Synthetic / AI-generated Image Detection.
4. Commercial Spam & Toxic Content Screening.
5. Duplicate Content Signals.
6. High Submission Velocity Detection.
7. Graceful AI Engine Failure Fallback.
8. Moderation Queue & Moderator Approval Workflow.
"""

from app.routers.contribution import (
    IN_MEMORY_CONTRIBUTIONS,
    IN_MEMORY_REPORTS,
    get_moderation_queue,
    moderate_contribution,
    submit_contribution,
)
from app.schemas.contribution import (
    ContributionCreate,
    ExifMetadata,
    ModerationRequest,
)
from app.services.ai_trust import AiTrustEngine


def run_all_ai_trust_tests():
    print("=" * 70)
    print("      LankaLens EPIC 08 — AI Trust & Moderation Test Suite")
    print("=" * 70)

    IN_MEMORY_CONTRIBUTIONS.clear()
    IN_MEMORY_REPORTS.clear()

    # -------------------------------------------------------------
    # Test 1: High Trust Submission (Auto-approved)
    # -------------------------------------------------------------
    print("\n1. Testing High-Trust Contribution (Nine Arch Bridge)...")
    valid_payload = ContributionCreate(
        author_name="Kusal Perera",
        title="Morning Mist at Demodara Nine Arch Bridge",
        category="Nature",
        destination_id=1,  # Ella Nine Arch Bridge (Lat 6.8768, Lng 81.0608)
        description="Climbed down the tea bungalow trail at dawn. The morning mist over the viaduct valley is stunning.",
        alt_text="Golden morning sun illuminating iconic stone viaduct in Sri Lanka.",
        tags=["#NineArch", "#Ella", "#SriLanka"],
        rating=5.0,
        latitude=6.8768,  # Exact pin at destination
        longitude=81.0608,
        image_url="/stitch_images/discover.png",
    )
    res1 = submit_contribution(valid_payload)
    print(f"   Contribution ID: {res1['id']}")
    print(f"   Overall Trust Score: {res1['ai_trust_audit']['overall_trust_score']}")
    print(f"   Status: {res1['status']}")
    print(f"   Active Flags: {res1['ai_trust_audit']['flags']}")
    assert res1["status"] == "approved", "Expected high trust post to be auto-approved"
    assert res1["ai_trust_audit"]["overall_trust_score"] >= 0.85
    assert len(res1["ai_trust_audit"]["flags"]) == 0

    # -------------------------------------------------------------
    # Test 2: Geographic Mismatch (>25km from claimed destination)
    # -------------------------------------------------------------
    print("\n2. Testing Geographic Mismatch (>25km from Sigiriya)...")
    geo_mismatch_payload = ContributionCreate(
        author_name="Traveler Bob",
        title="Sigiriya Rock Climb",
        category="Cultural",
        destination_id=1,  # Sigiriya (Matale district)
        description="Enjoyed this climb tremendously during my trip.",
        alt_text="A massive rock monolith viewed from below.",
        tags=["#Sigiriya"],
        rating=4.5,
        latitude=6.9271,  # Colombo coordinates (~150km away from Sigiriya!)
        longitude=79.8612,
        image_url="/stitch_images/discover.png",
    )
    res2 = submit_contribution(geo_mismatch_payload)
    print(f"   Contribution ID: {res2['id']}")
    print(f"   Overall Trust Score: {res2['ai_trust_audit']['overall_trust_score']}")
    print(
        f"   Distance to Destination: {res2['ai_trust_audit']['distance_to_destination_km']} km"
    )
    print(f"   Status: {res2['status']}")
    print(f"   Active Flags: {res2['ai_trust_audit']['flags']}")
    assert res2["status"] == "pending_review", (
        "Geographic mismatch must route to moderation"
    )
    assert "GEOGRAPHIC_MISMATCH" in res2["ai_trust_audit"]["flags"]
    assert res2["ai_trust_audit"]["distance_to_destination_km"] > 25.0

    # -------------------------------------------------------------
    # Test 3: Synthetic / AI-Generated Image Signals
    # -------------------------------------------------------------
    print("\n3. Testing Synthetic AI Image Detection...")
    synthetic_payload = ContributionCreate(
        author_name="Digital Artist",
        title="Futuristic Fantasy Temple in Ella",
        category="Cultural",
        destination_id=2,  # Ella Gap
        description="Generated a ultra-hd hyperrealistic rendering of Ella gap.",
        alt_text="Digital art render of tea estates.",
        tags=["#Ella", "#AI", "#aigen"],
        rating=4.0,
        latitude=6.8667,
        longitude=81.0465,
        image_url="/stitch_images/midjourney_ai_generated_render.png",
    )
    res3 = submit_contribution(synthetic_payload)
    print(f"   Contribution ID: {res3['id']}")
    print(f"   Synthetic Flag: {res3['ai_trust_audit']['is_synthetic_image']}")
    print(
        f"   Image Authenticity Score: {res3['ai_trust_audit']['image_authenticity_score']}"
    )
    print(f"   Status: {res3['status']}")
    print(f"   Active Flags: {res3['ai_trust_audit']['flags']}")
    assert res3["ai_trust_audit"]["is_synthetic_image"] is True
    assert "SYNTHETIC_IMAGE_PROBABLE" in res3["ai_trust_audit"]["flags"]

    # -------------------------------------------------------------
    # Test 4: Commercial Spam & URL Screening
    # -------------------------------------------------------------
    print("\n4. Testing Commercial Spam Screening...")
    spam_payload = ContributionCreate(
        author_name="Spam Bot 3000",
        title="Cheap Loans & Casino Deals in Colombo",
        category="Stay",
        description="Get free crypto loans and online casino bonuses at http://cheap-casino-loans.com now!",
        alt_text="Spam banner text image.",
        tags=["#Casino", "#Loans"],
        rating=1.0,
        latitude=6.9271,
        longitude=79.8612,
        image_url="/stitch_images/discover.png",
    )
    res4 = submit_contribution(spam_payload)
    print(f"   Contribution ID: {res4['id']}")
    print(f"   Spam Risk Score: {res4['ai_trust_audit']['spam_risk_score']}")
    print(f"   Status: {res4['status']}")
    print(f"   Active Flags: {res4['ai_trust_audit']['flags']}")
    assert res4["ai_trust_audit"]["spam_risk_score"] > 0.50
    assert "SUSPICIOUS_SPAM" in res4["ai_trust_audit"]["flags"]

    # -------------------------------------------------------------
    # Test 5: Duplicate Content Detection
    # -------------------------------------------------------------
    print("\n5. Testing Duplicate Submission Signals...")
    dup_payload = ContributionCreate(
        author_name="Copycat User",
        title="Morning Mist at Demodara Nine Arch Bridge",  # Same title as Test 1
        category="Nature",
        destination_id=1,
        description="Climbed down the tea bungalow trail at dawn. The morning mist over the viaduct valley is stunning.",
        alt_text="Golden morning sun illuminating iconic stone viaduct in Sri Lanka.",
        tags=["#NineArch"],
        rating=5.0,
        latitude=6.8768,
        longitude=81.0608,
        image_url="/stitch_images/discover.png",
    )
    res5 = submit_contribution(dup_payload)
    print(f"   Contribution ID: {res5['id']}")
    print(f"   Duplicate Risk Score: {res5['ai_trust_audit']['duplicate_risk_score']}")
    print(f"   Status: {res5['status']}")
    print(f"   Active Flags: {res5['ai_trust_audit']['flags']}")
    assert "DUPLICATE_CONTENT" in res5["ai_trust_audit"]["flags"]

    # -------------------------------------------------------------
    # Test 6: Velocity Check (Rapid successive posts)
    # -------------------------------------------------------------
    print("\n6. Testing High Velocity Submission Detection...")
    for i in range(4):
        rapid_payload = ContributionCreate(
            author_name="Rapid Poster",
            title=f"Rapid Post #{i + 1}",
            category="Nature",
            description=f"Rapid automated submission post iteration number {i + 1}.",
            alt_text="Generic landscape view.",
            latitude=6.8667,
            longitude=81.0465,
        )
        res_rapid = submit_contribution(rapid_payload)
    print(f"   Fourth Rapid Post ID: {res_rapid['id']}")
    print(f"   Status: {res_rapid['status']}")
    print(f"   Active Flags: {res_rapid['ai_trust_audit']['flags']}")
    assert "HIGH_VELOCITY_SUBMISSION" in res_rapid["ai_trust_audit"]["flags"]

    # -------------------------------------------------------------
    # Test 7: AI Service Failure Graceful Fallback
    # -------------------------------------------------------------
    print("\n7. Testing AI Failure Graceful Fallback...")
    exif_dummy = ExifMetadata(latitude=6.86, longitude=81.04)

    def crashing_eval(*args, **kwargs):
        raise RuntimeError("Simulated AI Model Service Timeout")

    original_run = AiTrustEngine._run_evaluation
    AiTrustEngine._run_evaluation = crashing_eval

    fallback_audit, fallback_status = AiTrustEngine.evaluate_contribution(
        payload=valid_payload,
        exif=exif_dummy,
        destinations=[],
        existing_contributions=[],
    )
    AiTrustEngine._run_evaluation = original_run

    print(f"   Fallback Triggered: {fallback_audit.ai_fallback_triggered}")
    print(f"   Fallback Status: {fallback_status}")
    print(f"   Fallback Flags: {fallback_audit.flags}")
    assert fallback_audit.ai_fallback_triggered is True
    assert fallback_status == "pending_review"
    assert "AI_SERVICE_FALLBACK_TRIGGERED" in fallback_audit.flags

    # -------------------------------------------------------------
    # Test 8: Moderation Queue & Moderator Decisions
    # -------------------------------------------------------------
    print(
        "\n8. Testing GET /api/contribution/moderation-queue & Moderation Endpoint..."
    )
    queue_res = get_moderation_queue(flag_filter=None)
    print(f"   Total Pending Items in Queue: {queue_res.total_pending}")
    print(f"   Average Queue Trust Score: {queue_res.average_trust_score}")
    assert queue_res.total_pending >= 3

    # Test Moderator Approval on ID 2 (Geographic Mismatch)
    mod_req = ModerationRequest(
        action="approve",
        moderator_name="Senior Cartographer",
        feedback="Verified photo landmark manually.",
    )
    approved_res = moderate_contribution(id=2, payload=mod_req)
    print(f"   Moderated Item #2 New Status: {approved_res['status']}")
    assert approved_res["status"] == "approved"
    assert approved_res["moderation_status"] == "approved"
    assert approved_res["reputation_points_awarded"] == 50

    print("\n" + "=" * 70)
    print("   ALL EPIC 08 AI TRUST & MODERATION TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_ai_trust_tests()
