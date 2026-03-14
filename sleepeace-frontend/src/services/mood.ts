import { auth } from '../lib/firebaseClient';

const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://sleepease-backend.onrender.com';

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

interface LegacyGratitudeEntry {
    id?: string;
    content?: string;
    date?: string;
    created_at?: string;
}

// Helper to get auth token
async function getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('用户未登录');
    return user.getIdToken();
}

function todayDateString() {
    return new Date().toISOString().split('T')[0];
}

function parseLegacyMoodContent(content?: string): { emotion: Emotion; mode: AppMode; note?: string } {
    const raw = String(content || '');
    const emotionMatch = raw.match(/mood:([^;]+)/i);
    const modeMatch = raw.match(/mode:([^;]+)/i);
    const noteMatch = raw.match(/note:(.*)$/i);

    const parsedEmotion = (emotionMatch?.[1]?.trim() || 'calm') as Emotion;
    const parsedMode = (modeMatch?.[1]?.trim() || 'general').toLowerCase() as AppMode;
    const parsedNote = noteMatch?.[1]?.trim();

    return {
        emotion: parsedEmotion,
        mode: parsedMode === 'islamic' ? 'islamic' : 'general',
        note: parsedNote || undefined,
    };
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

    if (response.ok) {
        const data = await response.json();
        console.log('✅ 心情已保存!', data);
        return data;
    }

    if (response.status === 404) {
        // Legacy backend compatibility: store mood in gratitude content payload.
        const legacyPayload = {
            user_id: user.uid,
            content: `mood:${emotion};mode:${mode};note:${note || ''}`,
            date: todayDateString(),
        };

        const legacyResponse = await fetch(`${API_BASE_URL}/gratitude/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(legacyPayload),
        });

        if (legacyResponse.ok) {
            const legacyData = await legacyResponse.json();
            console.log('✅ 心情已通过兼容接口保存!', legacyData);
            return legacyData;
        }

        const legacyError = await legacyResponse.json().catch(() => ({ detail: 'Legacy save failed' }));
        throw new Error(legacyError.detail || 'Failed to save mood (legacy)');
    }

    const error = await response.json().catch(() => ({ detail: 'Failed to save mood' }));
    console.error('❌ 插入失败，完整错误:', JSON.stringify(error));
    throw new Error(error.detail || 'Failed to save mood');
}

// ==================== 获取心情历史 ====================
export async function getMoodHistory(limit = 30): Promise<MoodEntry[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/logs/mood?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok) {
        return response.json();
    }

    if (response.status === 404) {
        const legacyResponse = await fetch(`${API_BASE_URL}/gratitude/list?user_id=${encodeURIComponent(user.uid)}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!legacyResponse.ok) {
            return [];
        }

        const legacyList = await legacyResponse.json() as LegacyGratitudeEntry[];
        return legacyList.slice(0, limit).map((entry) => {
            const parsed = parseLegacyMoodContent(entry.content);
            return {
                id: entry.id,
                emotion: parsed.emotion,
                mode: parsed.mode,
                note: parsed.note,
                created_at: entry.created_at || entry.date,
            };
        });
    }

    throw new Error('Failed to fetch mood history');
}

// ==================== 获取今天的心情 ====================
export async function getTodayMood(): Promise<MoodEntry | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/logs/mood/today`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok) return response.json();

    if (response.status === 404) {
        const history = await getMoodHistory(1);
        return history[0] || null;
    }

    return null;
}

// ==================== 删除心情记录 ====================
export async function deleteMood(id: string) {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/logs/mood/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok || response.status === 404) return;
    throw new Error('Failed to delete mood');
}
