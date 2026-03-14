"""
ml_engine.py – Machine Learning Engine for SleepEase
=====================================================
Implements Scikit-learn based models for:
  1. User Churn Prediction (Logistic Regression)
  2. User Segmentation / Clustering (K-Means)
  3. Sleep Quality Prediction (Random Forest)
"""

import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


# ---------------------------------------------------------------------------
# Feature extraction helpers
# ---------------------------------------------------------------------------

def _extract_user_features(db, user_id: str) -> dict:
    """
    Build a feature vector for a single user from Firestore data.
    Features:
      - days_since_registration
      - total_mood_logs
      - total_sleep_logs
      - total_chat_sessions
      - avg_sentiment (from chat_logs)
      - avg_stability (from chat_logs)
      - days_since_last_activity
      - avg_sleep_quality
      - avg_sleep_hours
      - mood_diversity (number of distinct moods)
    """
    now = datetime.utcnow()

    # ---- user doc ----
    user_doc = db.collection("users").document(user_id).get()
    user_data = user_doc.to_dict() if user_doc.exists else {}
    created_at = user_data.get("created_at")
    if hasattr(created_at, "timestamp"):
        days_since_reg = (now - datetime.utcfromtimestamp(created_at.timestamp())).days
    else:
        days_since_reg = 30  # fallback

    last_login = user_data.get("last_login")
    if hasattr(last_login, "timestamp"):
        days_since_last = (now - datetime.utcfromtimestamp(last_login.timestamp())).days
    else:
        days_since_last = days_since_reg

    # ---- mood logs ----
    mood_docs = list(
        db.collection("mood_logs")
        .where("user_id", "==", user_id)
        .limit(200)
        .stream()
    )
    total_mood = len(mood_docs)
    mood_set = set()
    for d in mood_docs:
        mood_set.add(d.to_dict().get("mood", "unknown"))

    # ---- sleep logs ----
    sleep_docs = list(
        db.collection("sleep_logs")
        .where("user_id", "==", user_id)
        .limit(200)
        .stream()
    )
    total_sleep = len(sleep_docs)
    sleep_qualities = []
    sleep_hours_list = []
    for d in sleep_docs:
        sd = d.to_dict()
        sleep_qualities.append(sd.get("quality", 5))
        sleep_hours_list.append(sd.get("hours", 7))

    # ---- chat logs ----
    chat_docs = list(
        db.collection("chat_logs")
        .where("user_id", "==", user_id)
        .limit(200)
        .stream()
    )
    total_chats = len(chat_docs)
    sentiments = []
    stabilities = []
    for d in chat_docs:
        cd = d.to_dict()
        sentiments.append(cd.get("sentiment", 0.5))
        stabilities.append(cd.get("stability_score", 0.5))

    return {
        "days_since_registration": days_since_reg,
        "total_mood_logs": total_mood,
        "total_sleep_logs": total_sleep,
        "total_chat_sessions": total_chats,
        "avg_sentiment": float(np.mean(sentiments)) if sentiments else 0.5,
        "avg_stability": float(np.mean(stabilities)) if stabilities else 0.5,
        "days_since_last_activity": days_since_last,
        "avg_sleep_quality": float(np.mean(sleep_qualities)) if sleep_qualities else 5.0,
        "avg_sleep_hours": float(np.mean(sleep_hours_list)) if sleep_hours_list else 7.0,
        "mood_diversity": len(mood_set),
    }


def _features_to_vector(f: dict) -> list:
    """Convert feature dict to ordered numeric vector."""
    return [
        f["days_since_registration"],
        f["total_mood_logs"],
        f["total_sleep_logs"],
        f["total_chat_sessions"],
        f["avg_sentiment"],
        f["avg_stability"],
        f["days_since_last_activity"],
        f["avg_sleep_quality"],
        f["avg_sleep_hours"],
        f["mood_diversity"],
    ]


