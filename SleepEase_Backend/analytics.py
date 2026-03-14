"""
analytics.py – Advanced Analytics Engine for SleepEase
=======================================================
Provides quantitative metrics required by the Capstone proposal:
  - Sleep Improvement Index (SII)
  - Emotion Stability Score (ESS)
  - User Persona Mining
  - Churn Metrics
  - Engagement Density
  - Retention Cohort Analysis
  - BI Dashboard Aggregate Stats
"""

from datetime import datetime, timedelta
from collections import defaultdict
from firebase_admin import firestore
import math


# ── Mood-to-score mapping (shared) ──────────────────────────────────────────
MOOD_SCORE = {
    "happy": 0.9, "calm": 0.85, "grateful": 0.8, "hopeful": 0.75,
    "content": 0.7, "neutral": 0.5, "tired": 0.35, "sad": 0.3,
    "anxious": 0.25, "stressed": 0.2, "overwhelmed": 0.15, "angry": 0.1,
}


# ═══════════════════════════════════════════════════════════════════════════
# 1. Sleep Improvement Index (SII) — enhanced version
# ═══════════════════════════════════════════════════════════════════════════

def calculate_sleep_index(db, user_id) -> dict:
    """
    Calculates the Sleep Improvement Index (0-100) with sub-metrics.
    Compares the last 7 days vs the previous 7 days across three dimensions:
      • quality_score  – weighted sleep quality
      • consistency    – how regular the sleep schedule is
      • duration_fit   – how close to 7-9h ideal range
    """
    try:
        now = datetime.utcnow()
        last_7 = now - timedelta(days=7)
        prev_7 = now - timedelta(days=14)

        logs = list(
            db.collection("sleep_logs")
            .where("user_id", "==", user_id)
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(60)
            .stream()
        )

        recent = []  # last 7 days
        older = []   # days 8-14

        for log in logs:
            data = log.to_dict()
            ts = data.get("created_at")
            if ts is None:
                continue
            quality = data.get("quality", 5)
            hours = data.get("hours", 7)
            entry = {"quality": quality, "hours": hours, "ts": ts}
            if ts >= last_7:
                recent.append(entry)
            elif ts >= prev_7:
                older.append(entry)

        def _calc_metrics(entries):
            if not entries:
                return {"quality": 5.0, "hours_dev": 1.0, "consistency": 0}
            qs = [e["quality"] for e in entries]
            hs = [e["hours"] for e in entries]
            avg_q = sum(qs) / len(qs)
            # Ideal hours = 8; deviation from ideal range [7,9]
            hours_dev = sum(abs(h - 8) for h in hs) / len(hs)
            consistency = len(entries)  # number of logged days
            return {"quality": avg_q, "hours_dev": hours_dev, "consistency": consistency}

        r = _calc_metrics(recent)
        o = _calc_metrics(older)

        # Quality dimension (0-40)
        quality_score = (r["quality"] / 10) * 40
        # Duration fitness (0-30): lower deviation = better
        duration_fit = max(0, 30 - r["hours_dev"] * 10)
        # Consistency dimension (0-30): 7 entries = perfect
        consistency_score = min(30, (r["consistency"] / 7) * 30)

        sii = round(quality_score + duration_fit + consistency_score, 2)

        # Trend vs previous period
        old_q = (o["quality"] / 10) * 40
        old_d = max(0, 30 - o["hours_dev"] * 10)
        old_c = min(30, (o["consistency"] / 7) * 30)
        old_sii = old_q + old_d + old_c
        trend = round(sii - old_sii, 2) if older else 0

        return {
            "sleep_improvement_index": sii,
            "sub_scores": {
                "quality_score": round(quality_score, 2),
                "duration_fitness": round(duration_fit, 2),
                "consistency": round(consistency_score, 2),
            },
            "trend_vs_last_week": trend,
            "recent_entries": len(recent),
            "comparison_entries": len(older),
        }
    except Exception as e:
        print(f"Sleep Index Error: {e}")
        return {"sleep_improvement_index": 50.0, "sub_scores": {}, "trend_vs_last_week": 0}


