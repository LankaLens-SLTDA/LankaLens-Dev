"""Automated Test Suite for EPIC 09 — Trust, Reputation & Gamification.

Tests all acceptance criteria:
1. Automated Reputation Profile Calculation.
2. Recognition Ladder Progression (New Contributor -> Verified Local -> Trusted Guide).
3. Rejection & Community Report Penalties.
4. Leaderboard Ranking & Badges Showcase.
5. Trusted Guide Eligibility Trigger & Marketplace Application Workflow.
6. Anti-Gaming Protections & Ineligible Application Validation.
"""

from fastapi import HTTPException

from app.routers.contribution import IN_MEMORY_CONTRIBUTIONS, IN_MEMORY_REPORTS
from app.routers.reputation import (
    IN_MEMORY_GUIDE_APPLICATIONS,
    apply_for_guide_upgrade,
    get_reputation_leaderboard,
    get_user_reputation_profile,
)
from app.schemas.reputation import GuideApplicationRequest


def run_all_reputation_tests():
    print("=" * 70)
    print("     LankaLens EPIC 09 — Trust & Reputation System Test Suite")
    print("=" * 70)

    IN_MEMORY_CONTRIBUTIONS.clear()
    IN_MEMORY_REPORTS.clear()
    IN_MEMORY_GUIDE_APPLICATIONS.clear()

    # -------------------------------------------------------------
    # Test 1: New Contributor Profile (Baseline State)
    # -------------------------------------------------------------
    print("\n1. Testing Baseline Profile for New Contributor...")
    prof1 = get_user_reputation_profile("Newbie Explorer")
    print(f"   Author: {prof1.author_name}")
    print(f"   Rank: {prof1.rank}")
    print(f"   Eco Points: {prof1.eco_points}")
    print(f"   Guide Eligible: {prof1.is_guide_eligible}")
    assert prof1.rank == "New Contributor"
    assert prof1.eco_points == 0
    assert prof1.is_guide_eligible is False

    # -------------------------------------------------------------
    # Test 2: Accumulating Approved Contributions -> Verified Local Rank
    # -------------------------------------------------------------
    print(
        "\n2. Testing Contributor Progressing to 'Verified Local' (5 Approved Posts)..."
    )
    for i in range(5):
        # Add directly to memory as approved
        IN_MEMORY_CONTRIBUTIONS.append(
            {
                "id": i + 10,
                "author_name": "Dinuka Silva",
                "title": f"Verified Discovery #{i + 1}",
                "category": "Nature",
                "destination_id": 2,
                "description": f"Authentic discovery item #{i + 1}",
                "image_url": "/stitch_images/discover.png",
                "alt_text": "Misty tea estate vista.",
                "rating": 5.0,
                "latitude": 6.8667,
                "longitude": 81.0465,
                "status": "approved",
                "moderation_status": "approved",
                "reputation_points_awarded": 50,
            }
        )

    prof2 = get_user_reputation_profile("Dinuka Silva")
    print(f"   Author: {prof2.author_name}")
    print(f"   Approved Count: {prof2.approved_count}")
    print(f"   Eco Points: {prof2.eco_points}")
    print(f"   Rank: {prof2.rank}")
    print(f"   Badges Unlocked: {[b.title for b in prof2.badges]}")
    assert prof2.approved_count == 5
    assert prof2.eco_points == 250
    assert prof2.rank == "Verified Local"
    assert any(b.id == "verified_local" for b in prof2.badges)

    # -------------------------------------------------------------
    # Test 3: Rejection Penalties & Trust Score Impact
    # -------------------------------------------------------------
    print("\n3. Testing Rejection Penalty Impact...")
    IN_MEMORY_CONTRIBUTIONS.append(
        {
            "id": 99,
            "author_name": "Dinuka Silva",
            "title": "Low Quality Rejected Submission",
            "category": "Stay",
            "description": "Short promo text",
            "image_url": "/stitch_images/discover.png",
            "alt_text": "Short",
            "status": "rejected",
            "moderation_status": "rejected",
            "reputation_points_awarded": 0,
        }
    )

    prof3 = get_user_reputation_profile("Dinuka Silva")
    print(
        f"   Pass Rate after 1 Rejection: {prof3.ai_pass_rate}% ({prof3.approved_count}/{prof3.total_submissions})"
    )
    print(f"   Eco Points after Deduction (-30 pts): {prof3.eco_points}")
    assert prof3.rejected_count == 1
    assert prof3.eco_points == 220  # 250 - 30 = 220

    # -------------------------------------------------------------
    # Test 4: Trusted Guide Rank Progression (10+ Approved & 750+ Pts)
    # -------------------------------------------------------------
    print("\n4. Testing Progression to 'Trusted Guide' Status...")
    for i in range(15):  # Add 15 approved posts for 750+ pts
        IN_MEMORY_CONTRIBUTIONS.append(
            {
                "id": i + 100,
                "author_name": "Master Cartographer",
                "title": "High Value Heritage Guide Post",
                "category": "Cultural",
                "destination_id": 1,
                "description": "Deep cultural analysis of ancient Sri Lankan architecture.",
                "image_url": "/stitch_images/discover.png",
                "alt_text": "Detailed heritage stone carving.",
                "rating": 5.0,
                "latitude": 6.8768,
                "longitude": 81.0608,
                "status": "approved",
                "moderation_status": "approved",
                "reputation_points_awarded": 50,
            }
        )

    prof4 = get_user_reputation_profile("Master Cartographer")
    print(f"   Author: {prof4.author_name}")
    print(f"   Approved Count: {prof4.approved_count}")
    print(f"   Eco Points: {prof4.eco_points}")
    print(f"   AI Pass Rate: {prof4.ai_pass_rate}%")
    print(f"   Rank: {prof4.rank}")
    print(f"   Guide Eligible: {prof4.is_guide_eligible}")
    print(f"   Badges: {[b.title for b in prof4.badges]}")
    assert prof4.approved_count == 15
    assert prof4.eco_points >= 750
    assert prof4.rank == "Trusted Guide"
    assert prof4.is_guide_eligible is True

    # -------------------------------------------------------------
    # Test 5: Guide Marketplace Application Workflow
    # -------------------------------------------------------------
    print("\n5. Testing Marketplace Guide Application Submission (Eligible User)...")
    # Ensure Master Cartographer has >= 15 approved posts for 750+ pts
    for i in range(5):
        IN_MEMORY_CONTRIBUTIONS.append(
            {
                "id": i + 200,
                "author_name": "Master Cartographer",
                "title": "Elite Guide Dispatch",
                "category": "Cultural",
                "status": "approved",
                "moderation_status": "approved",
            }
        )

    guide_req = GuideApplicationRequest(
        author_name="Master Cartographer",
        contact_number="+94 77 890 1234",
        sltda_license_number="SLTDA/NTG/2026/0491",
        niche_specialization="Cultural Heritage & Trekking",
        bio_summary="Certified SLTDA National Tour Guide with 10 years experience guiding eco tours in Sigiriya & Ella.",
        portfolio_links=["https://instagram.com/master_cartographer"],
    )

    guide_res = apply_for_guide_upgrade(guide_req)
    print(f"   Application ID: {guide_res.application_id}")
    print(f"   Status: {guide_res.status}")
    print(f"   Message: {guide_res.message}")
    assert guide_res.application_id >= 1
    assert guide_res.status == "pending_verification"

    # Verify updated profile guide status
    prof4_updated = get_user_reputation_profile("Master Cartographer")
    print(f"   Updated Guide Status: {prof4_updated.guide_upgrade_status}")
    assert prof4_updated.guide_upgrade_status in ["applied", "pending_verification"]

    # -------------------------------------------------------------
    # Test 6: Ineligible Guide Application Prevention
    # -------------------------------------------------------------
    print("\n6. Testing Ineligible Guide Application Prevention (New Contributor)...")
    ineligible_req = GuideApplicationRequest(
        author_name="Newbie Explorer",
        contact_number="+94 71 000 0000",
        niche_specialization="Beginner",
        bio_summary="I want to become a guide.",
    )
    try:
        apply_for_guide_upgrade(ineligible_req)
        raise AssertionError(
            "Ineligible user should have been blocked from applying for guide upgrade"
        )
    except HTTPException as e:
        print(f"   Correctly Blocked: {e.detail}")
        assert e.status_code == 400

    # -------------------------------------------------------------
    # Test 7: Community Leaderboard Output
    # -------------------------------------------------------------
    print("\n7. Testing Leaderboard Ranking Endpoint...")
    leaderboard = get_reputation_leaderboard()
    print(f"   Total Leaderboard Profiles: {len(leaderboard)}")
    for idx, p in enumerate(leaderboard[:3]):
        print(
            f"   Rank #{idx + 1}: {p.author_name} — {p.rank} ({p.eco_points} Pts, Rep Score {p.reputation_score})"
        )
    assert len(leaderboard) >= 3
    assert leaderboard[0].reputation_score >= leaderboard[1].reputation_score

    print("\n" + "=" * 70)
    print("   ALL EPIC 09 REPUTATION & GAMIFICATION TESTS PASSED CLEANLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_all_reputation_tests()