FEATURE_NAMES = [
    "days_since_registration",
    "total_mood_logs",
    "total_sleep_logs",
    "total_chat_sessions",
    "avg_sentiment",
    "avg_stability",
    "days_since_last_activity",
    "avg_sleep_quality",
    "avg_sleep_hours",
    "mood_diversity",
]


# ---------------------------------------------------------------------------
# 1. Churn Prediction  (Logistic Regression)
# ---------------------------------------------------------------------------

def predict_churn(db) -> dict:
    """
    Train a Logistic Regression model on all users and return per-user
    churn probability plus global metrics.

    Label heuristic: churned = 1 if days_since_last_activity > 7
    """
    users = list(db.collection("users").stream())
    if len(users) < 2:
        return {"error": "Not enough users for churn prediction", "predictions": []}

    all_features = []
    user_ids = []
    labels = []

    for u in users:
        uid = u.id
        user_ids.append(uid)
        feat = _extract_user_features(db, uid)
        all_features.append(feat)
        # Label: churned if inactive > 7 days
        labels.append(1 if feat["days_since_last_activity"] > 7 else 0)

    X = np.array([_features_to_vector(f) for f in all_features])
    y = np.array(labels)

    # Need at least both classes present; if not, use heuristic only
    unique_labels = set(y)
    if len(unique_labels) < 2:
        # All in one class — return heuristic scores
        predictions = []
        for i, uid in enumerate(user_ids):
            prob = 0.8 if y[i] == 1 else 0.2
            predictions.append({
                "user_id": uid,
                "churn_probability": prob,
                "risk_level": "high" if prob > 0.6 else "low",
                "features": all_features[i],
            })
        return {
            "model": "heuristic_fallback",
            "total_users": len(users),
            "at_risk_count": int(sum(y)),
            "predictions": predictions,
        }

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(X_scaled, y)

    probabilities = model.predict_proba(X_scaled)[:, 1]  # probability of churn

    # Feature importance (coefficient magnitude)
    importances = dict(zip(FEATURE_NAMES, [round(float(c), 4) for c in model.coef_[0]]))

    predictions = []
    at_risk = 0
    for i, uid in enumerate(user_ids):
        prob = round(float(probabilities[i]), 4)
        risk = "high" if prob > 0.6 else ("medium" if prob > 0.3 else "low")
        if risk in ("high", "medium"):
            at_risk += 1
        predictions.append({
            "user_id": uid,
            "churn_probability": prob,
            "risk_level": risk,
            "features": all_features[i],
        })

    return {
        "model": "LogisticRegression",
        "accuracy": round(float(model.score(X_scaled, y)), 4),
        "feature_importances": importances,
        "total_users": len(users),
        "at_risk_count": at_risk,
        "predictions": predictions,
    }


# ---------------------------------------------------------------------------
# 2. User Segmentation / Clustering  (K-Means)
# ---------------------------------------------------------------------------

CLUSTER_LABELS = {
    0: "Casual Sleeper",
    1: "Wellness Enthusiast",
    2: "Anxious Night-Owl",
    3: "Spiritual Seeker",
}


def cluster_users(db, n_clusters: int = 4) -> dict:
    """
    K-Means clustering to segment the user base.
    Returns cluster assignments and centroids.
    """
    users = list(db.collection("users").stream())
    if len(users) < n_clusters:
        n_clusters = max(2, len(users))

    all_features = []
    user_ids = []
    user_modes = []

    for u in users:
        uid = u.id
        user_ids.append(uid)
        feat = _extract_user_features(db, uid)
        all_features.append(feat)
        user_modes.append(u.to_dict().get("mode", "general"))

    X = np.array([_features_to_vector(f) for f in all_features])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(X_scaled)

    cluster_assignments = kmeans.labels_.tolist()
    inertia = float(kmeans.inertia_)

    # Build cluster summary
    cluster_summary = {}
    for cid in range(n_clusters):
        mask = kmeans.labels_ == cid
        members = [user_ids[i] for i in range(len(user_ids)) if mask[i]]
        centroid_features = dict(zip(
            FEATURE_NAMES,
            [round(float(v), 2) for v in scaler.inverse_transform(kmeans.cluster_centers_[cid:cid+1])[0]]
        ))
        label = CLUSTER_LABELS.get(cid, f"Cluster {cid}")
        cluster_summary[label] = {
            "cluster_id": cid,
            "member_count": int(mask.sum()),
            "members": members,
            "centroid": centroid_features,
        }

    # Per-user results
    user_results = []
    for i, uid in enumerate(user_ids):
        cid = cluster_assignments[i]
        user_results.append({
            "user_id": uid,
            "cluster_id": cid,
            "cluster_label": CLUSTER_LABELS.get(cid, f"Cluster {cid}"),
            "mode": user_modes[i],
            "features": all_features[i],
        })

    return {
        "model": "KMeans",
        "n_clusters": n_clusters,
        "inertia": round(inertia, 2),
        "cluster_summary": cluster_summary,
        "users": user_results,
    }


