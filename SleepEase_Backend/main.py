from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# --- Local Imports ---
from database import db
from firebase_admin import auth, firestore
from ai_engine import get_mood_advice
from analytics import (
    calculate_sleep_index,
    calculate_emotion_stability,
    mine_user_persona,
    get_churn_metrics,
    get_engagement_density,
    get_retention_cohorts,
    get_bi_dashboard,
)
from ml_engine import predict_churn, cluster_users, predict_sleep_quality
from compliance_engine import run_compliance_check, get_compliance_stats
from security_utils import encrypt_text, decrypt_text

app = FastAPI(title="SleepEase Backend")

# --- 1. CORS Configuration ---
# This allows your Vite frontend (localhost:5173/5174) to talk to this API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Data Models (Pydantic) ---
class UserSchema(BaseModel):
    email: str
    password: str
    username: str
    mode: str = "General"

class LoginSchema(BaseModel):
    email: str
    password: str

class SleepSchema(BaseModel):
    user_id: str
    hours: float
    quality: int  # Scale 1-10
    mood: str     # "Happy", "Anxious", etc.
    date: str     # YYYY-MM-DD

class GratitudeSchema(BaseModel):
    user_id: str
    content: str
    date: str     # YYYY-MM-DD

class ChatSchema(BaseModel):
    message: str
    mode: str = "general"  # "general" or "islamic"

class MoodSchema(BaseModel):
    user_id: str
    mood: str       # "calm", "anxious", "tired", "overwhelmed", etc.
    mode: str       # "general" or "islamic"
    note: str = None

# --- Dependency: Verify Firebase Token ---
def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing Token")
    
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]
        
        # Track last login for BI Analytics (Requirement 5)
        db.collection("users").document(uid).update({
            "last_login": firestore.SERVER_TIMESTAMP
        })
        
        return decoded_token  # Returns the user's info (including uid)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# --- 3. Root & Health Check ---
@app.get("/")
def root():
    return {"status": "online", "message": "SleepEase Backend is Running"}

