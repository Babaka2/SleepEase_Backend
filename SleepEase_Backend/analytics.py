from datetime import datetime, timedelta
from firebase_admin import firestore

def calculate_sleep_index(db, user_id):
    """
    Calculates the Sleep Improvement Index (0-100).
    Compares the last 7 days of sleep quality/hours vs the previous 7 days.
    """
    try:
        now = datetime.utcnow()
        last_7_days = now - timedelta(days=7)
        prev_7_days = now - timedelta(days=14)

        # Get logs for analysis
        logs = db.collection("sleep_logs").where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING).limit(50).stream()
        
        recent_scores = []
        older_scores = []

        for log in logs:
            data = log.to_dict()
            created_at = data.get("created_at")
            # Quality score (1-10) weighted by hours
            score = (data.get("quality", 5) * data.get("hours", 8)) / 8.0
            
            if created_at >= last_7_days:
                recent_scores.append(score)
            elif created_at >= prev_7_days:
                older_scores.append(score)

        if not recent_scores:
            return 0
        
        avg_recent = sum(recent_scores) / len(recent_scores)
        avg_older = sum(older_scores) / len(older_scores) if older_scores else avg_recent

        # Improvement calculation
        improvement = (avg_recent - avg_older) / (avg_older if avg_older > 0 else 1)
        # Normalize to 0-100 scale (Base 50.0 + improvement factor)
        final_index = min(100.0, max(0.0, 50.0 + (improvement * 100.0)))
        return float(round(final_index, 2))
    except Exception as e:
        print(f"Sleep Index Error: {e}")
        return 50.0

def mine_user_persona(db, user_id):
    """
    Segments users into personas based on their behavior and preferences.
    """
    try:
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            return "New Comers"
        
        user_data = user_doc.to_dict()
        mode = user_data.get("mode", "General")
        
        # Check activity level
        mood_count = len(list(db.collection("mood_logs").where("user_id", "==", user_id).limit(10).stream()))
        
        if mood_count > 7:
            engagement = "Highly Engaged"
        elif mood_count > 3:
            engagement = "Moderately Engaged"
        else:
            engagement = "Occasional"

        # Combine for persona
        persona = f"{engagement} {mode} User"
        
        # Specific sub-persona based on mood trends if possible
        # (Simplified for now)
        return persona
    except Exception as e:
        print(f"Persona Mining Error: {e}")
        return "Unknown"

def get_churn_metrics(db):
    """
    BI Requirement: Identify 'Active' vs 'Inactive' (Churned) users.
    'Churned' = No login in the last 7 days.
    """
    try:
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        
        users = db.collection("users").stream()
        active_count = 0
        churned_count = 0
        
        for u in users:
            last_login = u.to_dict().get("last_login")
            if last_login and last_login >= week_ago:
                active_count += 1
            else:
                churned_count += 1
        
        total = active_count + churned_count
        churn_rate = (churned_count / total * 100) if total > 0 else 0
        
        return {
            "active_users": active_count,
            "churned_users": churned_count,
            "churn_rate_pct": round(churn_rate, 2)
        }
    except Exception as e:
        print(f"Churn Metrics Error: {e}")
        return {"error": str(e)}

def get_engagement_density(db, user_id):
    """
    Requirement 5: Analysis of log frequency.
    Calculates average logs per day over the last 30 days.
    """
    try:
        now = datetime.utcnow()
        month_ago = now - timedelta(days=30)
        
        # Count all logs across collections
        moods = len(list(db.collection("mood_logs").where("user_id", "==", user_id).where("created_at", ">=", month_ago).stream()))
        sleep = len(list(db.collection("sleep_logs").where("user_id", "==", user_id).where("created_at", ">=", month_ago).stream()))
        
        total_logs = moods + sleep
        density = total_logs / 30.0
        
        return {
            "total_30d_logs": total_logs,
            "logs_per_day": round(density, 2)
        }
    except Exception as e:
        print(f"Engagement Density Error: {e}")
        return {"logs_per_day": 0}
