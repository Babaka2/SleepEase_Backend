import { auth } from '../lib/firebaseClient';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    User,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

const API_BASE_URL = 'https://sleepease-backend.onrender.com';

// ==================== Update User Mode ====================
export async function updateUserMode(mode: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');
    const token = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}/user/mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mode }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update mode');
    }
    return response.json();
}

// ==================== 注册 ====================
export async function signUp(email: string, password: string, fullName: string, mode: string = 'General') {
    // Register via backend to create Firebase user + Firestore record
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: fullName, mode }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    // After backend registration, sign in on frontend
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
}

// ==================== 登录 ====================
export async function signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, session: await userCredential.user.getIdToken() };
}

// ==================== 登出 ====================
export async function signOut() {
    await firebaseSignOut(auth);
}

// ==================== 获取当前用户 ====================
export async function getCurrentUser(): Promise<User | null> {
    return auth.currentUser;
}

// ==================== 获取当前会话 ====================
export async function getSession() {
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    return { access_token: token, user };
}

// ==================== 监听登录状态变化 ====================
export function onAuthStateChange(callback: (event: string, session: any) => void) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            callback('SIGNED_IN', { user });
        } else {
            callback('SIGNED_OUT', null);
        }
    });
}

// ==================== 重置密码 ====================
export async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
}

// ==================== Google 登录 ====================
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user };
}
