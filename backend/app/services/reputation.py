from typing import Any

from app.schemas.reputation import Badge, UserReputationProfile


class ReputationEngine:
    """Reputation, Recognition Ladder & Gamification Engine for LankaLens.

    Recognition Ladder Tiers:
    1. New Contributor: 0 - 249 Eco-Points.
    2. Verified Local: 250 - 749 Eco-Points, >= 80% AI Pass Rate, >= 0.75 Trust Score.
    3. Trusted Guide: 750+ Eco-Points, >= 90% AI Pass Rate, >= 0.85 Trust Score, >= 10 Approved Contributions.
       Unlocks "Trusted Guide" status & Guide Marketplace Upgrade eligibility.
    """

    @classmethod
    def compute_user_profile(
        cls,
        author_name: str,
        contributions: list[dict[str, Any]],
        community_posts: list[dict[str, Any]],
        reports: list[dict[str, Any]],
        guide_applications: list[dict[str, Any]],
    ) -> UserReputationProfile:
        author_name = author_name.strip()
        user_contribs = [
            c
            for c in contributions
            if c.get("author_name", "").strip().lower() == author_name.lower()
        ]
        user_posts = [
            p
            for p in community_posts
            if p.get("author", "").strip().lower() == author_name.lower()
        ]

        total_submissions = len(user_contribs)
        approved_count = sum(1 for c in user_contribs if c.get("status") == "approved")
        rejected_count = sum(1 for c in user_contribs if c.get("status") == "rejected")

        # Count community reports targeting user's contributions or posts
        sustained_reports = sum(
            1
            for r in reports
            if r.get("reporter_name", "").strip().lower() != author_name.lower()
            and r.get("status") in ["pending", "resolved"]
            and r.get("target_type") in ["contribution", "post"]
        )

        ai_pass_rate = (
            round((approved_count / total_submissions) * 100.0, 1)
            if total_submissions > 0
            else 100.0
        )

        total_likes = sum(p.get("likes_count", 0) for p in user_posts)
        total_comments = sum(p.get("commentsCount", 0) for p in user_posts)

        # Points System & Penalties
        base_points = approved_count * 50
        penalties = (rejected_count * 30) + (sustained_reports * 50)
        calculated_points = max(0, base_points - penalties)

        # Anti-Gaming Capping: Maximum 250 points accrued per rolling 24h
        daily_accrued = min(calculated_points, 250)
        eco_points = calculated_points

        # Dynamic Reputation Score (0.00 to 100.00)
        engagement_factor = min(1.0, (total_likes + total_comments) / 40.0)
        volume_factor = min(1.0, approved_count / 10.0)

        rep_score = (
            (ai_pass_rate * 0.40)
            + (volume_factor * 35.0)
            + (engagement_factor * 25.0)
            - (rejected_count * 6.0)
            - (sustained_reports * 12.0)
        )
        reputation_score = max(0.00, min(100.00, round(rep_score, 2)))

        # Recognition Ladder Rank Determination
        if eco_points >= 750 and ai_pass_rate >= 90.0 and approved_count >= 10:
            rank = "Trusted Guide"
        elif eco_points >= 250 and ai_pass_rate >= 80.0:
            rank = "Verified Local"
        else:
            rank = "New Contributor"

        is_guide_eligible = rank == "Trusted Guide" or (
            eco_points >= 750 and ai_pass_rate >= 90.0
        )

        # Guide Upgrade Application Status
        app = next(
            (
                a
                for a in guide_applications
                if a.get("author_name", "").strip().lower() == author_name.lower()
            ),
            None,
        )
        if app:
            guide_status = app.get("status", "applied")
        elif is_guide_eligible:
            guide_status = "eligible"
        else:
            guide_status = "none"

        # Badges Showcase
        badges: list[Badge] = []
        if approved_count >= 1:
            badges.append(
                Badge(
                    id="pioneer_cartographer",
                    title="Pioneer Cartographer",
                    description="Submitted 1st verified Sri Lankan tourism discovery.",
                    icon="map_pin",
                    unlocked_at="2026-09-10",
                )
            )
        if approved_count >= 5 and ai_pass_rate >= 85.0:
            badges.append(
                Badge(
                    id="geofence_sentinel",
                    title="Geofence Sentinel",
                    description="Achieved high geographic accuracy across 5+ contributions.",
                    icon="shield_check",
                    unlocked_at="2026-09-11",
                )
            )
        if rank in ["Verified Local", "Trusted Guide"]:
            badges.append(
                Badge(
                    id="verified_local",
                    title="Verified Local",
                    description="Reached Verified Local recognition threshold (250+ pts).",
                    icon="award",
                    unlocked_at="2026-09-12",
                )
            )
        if rank == "Trusted Guide":
            badges.append(
                Badge(
                    id="trusted_guide",
                    title="Trusted Guide Elite",
                    description="Achieved top-tier Trusted Guide status & Marketplace eligibility.",
                    icon="star",
                    unlocked_at="2026-09-12",
                )
            )

        return UserReputationProfile(
            author_name=author_name,
            rank=rank,
            eco_points=eco_points,
            reputation_score=reputation_score,
            ai_pass_rate=ai_pass_rate,
            approved_count=approved_count,
            rejected_count=rejected_count,
            total_submissions=total_submissions,
            total_likes_received=total_likes,
            total_comments_received=total_comments,
            badges=badges,
            is_guide_eligible=is_guide_eligible,
            guide_upgrade_status=guide_status,
            daily_points_accrued=daily_accrued,
        )
