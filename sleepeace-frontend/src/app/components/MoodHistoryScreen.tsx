import { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Compass, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Calendar, 
  MessageCircle,
  Award,
  Target,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Brain,
  Activity,
  BarChart3,
  Zap,
  Clock,
  Flame,
  Star,
  Wind,
  Coffee,
  Smile,
  CloudRain,
  ArrowLeft
} from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import { Language, translations } from '../translations';
import { getMoodHistory, type MoodEntry } from '../../services/mood';

type Screen = 
  | 'mode-selection' 
  | 'general-home' 
  | 'islamic-home' 
  | 'mood-check-general' 
  | 'mood-check-islamic'
  | 'content-general'
  | 'content-islamic'
  | 'ai-chat'
  | 'ai-chat-islamic'
  | 'mood-history-general'
  | 'mood-history-islamic'
  | 'settings';

type Mode = 'general' | 'islamic' | null;

interface MoodHistoryScreenProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  currentLanguage: Language;
}

type MoodKey = 'calm' | 'happy' | 'anxious' | 'tired' | 'sad';

const moodMeta: Record<MoodKey, { emoji: string; color: string; bgColor: string }> = {
  calm: { emoji: '😌', color: 'text-blue-400', bgColor: 'bg-blue-400/30' },
  happy: { emoji: '😊', color: 'text-green-400', bgColor: 'bg-green-400/30' },
  anxious: { emoji: '😰', color: 'text-amber-400', bgColor: 'bg-amber-400/30' },
  tired: { emoji: '😴', color: 'text-purple-400', bgColor: 'bg-purple-400/30' },
  sad: { emoji: '😢', color: 'text-slate-400', bgColor: 'bg-slate-400/30' },
};

const ALL_MOOD_KEYS: MoodKey[] = ['calm', 'happy', 'anxious', 'tired', 'sad'];

function mapEmotionToMoodKey(emotion: string): MoodKey {
  const e = emotion.toLowerCase();
  if (e === 'calm' || e === 'peaceful') return 'calm';
  if (e === 'happy' || e === 'grateful') return 'happy';
  if (e === 'anxious' || e === 'worried' || e === 'overwhelmed') return 'anxious';
  if (e === 'tired') return 'tired';
  if (e === 'sad' || e === 'seeking') return 'sad';
  return 'calm';
}