# ═══════════════════════════════════════════════════════════════════════════
# 2. Emotion Stability Score (ESS) — comprehensive
# ═══════════════════════════════════════════════════════════════════════════

def calculate_emotion_stability(db, user_id) -> dict:
    """
    Emotion Stability Score (0-100) computed from:
      • mood_variance     – variance of mood scores (lower = more stable)
      • sentiment_trend   – sentiment improvement over time
      • stability_avg     – average AI-detected stability from chat_logs
      • streak_bonus      – bonus for consecutive daily check-ins
    """
    try:
        # ---- Mood logs ----
        mood_docs = list(
            db.collection("mood_logs")
            .where("user_id", "==", user_id)
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(60)
            .stream()
        )

        mood_scores = []
        mood_dates = []
        for d in mood_docs:
            md = d.to_dict()
            m = md.get("mood", "neutral").lower()
            mood_scores.append(MOOD_SCORE.get(m, 0.5))
            ts = md.get("created_at")
            if hasattr(ts, "date"):
                mood_dates.append(ts.date())

        # ---- Chat-derived stability ----
        chat_docs = list(
            db.collection("chat_logs")
            .where("user_id", "==", user_id)
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(30)
            .stream()
        )
        chat_stabilities = [d.to_dict().get("stability_score", 0.5) for d in chat_docs]
        chat_sentiments = [d.to_dict().get("sentiment", 0.5) for d in chat_docs]

        # Sub-scores
        # (a) Mood variance — inverted so lower variance = higher score
        if len(mood_scores) >= 2:
            mean_m = sum(mood_scores) / len(mood_scores)
            variance = sum((x - mean_m) ** 2 for x in mood_scores) / len(mood_scores)
            variance_score = max(0, 30 * (1 - math.sqrt(variance) * 2))
        else:
            variance_score = 15  # neutral

        # (b) Sentiment trend — compare first half vs second half
        if len(chat_sentiments) >= 4:
            mid = len(chat_sentiments) // 2
            recent_half = sum(chat_sentiments[:mid]) / mid       # more recent
            older_half = sum(chat_sentiments[mid:]) / (len(chat_sentiments) - mid)
            trend = recent_half - older_half  # positive = improving
            trend_score = min(25, max(0, 12.5 + trend * 25))
        else:
            trend_score = 12.5

        # (c) Average AI stability
        if chat_stabilities:
            avg_stab = sum(chat_stabilities) / len(chat_stabilities)
        else:
            avg_stab = 0.5
        stability_score = avg_stab * 25  # 0-25

        # (d) Streak bonus: consecutive days logged
        streak = 0
        if mood_dates:
            unique_dates = sorted(set(mood_dates), reverse=True)
            streak = 1
            for i in range(1, len(unique_dates)):
                if (unique_dates[i - 1] - unique_dates[i]).days == 1:
                    streak += 1
                else:
                    break
        streak_bonus = min(20, streak * 2)  # max 20 for 10+ day streak

        ess = round(variance_score + trend_score + stability_score + streak_bonus, 2)
        ess = min(100.0, max(0.0, ess))

        return {
            "emotion_stability_score": ess,
            "sub_scores": {
                "mood_consistency": round(variance_score, 2),
                "sentiment_trend": round(trend_score, 2),
                "ai_stability_avg": round(stability_score, 2),
                "streak_bonus": round(streak_bonus, 2),
            },
            "current_streak": streak,
            "mood_entries_analyzed": len(mood_scores),
            "chat_entries_analyzed": len(chat_stabilities),
        }
    except Exception as e:
        print(f"ESS Error: {e}")
        return {"emotion_stability_score": 50.0, "sub_scores": {}}


# ═══════════════════════════════════════════════════════════════════════════
# 3. User Persona Mining (enhanced)
# ═══════════════════════════════════════════════════════════════════════════

