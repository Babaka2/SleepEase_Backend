/// <reference types="vite/client" />

import { auth } from '../lib/firebaseClient';

const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://sleepease-backend.onrender.com';

export interface HomeStats {
  streak: number;
  sleepIndexPct: number;
  stabilityPct: number;
  engagementCount: number;
  islamicCheckIns: number;
}

type AppMode = 'general' | 'islamic';

interface StreakResponse {
  streak?: number;
}

interface SleepIndexResponse {
  sleep_improvement_index?: number;
}

interface EmotionalTrendResponse {
  avg_stability?: number;
}

interface EngagementResponse {
  total_30d_logs?: number;
}

interface MoodHistoryItem {
  mode?: string;
}

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not logged in');
  }
  return user.getIdToken();
}

async function fetchWithAuth<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

function getFulfilledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

export async function fetchHomeStats(mode: AppMode): Promise<HomeStats> {
  const token = await getAuthToken();

  const [streakResult, sleepIndexResult, trendResult, engagementResult, moodResult] = await Promise.allSettled([
    fetchWithAuth<StreakResponse>('/logs/streak', token),
    fetchWithAuth<SleepIndexResponse>('/analytics/sleep_index', token),
    fetchWithAuth<EmotionalTrendResponse>('/analytics/emotional_trend', token),
    fetchWithAuth<EngagementResponse>('/analytics/engagement', token),
    fetchWithAuth<MoodHistoryItem[]>('/logs/mood?limit=100', token),
  ]);

  const streakData = getFulfilledValue(streakResult, {});
  const sleepIndexData = getFulfilledValue(sleepIndexResult, {});
  const trendData = getFulfilledValue(trendResult, {});
  const engagementData = getFulfilledValue(engagementResult, {});
  const moodData = getFulfilledValue(moodResult, []);

  const streak = Math.max(0, Number(streakData.streak ?? 0));
  const sleepIndexPct = Math.max(0, Math.min(100, Math.round(Number(sleepIndexData.sleep_improvement_index ?? 0))));
  const stabilityPct = Math.max(0, Math.min(100, Math.round(Number(trendData.avg_stability ?? 0) * 100)));
  const engagementCount = Math.max(0, Number(engagementData.total_30d_logs ?? 0));

  const islamicCheckIns = moodData.filter((entry) => {
    const entryMode = String(entry.mode ?? '').toLowerCase();
    return entryMode === 'islamic';
  }).length;

  if (mode === 'general') {
    return {
      streak,
      sleepIndexPct,
      stabilityPct,
      engagementCount,
      islamicCheckIns,
    };
  }

  return {
    streak,
    sleepIndexPct,
    stabilityPct,
    engagementCount,
    islamicCheckIns,
  };
}