# --- 4. Auth Endpoints ---
@app.post("/auth/register")
def register_user(user: UserSchema):
    try:
        user_record = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.username
        )
        # Store additional info in Firestore
        db.collection("users").document(user_record.uid).set({
            "userID": user_record.uid,
            "email": user.email,
            "username": user.username,
            "mode": user.mode,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return {"status": "success", "uid": user_record.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- 5. AI Chat Endpoint (Ayham's Engine) ---
@app.post("/chat")
def chat_with_ai(chat: ChatSchema, current_user: dict = Depends(get_current_user)):
    """
    Receives a message, returns an AI response, and PERSISTS sentiment metadata.
    Requirement 3: "Store it as metadata for the progress dashboard."
    """
    try:
        ai_data = get_mood_advice(chat.message, chat.mode)

        # ── Compliance Monitoring (Islamic content safety layer) ──
        compliance = run_compliance_check(
            ai_response=ai_data["reply"],
            mode=chat.mode,
            db=db,
            user_id=current_user["uid"],
        )
        # Use the filtered (safe) response
        safe_reply = compliance["filtered_response"]

        # PERSIST: Save to Firestore for the Progress Dashboard
        db.collection("chat_logs").add({
            "user_id": current_user["uid"],
            "message": encrypt_text(chat.message),  # Requirement 3: Encryption
            "reply": encrypt_text(safe_reply),       # Requirement 3: Encryption
            "sentiment": ai_data["sentiment"],
            "stability_score": ai_data["stability_score"],
            "compliance_score": compliance["compliance_score"],
            "compliance_passed": compliance["passed"],
            "mode": chat.mode,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return {
            "status": "success",
            "reply": safe_reply,
            "sentiment": ai_data["sentiment"],
            "stability_score": ai_data["stability_score"],
            "compliance": {
                "score": compliance["compliance_score"],
                "passed": compliance["passed"],
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- 6. Sleep & Gratitude Logging ---
@app.post("/logs/sleep")
def log_sleep(data: SleepSchema, current_user: dict = Depends(get_current_user)):
    try:
        db.collection("sleep_logs").add({
            **data.dict(),
            "user_id": current_user["uid"],  # Use verified UID
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/logs/gratitude")
def log_gratitude(data: GratitudeSchema, current_user: dict = Depends(get_current_user)):
    try:
        db.collection("gratitude_logs").add({
            **data.dict(),
            "content": encrypt_text(data.content),  # Requirement 3: Encryption
            "user_id": current_user["uid"],  # Use verified UID
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 7. Mood Logging Endpoints ---
@app.post("/logs/mood")
def log_mood(data: MoodSchema, current_user: dict = Depends(get_current_user)):
    try:
        doc_ref = db.collection("mood_logs").add({
            "user_id": current_user["uid"],  # Use verified UID
            "mood": data.mood,
            "mode": data.mode,
            "note": encrypt_text(data.note),  # Requirement 3: Encryption
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return {"status": "success", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/mood")
def get_mood_history(limit: int = 30, current_user: dict = Depends(get_current_user)):
    try:
        # Filter by user_id for strict data isolation
        moods = db.collection("mood_logs").where(
            "user_id", "==", current_user["uid"]
        ).order_by(
            "created_at", direction=firestore.Query.DESCENDING
        ).limit(limit).stream()
        
        result = []
        for m in moods:
            data = m.to_dict()
            data["id"] = m.id
            # Decrypt sensitive content for the user
            if "note" in data:
                data["note"] = decrypt_text(data["note"])
            
            if "created_at" in data and data["created_at"]:
                data["created_at"] = str(data["created_at"])
            result.append(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/mood/today")
def get_today_mood(current_user: dict = Depends(get_current_user)):
    try:
        from datetime import datetime
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Filter by user_id to prevent data leakage
        moods = db.collection("mood_logs").where(
            "user_id", "==", current_user["uid"]
        ).where(
            "created_at", ">=", today
        ).order_by("created_at", direction=firestore.Query.DESCENDING).limit(1).stream()
        
        for m in moods:
            data = m.to_dict()
            data["id"] = m.id
            # Decrypt sensitive content for the user
            if "note" in data:
                data["note"] = decrypt_text(data["note"])
                
            if "created_at" in data and data["created_at"]:
                data["created_at"] = str(data["created_at"])
            return data
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/logs/mood/{mood_id}")
def delete_mood(mood_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # First check if the doc belongs to the user
        doc = db.collection("mood_logs").document(mood_id).get()
        if not doc.exists or doc.to_dict().get("user_id") != current_user["uid"]:
             raise HTTPException(status_code=403, detail="Forbidden")
             
        db.collection("mood_logs").document(mood_id).delete()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/streak")
def get_user_streak(current_user: dict = Depends(get_current_user)):
    """
    Calculates the current daily reflection streak for the user.
    """
    try:
        from datetime import datetime, timedelta
        
        # Fetch mood logs for the user, ordered by date
        logs = db.collection("mood_logs").where(
            "user_id", "==", current_user["uid"]
        ).order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        
        streak = 0
        current_date = datetime.utcnow().date()
        
        logged_dates = set()
        for doc in logs:
            data = doc.to_dict()
            if "created_at" in data and data["created_at"]:
                # Convert firestore timestamp or string to date
                ts = data["created_at"]
                if hasattr(ts, 'date'):
                    log_date = ts.date()
                else:
                    # In case it's a string from previous stringification
                    log_date = datetime.fromisoformat(str(ts).split(" ")[0]).date()
                logged_dates.add(log_date)
        
        # Count backwards from today/yesterday
        check_date = current_date
        if check_date not in logged_dates:
            check_date -= timedelta(days=1)
            
        while check_date in logged_dates:
            streak += 1
            check_date -= timedelta(days=1)
            
        return {"status": "success", "streak": streak}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════════════════
# ANALYTICS – Quantitative Metrics
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/analytics/sleep_index")
def get_sleep_improvement_index(current_user: dict = Depends(get_current_user)):
    """
    Sleep Improvement Index (SII) – 0 to 100 composite score
    with sub-scores for quality, duration fitness, and consistency.
    """
    try:
        result = calculate_sleep_index(db, current_user["uid"])
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/emotion_stability")
def get_emotion_stability_score(current_user: dict = Depends(get_current_user)):
    """
    Emotion Stability Score (ESS) – 0 to 100 composite score
    with sub-scores for mood consistency, sentiment trend,
    AI-detected stability, and streak bonus.
    """
    try:
        result = calculate_emotion_stability(db, current_user["uid"])
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/persona")
def get_user_persona(current_user: dict = Depends(get_current_user)):
    """
    Multi-dimensional persona segmentation with traits and activity.
    """
    try:
        result = mine_user_persona(db, current_user["uid"])
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/emotional_trend")
def get_emotional_stability_trend(current_user: dict = Depends(get_current_user)):
    """
    Emotion Stability Score Trend (legacy endpoint kept for compatibility).
    """
    try:
        result = calculate_emotion_stability(db, current_user["uid"])
        return {
            "status": "success",
            "avg_stability": round(result["emotion_stability_score"] / 100, 2),
            "full_report": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/engagement")
def get_user_engagement_density(current_user: dict = Depends(get_current_user)):
    """
    Per-user engagement density with breakdown and rating.
    """
    return get_engagement_density(db, current_user["uid"])


# ═══════════════════════════════════════════════════════════════════════════
# ML ENGINE – Scikit-learn Models
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/ml/churn_prediction")
def ml_churn_prediction(admin_secret: str = Header(None)):
    """
    Logistic Regression churn prediction for all users.
    Returns per-user churn probability, risk level, and feature importances.
    Admin-only endpoint.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")
    try:
        return {"status": "success", **predict_churn(db)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ml/user_clusters")
def ml_user_clustering(n_clusters: int = 4, admin_secret: str = Header(None)):
    """
    K-Means user segmentation/clustering.
    Returns cluster assignments, centroids, and summary.
    Admin-only endpoint.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")
    try:
        n = min(max(2, n_clusters), 10)  # clamp 2-10
        return {"status": "success", **cluster_users(db, n)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ml/sleep_prediction")
def ml_sleep_quality_prediction(current_user: dict = Depends(get_current_user)):
    """
    Random Forest sleep quality prediction for the current user.
    Predicts tonight's expected quality based on historical patterns.
    """
    try:
        return {"status": "success", **predict_sleep_quality(db, current_user["uid"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# BI DASHBOARD – Business Intelligence
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/analytics/churn")
def get_bi_churn_analytics(admin_secret: str = Header(None)):
    """
    Global churn metrics with weekly breakdown.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")
    return get_churn_metrics(db)

@app.get("/analytics/retention_cohorts")
def get_bi_retention_cohorts(admin_secret: str = Header(None)):
    """
    Weekly registration cohort retention analysis.
    Essential data for Tableau / Power BI retention charts.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")
    try:
        return {"status": "success", **get_retention_cohorts(db)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/bi_dashboard")
def get_full_bi_dashboard(admin_secret: str = Header(None)):
    """
    Comprehensive BI dashboard data in a single API call.
    Includes: churn, retention cohorts, content volume, mode distribution, DAU.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")
    try:
        return {"status": "success", **get_bi_dashboard(db)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# COMPLIANCE – Islamic Content Safety Monitoring
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/compliance/stats")
def get_compliance_dashboard(admin_secret: str = Header(None)):
    """
    Compliance monitoring dashboard stats.
    Shows pass rate, block count, average score, and score distribution.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")
    try:
        return {"status": "success", **get_compliance_stats(db)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/compliance/audit_log")
def get_compliance_audit_log(limit: int = 50, admin_secret: str = Header(None)):
    """
    Recent compliance audit entries for review.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")
    try:
        audits = db.collection("compliance_audits").order_by(
            "created_at", direction=firestore.Query.DESCENDING
        ).limit(limit).stream()
        result = []
        for a in audits:
            data = a.to_dict()
            data["id"] = a.id
            if "created_at" in data and data["created_at"]:
                data["created_at"] = str(data["created_at"])
            result.append(data)
        return {"status": "success", "audits": result, "count": len(result)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# USER SCORES – Combined personal analytics endpoint
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/analytics/my_scores")
def get_my_scores(current_user: dict = Depends(get_current_user)):
    """
    Single endpoint returning all personal quantitative scores:
    SII, ESS, persona, engagement, and sleep prediction.
    """
    try:
        uid = current_user["uid"]
        sii = calculate_sleep_index(db, uid)
        ess = calculate_emotion_stability(db, uid)
        persona = mine_user_persona(db, uid)
        engagement = get_engagement_density(db, uid)
        sleep_pred = predict_sleep_quality(db, uid)

        return {
            "status": "success",
            "sleep_improvement_index": sii,
            "emotion_stability": ess,
            "persona": persona,
            "engagement": engagement,
            "sleep_prediction": sleep_pred,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 8. Admin Export (For Salman/Analytics) ---
@app.get("/admin/export_data")
def export_data_for_analytics(admin_secret: str = Header(None)):
    """
    Security check using the custom SleepEase Admin secret.
    Returns ALL logs for BI analysis (Power BI/Tableau).
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Access Denied")

    try:
        users = [d.to_dict() for d in db.collection("users").stream()]
        sleep = [d.to_dict() for d in db.collection("sleep_logs").stream()]
        gratitude = [d.to_dict() for d in db.collection("gratitude_logs").stream()]
        moods = [d.to_dict() for d in db.collection("mood_logs").stream()]
        chats = [d.to_dict() for d in db.collection("chat_logs").stream()]

        # Helper to stringify timestamps and decrypt fields for JSON compatibility
        def process_records(records, fields_to_decrypt=[]):
            for r in records:
                if "created_at" in r: r["created_at"] = str(r["created_at"])
                for field in fields_to_decrypt:
                    if field in r:
                        r[field] = decrypt_text(r[field])
            return records

        return {
            "users": process_records(users),
            "sleep_logs": process_records(sleep),
            "gratitude_logs": process_records(gratitude, ["content"]),
            "mood_logs": process_records(moods, ["note"]),
            "chat_logs": process_records(chats, ["message", "reply"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 9. User Mode Update Endpoint ---
class ModeUpdateSchema(BaseModel):
    mode: str  # "general" or "islamic"

@app.put("/user/mode")
def update_user_mode(data: ModeUpdateSchema, current_user: dict = Depends(get_current_user)):
    """
    Updates the user's preferred mode (general/islamic) in Firestore.
    Called when user switches mode in Settings.
    """
    if data.mode not in ("general", "islamic", "General", "Islamic"):
        raise HTTPException(status_code=400, detail="Mode must be 'general' or 'islamic'")
    try:
        db.collection("users").document(current_user["uid"]).update({
            "mode": data.mode
        })
        return {"status": "success", "mode": data.mode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/mode")
def get_user_mode(current_user: dict = Depends(get_current_user)):
    """
    Returns the user's current mode from Firestore.
    """
    try:
        doc = db.collection("users").document(current_user["uid"]).get()
        if doc.exists:
            return {"status": "success", "mode": doc.to_dict().get("mode", "general")}
        return {"status": "success", "mode": "general"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))