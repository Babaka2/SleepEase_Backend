from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# --- Local Imports ---
from database import db
from firebase_admin import auth, firestore
from ai_engine import get_mood_advice

app = FastAPI(title="SleepEase Backend")

# --- 1. CORS Configuration ---
# This allows your Vite frontend (localhost:5173/5174) to talk to this API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
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
def chat_with_ai(chat: ChatSchema):
    """
    Receives a message from the React frontend and returns an AI response.
    Supports both 'general' and 'islamic' modes for context-aware responses.
    """
    try:
        ai_response = get_mood_advice(chat.message, chat.mode)
        return {"status": "success", "reply": ai_response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- 6. Sleep & Gratitude Logging ---
@app.post("/logs/sleep")
def log_sleep(data: SleepSchema):
    try:
        db.collection("sleep_logs").add({
            **data.dict(),
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/logs/gratitude")
def log_gratitude(data: GratitudeSchema):
    try:
        db.collection("gratitude_logs").add({
            **data.dict(),
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 7. Mood Logging Endpoints ---
@app.post("/logs/mood")
def log_mood(data: MoodSchema):
    try:
        doc_ref = db.collection("mood_logs").add({
            "user_id": data.user_id,
            "mood": data.mood,
            "mode": data.mode,
            "note": data.note,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        return {"status": "success", "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/mood")
def get_mood_history(limit: int = 30, authorization: str = Header(None)):
    try:
        # Extract user_id from token (simplified - in production verify the token)
        moods = db.collection("mood_logs").order_by(
            "created_at", direction=firestore.Query.DESCENDING
        ).limit(limit).stream()
        
        result = []
        for m in moods:
            data = m.to_dict()
            data["id"] = m.id
            if "created_at" in data and data["created_at"]:
                data["created_at"] = str(data["created_at"])
            result.append(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/mood/today")
def get_today_mood(authorization: str = Header(None)):
    try:
        from datetime import datetime, timedelta
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        moods = db.collection("mood_logs").where(
            "created_at", ">=", today
        ).order_by("created_at", direction=firestore.Query.DESCENDING).limit(1).stream()
        
        for m in moods:
            data = m.to_dict()
            data["id"] = m.id
            if "created_at" in data and data["created_at"]:
                data["created_at"] = str(data["created_at"])
            return data
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/logs/mood/{mood_id}")
def delete_mood(mood_id: str):
    try:
        db.collection("mood_logs").document(mood_id).delete()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 8. Admin Export (For Salman/Analytics) ---
@app.get("/admin/export_data")
def export_data_for_analytics(admin_secret: str = Header(None)):
    """
    Security check using the custom SleepEase Admin secret.
    Returns all logs for BI analysis.
    """
    if admin_secret != "SleepEase_Admin_2026":
        raise HTTPException(status_code=403, detail="Access Denied")

    try:
        users = [d.to_dict() for d in db.collection("users").stream()]
        sleep = [d.to_dict() for d in db.collection("sleep_logs").stream()]
        gratitude = [d.to_dict() for d in db.collection("gratitude_logs").stream()]

        # Helper to stringify timestamps for JSON compatibility
        def fix_ts(records):
            for r in records:
                if "created_at" in r: r["created_at"] = str(r["created_at"])
            return records

        return {
            "users": fix_ts(users),
            "sleep_logs": fix_ts(sleep),
            "gratitude_logs": fix_ts(gratitude)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))