import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
import json

# Check if the app is initialized to avoid errors on reload
if not firebase_admin._apps:
    # Option 1: We are on Render (Cloud)
    if os.getenv("FIREBASE_CREDENTIALS"):
        # We load the JSON string directly from the environment variable
        creds_dict = json.loads(os.getenv("FIREBASE_CREDENTIALS"))
        cred = credentials.Certificate(creds_dict)
    
    # Option 2: We are on Local (Your Laptop)
    else:
        cred = credentials.Certificate("serviceAccountKey.json")

    firebase_admin.initialize_app(cred)

db = firestore.client()
print("--- Firebase Connected Successfully ---")