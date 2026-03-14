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
from analytics import calculate_sleep_index, mine_user_persona, get_churn_metrics, get_engagement_density
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
        
        # PERSIST: Save to Firestore for the Progress Dashboard
        db.collection("chat_logs").add({
            "user_id": current_user["uid"],
            "message": encrypt_text(chat.message),  # Requirement 3: Encryption
            "reply": encrypt_text(ai_data["reply"]), # Requirement 3: Encryption
            "sentiment": ai_data["sentiment"],
            "stability_score": ai_data["stability_score"],
            "mode": chat.mode,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return {
            "status": "success", 
            "reply": ai_data["reply"],
            "sentiment": ai_data["sentiment"],
            "stability_score": ai_data["stability_score"]
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

@app.get("/analytics/sleep_index")
def get_sleep_improvement_index(current_user: dict = Depends(get_current_user)):
    """
    Requirement 7: Sleep Improvement Index
    """
    try:
        index = calculate_sleep_index(db, current_user["uid"])
        return {"status": "success", "sleep_improvement_index": index}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/persona")
def get_user_persona(current_user: dict = Depends(get_current_user)):
    """
    Persona Mining & User Segmentation
    """
    try:
        persona = mine_user_persona(db, current_user["uid"])
        return {"status": "success", "persona": persona}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/emotional_trend")
def get_emotional_stability_trend(current_user: dict = Depends(get_current_user)):
    """
    Requirement 7: Emotion Stability Score Trend
    Calculates avg stability from recent chats.
    """
    try:
        logs = db.collection("chat_logs").where("user_id", "==", current_user["uid"]).order_by("created_at", direction=firestore.Query.DESCENDING).limit(20).stream()
        scores = [l.to_dict().get("stability_score", 0.5) for l in logs]
        avg_score = sum(scores) / len(scores) if scores else 0.5
        return {"status": "success", "avg_stability": round(avg_score, 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/churn")
def get_bi_churn_analytics(admin_secret: str = Header(None)):
    """
    BI Requirement: Global churn metrics for Salman Zaman.
    """
    if admin_secret != os.getenv("ADMIN_SECRET"):
         raise HTTPException(status_code=403, detail="Access Denied")
    return get_churn_metrics(db)

@app.get("/analytics/engagement")
def get_user_engagement_density(current_user: dict = Depends(get_current_user)):
    """
    Requirement 5: Analysis of log frequency.
    """
    return get_engagement_density(db, current_user["uid"])

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