# ---------------------------------------------------------------------------
# 3. Sleep Quality Prediction  (Random Forest)
# ---------------------------------------------------------------------------

_MOOD_SCORE_MAP = {
    "happy": 0.9, "calm": 0.85, "grateful": 0.8, "hopeful": 0.75,
    "neutral": 0.5, "tired": 0.35, "sad": 0.3,
    "anxious": 0.25, "stressed": 0.2, "overwhelmed": 0.15,
}


def predict_sleep_quality(db, user_id: str) -> dict:
    """
    Train a Random Forest on the user's own sleep + mood data,
    then predict tonight's expected sleep quality (1-10).
    """
    # gather sleep logs
    sleep_docs = list(
        db.collection("sleep_logs")
        .where("user_id", "==", user_id)
        .order_by("created_at")
        .limit(200)
        .stream()
    )

    if len(sleep_docs) < 5:
        return {
            "predicted_quality": None,
            "confidence": 0,
            "message": "Need at least 5 sleep entries to generate a prediction.",
        }

    # Build feature matrix from historical sleep logs
    X_rows = []
    y_rows = []
    for doc in sleep_docs:
        d = doc.to_dict()
        mood_score = _MOOD_SCORE_MAP.get(d.get("mood", "neutral").lower(), 0.5)
        hours = d.get("hours", 7)
        quality = d.get("quality", 5)
        # day of week as feature
        ts = d.get("created_at")
        dow = 3  # mid-week fallback
        if hasattr(ts, "weekday"):
            dow = ts.weekday()
        X_rows.append([hours, mood_score, dow])
        y_rows.append(quality)

    X = np.array(X_rows)
    y = np.array(y_rows)

    model = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=5)
    model.fit(X, y)

    # Get latest mood for prediction
    latest_mood_docs = list(
        db.collection("mood_logs")
        .where("user_id", "==", user_id)
        .order_by("created_at", direction="DESCENDING")
        .limit(1)
        .stream()
    )
    current_mood_score = 0.5
    current_mood = "neutral"
    if latest_mood_docs:
        current_mood = latest_mood_docs[0].to_dict().get("mood", "neutral")
        current_mood_score = _MOOD_SCORE_MAP.get(current_mood.lower(), 0.5)

    avg_hours = float(np.mean([r[0] for r in X_rows[-7:]]))  # recent avg hours
    today_dow = datetime.utcnow().weekday()

    prediction_input = np.array([[avg_hours, current_mood_score, today_dow]])
    predicted = int(model.predict(prediction_input)[0])
    confidence = float(max(model.predict_proba(prediction_input)[0]))

    # Feature importance
    importances = dict(zip(
        ["sleep_hours", "mood_score", "day_of_week"],
        [round(float(v), 4) for v in model.feature_importances_]
    ))

    return {
        "predicted_quality": predicted,
        "confidence": round(confidence, 4),
        "current_mood": current_mood,
        "avg_recent_hours": round(avg_hours, 1),
        "feature_importances": importances,
        "model": "RandomForest",
        "training_samples": len(y_rows),
    }
