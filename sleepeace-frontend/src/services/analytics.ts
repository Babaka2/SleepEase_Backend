import { auth } from '../lib/firebaseClient';

const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://sleepease-backend.onrender.com';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not logged in');
  return user.getIdToken();
}

async function fetchAuth<T>(path: string): Promise<T> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchAdmin<T>(path: string, secret: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'admin-secret': secret },
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Personal scores ────────────────────────────────────────

export interface SleepIndex {
  sleep_improvement_index: number;
  sub_scores: { quality_score: number; duration_fitness: number; consistency: number };
  trend_vs_last_week: number;
}

export interface EmotionStability {
  emotion_stability_score: number;
  sub_scores: { mood_consistency: number; sentiment_trend: number; ai_stability_avg: number; streak_bonus: number };
  current_streak: number;
}

export interface Persona {
  persona: string;
  engagement_level: string;
  mode: string;
  traits: string[];
  activity: { mood_logs: number; sleep_logs: number; chat_sessions: number; total: number };
}

export interface SleepPrediction {
  predicted_quality: number | null;
  confidence: number;
  current_mood: string;
  model: string;
  training_samples: number;
}

export interface MyScores {
  sleep_improvement_index: SleepIndex;
  emotion_stability: EmotionStability;
  persona: Persona;
  engagement: { total_30d_logs: number; logs_per_day: number; engagement_rating: string };
  sleep_prediction: SleepPrediction;
}

export const fetchMyScores = () => fetchAuth<MyScores>('/analytics/my_scores');
export const fetchSleepIndex = () => fetchAuth<SleepIndex>('/analytics/sleep_index');
export const fetchEmotionStability = () => fetchAuth<EmotionStability>('/analytics/emotion_stability');
export const fetchSleepPrediction = () => fetchAuth<SleepPrediction>('/ml/sleep_prediction');

// ── Admin endpoints ────────────────────────────────────────

export interface BIDashboard {
  churn_metrics: {
    total_users: number;
    active_7d: number;
    churned_users: number;
    churn_rate_pct: number;
    retention_7d_pct: number;
  };
  retention_cohorts: {
    cohorts: Record<string, { registered: number; retention_7d_pct: number; retention_30d_pct: number }>;
  };
  content_volume: { mood_logs: number; sleep_logs: number; chat_sessions: number; total: number };
  mode_distribution: Record<string, number>;
  daily_active_users: Record<string, number>;
}

export interface ChurnPrediction {
  model: string;
  accuracy: number;
  total_users: number;
  at_risk_count: number;
  feature_importances: Record<string, number>;
  predictions: { user_id: string; churn_probability: number; risk_level: string }[];
}

export interface ClusterResult {
  model: string;
  n_clusters: number;
  cluster_summary: Record<string, { cluster_id: number; member_count: number; centroid: Record<string, number> }>;
  users: { user_id: string; cluster_id: number; cluster_label: string }[];
}

export interface ComplianceStats {
  total_audits: number;
  passed: number;
  blocked: number;
  pass_rate: number;
  avg_score: number;
  score_distribution: Record<string, number>;
}

export const fetchBIDashboard = (secret: string) => fetchAdmin<BIDashboard>('/analytics/bi_dashboard', secret);
export const fetchChurnPrediction = (secret: string) => fetchAdmin<ChurnPrediction>('/ml/churn_prediction', secret);
export const fetchUserClusters = (secret: string, n = 4) => fetchAdmin<ClusterResult>(`/ml/user_clusters?n_clusters=${n}`, secret);
export const fetchComplianceStats = (secret: string) => fetchAdmin<ComplianceStats>('/compliance/stats', secret);
