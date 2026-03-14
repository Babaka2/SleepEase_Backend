from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

# We use a persistent key from .env or generate a temporary one (not recommended for production)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not ENCRYPTION_KEY:
    # If no key is found, we should warn or generate one. 
    # For a real project, this MUST be in the .env
    print("WARNING: ENCRYPTION_KEY not found in .env. Using a temporary key.")
    ENCRYPTION_KEY = Fernet.generate_key().decode()

fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_text(text: str) -> str:
    """Encrypts a string for secure storage."""
    if not text:
        return text
    return fernet.encrypt(text.encode()).decode()

def decrypt_text(encrypted_text: str) -> str:
    """Decrypts a string for reading."""
    if not encrypted_text:
        return encrypted_text
    try:
        return fernet.decrypt(encrypted_text.encode()).decode()
    except Exception:
        # If decryption fails (e.g. legacy plain text), return as is
        return encrypted_text