function formatRelativeDay(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function computeStreak(entries: MoodEntry[]): number {
  const dates = new Set(
    entries.map(e => {
      const d = e.created_at ? new Date(e.created_at) : null;
      return d && !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    }).filter(Boolean)
  );
  let streak = 0;
  const cursor = new Date();
  // Try today first, then yesterday
  let key = cursor.toISOString().split('T')[0];
  if (!dates.has(key)) {
    cursor.setDate(cursor.getDate() - 1);
    key = cursor.toISOString().split('T')[0];
    if (!dates.has(key)) return 0;
  }
  while (dates.has(cursor.toISOString().split('T')[0])) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeWeeklyHeights(entries: MoodEntry[]): number[] {
  // Map entries to day-of-week (0=Sun..6=Sat) and compute average "positivity" per day
  const buckets: number[][] = [[], [], [], [], [], [], []];
  const scoreMap: Record<MoodKey, number> = { happy: 90, calm: 75, tired: 50, anxious: 35, sad: 20 };
  
  entries.forEach(e => {
    const d = e.created_at ? new Date(e.created_at) : null;
    if (!d || isNaN(d.getTime())) return;
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays > 6) return; // Only last 7 days
    const dow = d.getDay();
    buckets[dow].push(scoreMap[mapEmotionToMoodKey(e.emotion)] || 50);
  });
  
  return buckets.map(b => b.length > 0 ? Math.round(b.reduce((a, c) => a + c, 0) / b.length) : 0);
}

function computeTrendPercent(entries: MoodEntry[]): number {
  const scoreMap: Record<MoodKey, number> = { happy: 90, calm: 75, tired: 50, anxious: 35, sad: 20 };
  const now = new Date();
  const thisWeek: number[] = [];
  const lastWeek: number[] = [];
  entries.forEach(e => {
    const d = e.created_at ? new Date(e.created_at) : null;
    if (!d || isNaN(d.getTime())) return;
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const score = scoreMap[mapEmotionToMoodKey(e.emotion)] || 50;
    if (diff <= 6) thisWeek.push(score);
    else if (diff <= 13) lastWeek.push(score);
  });
  if (lastWeek.length === 0) return 0;
  const avgThis = thisWeek.reduce((a, c) => a + c, 0) / (thisWeek.length || 1);
  const avgLast = lastWeek.reduce((a, c) => a + c, 0) / lastWeek.length;
  return Math.round(((avgThis - avgLast) / avgLast) * 100);
}

export default function MoodHistoryScreen({ navigate, currentLanguage }: MoodHistoryScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'insights' | 'history'>('overview');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[currentLanguage].explore;

  useEffect(() => {
    getMoodHistory(100)
      .then(data => {
        // Filter to general mode entries
        const general = data.filter(e => !e.mode || e.mode === 'general');
        setEntries(general.length > 0 ? general : data);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  // Computed values
  const stats = useMemo(() => {
    const streak = computeStreak(entries);
    const checkIns = entries.length;
    const badges = Math.min(10, Math.floor(checkIns / 3) + (streak >= 7 ? 1 : 0));
    return { streak, checkIns, badges };
  }, [entries]);

  const distribution = useMemo(() => {
    const counts: Record<MoodKey, number> = { calm: 0, happy: 0, anxious: 0, tired: 0, sad: 0 };
    entries.forEach(e => counts[mapEmotionToMoodKey(e.emotion)]++);
    const total = entries.length || 1;
    return ALL_MOOD_KEYS.map(key => ({ key, pct: Math.round((counts[key] / total) * 100) }));
  }, [entries]);

  const weeklyHeights = useMemo(() => computeWeeklyHeights(entries), [entries]);
  const trendPercent = useMemo(() => computeTrendPercent(entries), [entries]);

  const checkins = useMemo(() => {
    return entries.slice(0, 10).map(e => ({
      day: formatRelativeDay(e.created_at),
      time: formatTime(e.created_at),
      mood: mapEmotionToMoodKey(e.emotion),
      note: e.note,
    }));
  }, [entries]);

  // Insights from real data
  const insights = useMemo(() => {
    const scoreMap: Record<MoodKey, number> = { happy: 90, calm: 75, tired: 50, anxious: 35, sad: 20 };
    const result: { icon: React.ReactNode; title: string; description: string; gradient: string; iconBg: string; tag: string }[] = [];
    
    if (trendPercent > 0) {
      result.push({
        icon: <TrendingUp className="w-5 h-5" />,
        title: t.positiveTrend,
        description: `Your calm moments increased by ${Math.abs(trendPercent)}% this week compared to last week`,
        gradient: 'from-green-500/20 to-emerald-500/20', iconBg: 'from-green-400/30 to-emerald-400/30', tag: t.great,
      });
    } else if (trendPercent < 0) {
      result.push({
        icon: <Activity className="w-5 h-5" />,
        title: t.stressTriggers,
        description: `Mood scores dipped ${Math.abs(trendPercent)}% this week — consider extra self-care`,
        gradient: 'from-red-500/20 to-rose-500/20', iconBg: 'from-red-400/30 to-rose-400/30', tag: t.alert,
      });
    }

    // Find best time of day
    const hourBuckets: Record<string, number[]> = { morning: [], afternoon: [], evening: [], night: [] };
    entries.forEach(e => {
      const d = e.created_at ? new Date(e.created_at) : null;
      if (!d || isNaN(d.getTime())) return;
      const h = d.getHours();
      const score = scoreMap[mapEmotionToMoodKey(e.emotion)] || 50;
      if (h >= 5 && h < 12) hourBuckets.morning.push(score);
      else if (h >= 12 && h < 17) hourBuckets.afternoon.push(score);
      else if (h >= 17 && h < 21) hourBuckets.evening.push(score);
      else hourBuckets.night.push(score);
    });
    const avgByPeriod = Object.entries(hourBuckets)
      .filter(([, scores]) => scores.length > 0)
      .map(([period, scores]) => ({ period, avg: scores.reduce((a, c) => a + c, 0) / scores.length }))
      .sort((a, b) => b.avg - a.avg);

    if (avgByPeriod.length > 0) {
      const best = avgByPeriod[0];
      result.push({
        icon: best.period === 'morning' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />,
        title: `Best ${best.period.charAt(0).toUpperCase() + best.period.slice(1)} Mood`,
        description: `You feel most positive during ${best.period} check-ins (avg score ${Math.round(best.avg)}%)`,
        gradient: 'from-indigo-500/20 to-purple-500/20', iconBg: 'from-indigo-400/30 to-purple-400/30', tag: t.insight,
      });
    }

    // Most common mood
    const sorted = [...distribution].sort((a, b) => b.pct - a.pct);
    if (sorted[0] && sorted[0].pct > 0) {
      result.push({
        icon: <Heart className="w-5 h-5" />,
        title: `${t[sorted[0].key]} Dominates`,
        description: `${sorted[0].pct}% of your check-ins this period are "${t[sorted[0].key]}"`,
        gradient: 'from-pink-500/20 to-rose-500/20', iconBg: 'from-pink-400/30 to-rose-400/30', tag: t.pattern || 'Pattern',
      });
    }

    // Streak insight
    if (stats.streak >= 7) {
      result.push({
        icon: <Flame className="w-5 h-5" />,
        title: `${stats.streak}-Day Streak!`,
        description: `You've been checking in consistently for ${stats.streak} days — amazing consistency!`,
        gradient: 'from-amber-500/20 to-orange-500/20', iconBg: 'from-amber-400/30 to-orange-400/30', tag: t.great,
      });
    }

    // Afternoon dip
    if (hourBuckets.afternoon.length > 0 && avgByPeriod.find(p => p.period === 'afternoon')) {
      const afternoon = avgByPeriod.find(p => p.period === 'afternoon')!;
      if (afternoon.avg < 50) {
        result.push({
          icon: <Coffee className="w-5 h-5" />,
          title: t.afternoonDip,
          description: t.afternoonDipDesc,
          gradient: 'from-cyan-500/20 to-blue-500/20', iconBg: 'from-cyan-400/30 to-blue-400/30', tag: t.tip,
        });
      }
    }

    // If no entries at all, show encouragement
    if (entries.length === 0) {
      result.push({
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Start Your Journey',
        description: 'Check in with your mood daily to see personalized insights here!',
        gradient: 'from-amber-500/20 to-orange-500/20', iconBg: 'from-amber-400/30 to-orange-400/30', tag: t.tip,
      });
    }

    return result;
  }, [entries, distribution, trendPercent, stats.streak, t]);

  return (
    <PhoneFrame>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-blue-900" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-14 pb-4">
          <button 
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95" 
            onClick={() => navigate('general-home')}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-white text-xl font-medium">{t.title}</h1>
            <p className="text-white/60 text-xs">{t.subtitle}</p>
          </div>

          <button className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/70" />
            <span className="text-white/70 text-xs">{t.week}</span>
            <ChevronRight className="w-3 h-3 text-white/50" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mb-4">
          <div className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 p-1 flex gap-1">
            <TabButton 
              label={t.overview} 
              active={selectedTab === 'overview'} 
              onClick={() => setSelectedTab('overview')}
            />
            <TabButton 
              label={t.insights} 
              active={selectedTab === 'insights'} 
              onClick={() => setSelectedTab('insights')}
            />
            <TabButton 
              label={t.history} 
              active={selectedTab === 'history'} 
              onClick={() => setSelectedTab('history')}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-28">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-white/50 text-sm">Loading...</div>
            </div>
          ) : (
            <>
              {selectedTab === 'overview' && (
                <OverviewTab
                  currentLanguage={currentLanguage}
                  stats={stats}
                  distribution={distribution}
                  weeklyHeights={weeklyHeights}
                  trendPercent={trendPercent}
                />
              )}
              {selectedTab === 'insights' && (
                <InsightsTab insights={insights} />
              )}
              {selectedTab === 'history' && (
                <HistoryTab currentLanguage={currentLanguage} checkins={checkins} />
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute left-0 right-0 bottom-5 px-10">
          <div className="w-full rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-3 flex justify-between items-center">
            <button className="flex flex-col items-center gap-1" onClick={() => navigate('general-home')}>
              <Home className="w-5 h-5 text-white/60" />
              <span className="text-[10px] text-white/60">{t.home}</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <Compass className="w-5 h-5 text-white" />
              <span className="text-[10px] text-white">{t.explore}</span>
            </button>
            <button className="flex flex-col items-center gap-1" onClick={() => navigate('ai-chat')}>
              <MessageCircle className="w-5 h-5 text-white/60" />
              <span className="text-[10px] text-white/60">{t.ai}</span>
            </button>
            <button className="flex flex-col items-center gap-1" onClick={() => navigate('settings')}>
              <User className="w-5 h-5 text-white/60" />
              <span className="text-[10px] text-white/60">{t.profile}</span>
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Tab Components ---------- */

interface OverviewProps {
  currentLanguage: Language;
  stats: { streak: number; checkIns: number; badges: number };
  distribution: { key: MoodKey; pct: number }[];
  weeklyHeights: number[];
  trendPercent: number;
}

function OverviewTab({ currentLanguage, stats, distribution, weeklyHeights, trendPercent }: OverviewProps) {
  const t = translations[currentLanguage].explore;
  const maxH = Math.max(...weeklyHeights, 1);
  
  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          value={String(stats.streak)}
          label={t.dayStreak}
          gradient="from-orange-500/25 to-red-500/25"
          iconColor="text-orange-400"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          value={String(stats.checkIns)}
          label={t.checkIns}
          gradient="from-blue-500/25 to-cyan-500/25"
          iconColor="text-blue-400"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          value={String(stats.badges)}
          label={t.badges}
          gradient="from-purple-500/25 to-pink-500/25"
          iconColor="text-purple-400"
        />
      </div>

      {/* Mood Trend Chart */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-medium">{t.moodTrend}</h3>
          <div className={`flex items-center gap-1 text-xs ${trendPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className="w-3 h-3" />
            <span>{trendPercent >= 0 ? '+' : ''}{trendPercent}%</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-32 flex items-end justify-between gap-2 mb-3">
          {weeklyHeights.map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                <div 
                  className="w-full bg-gradient-to-t from-blue-500/40 to-purple-500/40 rounded-t-xl transition-all"
                  style={{ height: `${maxH > 0 ? Math.round((height / maxH) * 100) : 0}%` }}
                />
              </div>
              <span className="text-white/40 text-xs">{'SMTWTFS'[i]}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500/60" />
            <span>{t.better}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500/60" />
            <span>{t.lower}</span>
          </div>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
        <h3 className="text-white text-sm font-medium mb-4">{t.moodDistribution}</h3>

        <div className="space-y-3">
          {distribution.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-2xl">{moodMeta[s.key].emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-xs">{t[s.key]}</span>
                  <span className="text-white/60 text-xs font-medium">{s.pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${moodMeta[s.key].bgColor} transition-all`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement */}
      {stats.streak >= 7 && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-400/20 p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-amber-400/30 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm font-medium mb-1">{t.newAchievement}</h3>
              <p className="text-white/70 text-xs">{stats.streak}-day streak unlocked! 🎉</p>
            </div>
          </div>
        </div>
      )}

      {stats.checkIns === 0 && (
        <div className="rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/20 p-5 text-center">
          <p className="text-white/70 text-sm">No check-ins yet. Start tracking your mood to see real data here!</p>
        </div>
      )}
    </div>
  );
}

interface InsightsTabProps {
  insights: { icon: React.ReactNode; title: string; description: string; gradient: string; iconBg: string; tag: string }[];
}

function InsightsTab({ insights }: InsightsTabProps) {
  return (
    <div className="space-y-4">
      {insights.map((ins, i) => (
        <InsightCard key={i} {...ins} />
      ))}
    </div>
  );
}

interface HistoryTabProps {
  currentLanguage: Language;
  checkins: { day: string; time: string; mood: MoodKey; note?: string }[];
}

function HistoryTab({ currentLanguage, checkins }: HistoryTabProps) {
  const t = translations[currentLanguage].explore;
  
  return (
    <div className="space-y-3">
      <p className="text-white/60 text-xs mb-2">{t.recentCheckIns}</p>
      {checkins.length === 0 && (
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center">
          <p className="text-white/50 text-sm">No check-ins yet</p>
        </div>
      )}
      {checkins.map((checkin, i) => (
        <div 
          key={i}
          className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
              {moodMeta[checkin.mood].emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-medium">{t[checkin.mood]}</span>
                <span className="text-white/50 text-xs">{checkin.time}</span>
              </div>
              <p className="text-white/60 text-xs mb-2">{checkin.day}</p>
              {checkin.note && (
                <div className="rounded-lg bg-white/10 p-2 mt-2">
                  <p className="text-white/70 text-xs italic">"{checkin.note}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Components ---------- */

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
        active 
          ? 'bg-white/20 text-white shadow-lg' 
          : 'text-white/60 hover:text-white/80'
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  icon,
  value,
  label,
  gradient,
  iconColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 p-3`}>
      <div className={`${iconColor} mb-2`}>{icon}</div>
      <p className="text-white text-xl font-bold">{value}</p>
      <p className="text-white/70 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
  gradient,
  iconBg,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  tag?: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white text-sm font-medium">{title}</h4>
            {tag && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/80 text-xs">
                {tag}
              </span>
            )}
          </div>
          <p className="text-white/70 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}