def mine_user_persona(db, user_id) -> dict:
    """
    Multi-dimensional persona segmentation.
    Returns persona label + detail breakdown.
    """
    try:
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            return {"persona": "Newcomer", "engagement": "new", "traits": []}

        user_data = user_doc.to_dict()
        mode = user_data.get("mode", "General")

        mood_count = len(list(
            db.collection("mood_logs").where("user_id", "==", user_id).limit(100).stream()
        ))
        sleep_count = len(list(
            db.collection("sleep_logs").where("user_id", "==", user_id).limit(100).stream()
        ))
        chat_count = len(list(
            db.collection("chat_logs").where("user_id", "==", user_id).limit(100).stream()
        ))

        total_activity = mood_count + sleep_count + chat_count

        if total_activity > 30:
            engagement = "Power User"
        elif total_activity > 15:
            engagement = "Regular"
        elif total_activity > 5:
            engagement = "Casual"
        else:
            engagement = "Newcomer"

        # Identify dominant traits
        traits = []
        if chat_count > mood_count and chat_count > sleep_count:
            traits.append("AI-Conversational")
        if sleep_count > 10:
            traits.append("Sleep-Focused")
        if mood_count > 10:
            traits.append("Self-Reflective")
        if mode.lower() == "islamic":
            traits.append("Spiritually-Oriented")
        if not traits:
            traits.append("Exploring")

        persona = f"{engagement} – {' & '.join(traits)}"

        return {
            "persona": persona,
            "engagement_level": engagement,
            "mode": mode,
            "traits": traits,
            "activity": {
                "mood_logs": mood_count,
                "sleep_logs": sleep_count,
                "chat_sessions": chat_count,
                "total": total_activity,
            },
        }
    except Exception as e:
        print(f"Persona Mining Error: {e}")
        return {"persona": "Unknown", "engagement_level": "unknown", "traits": []}


# ═══════════════════════════════════════════════════════════════════════════
# 4. Churn Metrics (enhanced for BI)
# ═══════════════════════════════════════════════════════════════════════════

def get_churn_metrics(db) -> dict:
    """
    BI: Active vs Churned users with weekly breakdown.
    """
    try:
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        two_weeks = now - timedelta(days=14)
        month_ago = now - timedelta(days=30)

        users = list(db.collection("users").stream())
        active_7d = 0
        active_14d = 0
        active_30d = 0
        churned = 0
        total = len(users)

        for u in users:
            ll = u.to_dict().get("last_login")
            if ll and ll >= week_ago:
                active_7d += 1
            elif ll and ll >= two_weeks:
                active_14d += 1
            elif ll and ll >= month_ago:
                active_30d += 1
            else:
                churned += 1

        churn_rate = (churned / total * 100) if total > 0 else 0
        retention_7d = (active_7d / total * 100) if total > 0 else 0

        return {
            "total_users": total,
            "active_7d": active_7d,
            "active_14d": active_14d,
            "active_30d": active_30d,
            "churned_users": churned,
            "churn_rate_pct": round(churn_rate, 2),
            "retention_7d_pct": round(retention_7d, 2),
        }
    except Exception as e:
        print(f"Churn Metrics Error: {e}")
        return {"error": str(e)}


# ═══════════════════════════════════════════════════════════════════════════
# 5. Engagement Density (enhanced)
# ═══════════════════════════════════════════════════════════════════════════

def get_engagement_density(db, user_id) -> dict:
    """
    Per-user engagement analysis over 30 days.
    """
    try:
        now = datetime.utcnow()
        month_ago = now - timedelta(days=30)

        moods = len(list(
            db.collection("mood_logs")
            .where("user_id", "==", user_id)
            .where("created_at", ">=", month_ago)
            .stream()
        ))
        sleep = len(list(
            db.collection("sleep_logs")
            .where("user_id", "==", user_id)
            .where("created_at", ">=", month_ago)
            .stream()
        ))
        chats = len(list(
            db.collection("chat_logs")
            .where("user_id", "==", user_id)
            .where("created_at", ">=", month_ago)
            .stream()
        ))

        total = moods + sleep + chats
        density = total / 30.0

        return {
            "total_30d_logs": total,
            "breakdown": {"mood_logs": moods, "sleep_logs": sleep, "chat_sessions": chats},
            "logs_per_day": round(density, 2),
            "engagement_rating": (
                "High" if density >= 3 else
                "Medium" if density >= 1 else
                "Low"
            ),
        }
    except Exception as e:
        print(f"Engagement Density Error: {e}")
        return {"logs_per_day": 0, "engagement_rating": "Unknown"}


