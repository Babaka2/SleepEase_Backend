import { auth } from '../lib/firebaseClient';

const API_BASE_URL = 'https://sleepease-backend.onrender.com';

// ==================== 心情类型 ====================
// General 模式心情
export type GeneralEmotion = 'calm' | 'anxious' | 'tired' | 'overwhelmed';
// Islamic 模式心情
export type IslamicEmotion = 'peaceful' | 'worried' | 'tired' | 'overwhelmed';
// 全部心情
export type Emotion = GeneralEmotion | IslamicEmotion;
// 模式
export type AppMode = 'general' | 'islamic';

// ==================== 心情记录接口 ====================
export interface MoodEntry {
    id?: string;
    user_id?: string;
    emotion: Emotion;
    mode: AppMode;
    note?: string;          // 可选备注
    created_at?: string;
}

// Helper to get auth token
async function getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('用户未登录');
    return user.getIdToken();
}

// ==================== 保存心情 ====================
export async function saveMood(emotion: Emotion, mode: AppMode, note?: string) {
    const user = auth.currentUser;
    if (!user) {
        console.error('❌ 用户未登录，无法保存心情');
        throw new Error('用户未登录');
    }

    console.log('👤 当前用户:', user.uid);

    const token = await getAuthToken();
    const payload = {
        user_id: user.uid,
        mood: emotion,
        note: note || null,
        mode: mode,
    };
    console.log('📦 准备插入的数据:', payload);

    const response = await fetch(`${API_BASE_URL}/logs/mood`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('❌ 插入失败，完整错误:', JSON.stringify(error));
        throw new Error(error.detail || 'Failed to save mood');
    }

    const data = await response.json();
    console.log('✅ 心情已保存!', data);
    return data;
}

// ==================== 获取心情历史 ====================
export async function getMoodHistory(limit = 30): Promise<MoodEntry[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/logs/mood?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch mood history');
    return response.json();
}

// ==================== 获取今天的心情 ====================
export async function getTodayMood(): Promise<MoodEntry | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/logs/mood/today`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) return null;
    return response.json();
}

// ==================== 删除心情记录 ====================
export async function deleteMood(id: string) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/logs/mood/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete mood');
}
