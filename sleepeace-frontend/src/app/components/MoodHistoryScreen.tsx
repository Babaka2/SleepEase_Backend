import { useState } from 'react';
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

const summary: { key: MoodKey; pct: number }[] = [
  { key: 'calm', pct: 35 },
  { key: 'happy', pct: 30 },
  { key: 'anxious', pct: 15 },
  { key: 'tired', pct: 12 },
  { key: 'sad', pct: 8 },
];

const checkins: { day: string; time: string; mood: MoodKey; note?: string }[] = [
  { day: 'Today', time: '10:30 PM', mood: 'calm', note: 'Meditation helped a lot' },
  { day: 'Yesterday', time: '9:15 PM', mood: 'happy', note: 'Great day at work!' },
  { day: 'Dec 29', time: '11:00 PM', mood: 'tired', note: 'Long productive day' },
  { day: 'Dec 28', time: '10:45 PM', mood: 'calm' },
  { day: 'Dec 27', time: '8:30 PM', mood: 'anxious', note: 'Stressed about deadline' },
];

export default function MoodHistoryScreen({ navigate, currentLanguage }: MoodHistoryScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'insights' | 'history'>('overview');
  const t = translations[currentLanguage].explore;

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
          {selectedTab === 'overview' && <OverviewTab currentLanguage={currentLanguage} />}
          {selectedTab === 'insights' && <InsightsTab currentLanguage={currentLanguage} />}
          {selectedTab === 'history' && <HistoryTab currentLanguage={currentLanguage} />}
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

function OverviewTab({ currentLanguage }: { currentLanguage: Language }) {
  const t = translations[currentLanguage].explore;
  
  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          value="7"
          label={t.dayStreak}
          gradient="from-orange-500/25 to-red-500/25"
          iconColor="text-orange-400"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          value="30"
          label={t.checkIns}
          gradient="from-blue-500/25 to-cyan-500/25"
          iconColor="text-blue-400"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          value="5"
          label={t.badges}
          gradient="from-purple-500/25 to-pink-500/25"
          iconColor="text-purple-400"
        />
      </div>

      {/* Mood Trend Chart */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-medium">{t.moodTrend}</h3>
          <div className="flex items-center gap-1 text-green-400 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+15%</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-32 flex items-end justify-between gap-2 mb-3">
          {[65, 45, 75, 60, 85, 70, 90].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                <div 
                  className="w-full bg-gradient-to-t from-blue-500/40 to-purple-500/40 rounded-t-xl transition-all"
                  style={{ height: `${height}%` }}
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
          {summary.map((s) => (
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

      {/* Achievements */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-400/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-amber-400/30 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white text-sm font-medium mb-1">{t.newAchievement}</h3>
            <p className="text-white/70 text-xs">{t.streakUnlocked}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsTab({ currentLanguage }: { currentLanguage: Language }) {
  const t = translations[currentLanguage].explore;
  
  return (
    <div className="space-y-4">
      <InsightCard
        icon={<TrendingUp className="w-5 h-5" />}
        title={t.positiveTrend}
        description={t.positiveTrendDesc}
        gradient="from-green-500/20 to-emerald-500/20"
        iconBg="from-green-400/30 to-emerald-400/30"
        tag={t.great}
      />
      
      <InsightCard
        icon={<Moon className="w-5 h-5" />}
        title={t.bestSleepPattern}
        description={t.bestSleepPatternDesc}
        gradient="from-indigo-500/20 to-purple-500/20"
        iconBg="from-indigo-400/30 to-purple-400/30"
        tag={t.insight}
      />
      
      <InsightCard
        icon={<Sun className="w-5 h-5" />}
        title={t.morningEnergy}
        description={t.morningEnergyDesc}
        gradient="from-amber-500/20 to-orange-500/20"
        iconBg="from-amber-400/30 to-orange-400/30"
        tag={t.pattern}
      />

      <InsightCard
        icon={<Heart className="w-5 h-5" />}
        title={t.meditationImpact}
        description={t.meditationImpactDesc}
        gradient="from-pink-500/20 to-rose-500/20"
        iconBg="from-pink-400/30 to-rose-400/30"
        tag={t.discovery}
      />

      <InsightCard
        icon={<Activity className="w-5 h-5" />}
        title={t.stressTriggers}
        description={t.stressTriggersDesc}
        gradient="from-red-500/20 to-rose-500/20"
        iconBg="from-red-400/30 to-rose-400/30"
        tag={t.alert}
      />

      <InsightCard
        icon={<Coffee className="w-5 h-5" />}
        title={t.afternoonDip}
        description={t.afternoonDipDesc}
        gradient="from-cyan-500/20 to-blue-500/20"
        iconBg="from-cyan-400/30 to-blue-400/30"
        tag={t.tip}
      />
    </div>
  );
}

function HistoryTab({ currentLanguage }: { currentLanguage: Language }) {
  const t = translations[currentLanguage].explore;
  
  return (
    <div className="space-y-3">
      <p className="text-white/60 text-xs mb-2">{t.recentCheckIns}</p>
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