# ═══════════════════════════════════════════════════════════════════════════
# 6. Retention Cohort Analysis (NEW — for BI dashboard)
# ═══════════════════════════════════════════════════════════════════════════

def get_retention_cohorts(db) -> dict:
    """
    Weekly registration cohorts and their retention over time.
    Essential for Tableau/Power BI retention charts.
    """
    try:
        now = datetime.utcnow()
        users = list(db.collection("users").stream())

        # Group users by registration week
        cohorts = defaultdict(lambda: {"registered": 0, "retained_7d": 0, "retained_14d": 0, "retained_30d": 0})

        for u in users:
            ud = u.to_dict()
            created = ud.get("created_at")
            last_login = ud.get("last_login")
            if not created:
                continue

            if hasattr(created, "timestamp"):
                reg_dt = datetime.utcfromtimestamp(created.timestamp())
            else:
                continue

            # Cohort key = ISO week
            cohort_key = reg_dt.strftime("%Y-W%U")
            cohorts[cohort_key]["registered"] += 1

            if last_login and hasattr(last_login, "timestamp"):
                login_dt = datetime.utcfromtimestamp(last_login.timestamp())
                days_active = (login_dt - reg_dt).days
                if days_active >= 7:
                    cohorts[cohort_key]["retained_7d"] += 1
                if days_active >= 14:
                    cohorts[cohort_key]["retained_14d"] += 1
                if days_active >= 30:
                    cohorts[cohort_key]["retained_30d"] += 1

        # Compute rates
        result = {}
        for key in sorted(cohorts.keys()):
            c = cohorts[key]
            reg = c["registered"]
            result[key] = {
                "registered": reg,
                "retained_7d": c["retained_7d"],
                "retained_14d": c["retained_14d"],
                "retained_30d": c["retained_30d"],
                "retention_7d_pct": round(c["retained_7d"] / reg * 100, 1) if reg else 0,
                "retention_14d_pct": round(c["retained_14d"] / reg * 100, 1) if reg else 0,
                "retention_30d_pct": round(c["retained_30d"] / reg * 100, 1) if reg else 0,
            }

        return {"cohorts": result, "total_cohorts": len(result)}
    except Exception as e:
        print(f"Retention Cohort Error: {e}")
        return {"error": str(e)}


# ═══════════════════════════════════════════════════════════════════════════
# 7. BI Dashboard Aggregate (NEW — single call for admin panel)
# ═══════════════════════════════════════════════════════════════════════════

def get_bi_dashboard(db) -> dict:
    """
    Aggregated BI metrics for the admin dashboard / Tableau.
    """
    try:
        churn = get_churn_metrics(db)
        cohorts = get_retention_cohorts(db)

        # Collection sizes
        mood_total = len(list(db.collection("mood_logs").limit(5000).stream()))
        sleep_total = len(list(db.collection("sleep_logs").limit(5000).stream()))
        chat_total = len(list(db.collection("chat_logs").limit(5000).stream()))

        # Mode distribution
        users = list(db.collection("users").stream())
        mode_dist = defaultdict(int)
        for u in users:
            mode_dist[u.to_dict().get("mode", "general").lower()] += 1

        # Daily active users (last 7 days)
        now = datetime.utcnow()
        dau = defaultdict(int)
        for u in users:
            ll = u.to_dict().get("last_login")
            if ll and hasattr(ll, "timestamp"):
                login_dt = datetime.utcfromtimestamp(ll.timestamp())
                if (now - login_dt).days < 7:
                    day_key = login_dt.strftime("%Y-%m-%d")
                    dau[day_key] += 1

        return {
            "churn_metrics": churn,
            "retention_cohorts": cohorts,
            "content_volume": {
                "mood_logs": mood_total,
                "sleep_logs": sleep_total,
                "chat_sessions": chat_total,
                "total": mood_total + sleep_total + chat_total,
            },
            "mode_distribution": dict(mode_dist),
            "daily_active_users": dict(sorted(dau.items())),
            "generated_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        print(f"BI Dashboard Error: {e}")
        return {"error": str(e)}
