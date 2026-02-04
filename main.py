from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import db
from firebase_admin import auth, firestore

app = FastAPI()

# Data Model for User Signup
class UserSchema(BaseModel):
    email: str
    password: str
    username: str
    mode: str = "General"

@app.get("/")
def root():
    return {"message": "SleepEase Backend is Running"}

@app.post("/auth/register")
def register_user(user: UserSchema):
    try:
        # 1. Create User in Firebase Auth
        user_record = auth.create_user(
            email=user.email,
            password=user.password,
            display_name=user.username
        )

        # 2. Store extra details in Firestore
        user_data = {
            "userID": user_record.uid,
            "email": user.email,
            "username": user.username,
            "mode": user.mode,
            "created_at": firestore.SERVER_TIMESTAMP
        }

        # Write to 'users' collection
        db.collection("users").document(user_record.uid).set(user_data)

        return {"status": "success", "uid": user_record.uid, "message": "User registered successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Login Data Model
class LoginSchema(BaseModel):
    email: str
    password: str

@app.post("/auth/login")
def login_user(user: LoginSchema):
    try:
        # Verify the email exists in Firebase Auth
        user_record = auth.get_user_by_email(user.email)
        
        return {"status": "success", "uid": user_record.uid, "message": "Login successful"}

    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid Credentials")

# Sleep Data Model
class SleepSchema(BaseModel):
    user_id: str
    hours: float
    quality: int  # Scale 1-10
    date: str     # YYYY-MM-DD

@app.post("/sleep/add")
def add_sleep_entry(entry: SleepSchema):
    try:
        sleep_data = {
            "user_id": entry.user_id,
            "hours": entry.hours,
            "quality": entry.quality,
            "date": entry.date,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # Save to a new collection called 'sleep_logs'
        db.collection("sleep_logs").add(sleep_data)
        
        return {"status": "success", "message": "Sleep data saved successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/sleep/history")
def get_sleep_history(user_id: str):
    try:
        # Search the 'sleep_logs' collection for documents where 'user_id' matches
        docs = db.collection("sleep_logs").where("user_id", "==", user_id).stream()
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            # Convert the messy Firebase timestamp to a readable string
            if "created_at" in data:
                data["created_at"] = str(data["created_at"])
            history.append(data)
            
        return {"status": "success", "data": history}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
