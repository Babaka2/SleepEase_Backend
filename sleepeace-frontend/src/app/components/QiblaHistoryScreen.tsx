import { useState } from 'react';
import { 
  Home, 
  Compass, 
  User, 
  ChevronRight, 
  Moon,
  Calendar, 
  MessageCircle,
  Award,
  Target,
  Sparkles,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  Flame,
  Star,
  BookOpen,
  ArrowLeft,
  Heart,
  Sun,
  Wind
} from 'lucide-react';
import PhoneFrame from './PhoneFrame';

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
  | 'settings'
  | 'settings-islamic';

type Mode = 'general' | 'islamic' | null;

interface QiblaHistoryScreenProps {
  navigate: (screen: Screen, mode?: Mode) => void;
}

type MoodKey = 'peaceful' | 'grateful' | 'worried' | 'tired' | 'seeking';

const moodMeta: Record<MoodKey, { label: string; emoji: string; color: string; bgColor: string }> = {
  peaceful: { label: 'Peaceful', emoji: '🌙', color: 'text-emerald-400', bgColor: 'bg-emerald-400/30' },
  grateful: { label: 'Grateful', emoji: '🤲', color: 'text-green-400', bgColor: 'bg-green-400/30' },
  worried: { label: 'Worried', emoji: '😰', color: 'text-amber-400', bgColor: 'bg-amber-400/30' },
  tired: { label: 'Tired', emoji: '😴', color: 'text-purple-400', bgColor: 'bg-purple-400/30' },
  seeking: { label: 'Seeking', emoji: '🤔', color: 'text-blue-400', bgColor: 'bg-blue-400/30' },
};

const summary: { key: MoodKey; pct: number }[] = [
  { key: 'peaceful', pct: 38 },
  { key: 'grateful', pct: 32 },
  { key: 'worried', pct: 15 },
  { key: 'tired', pct: 10 },
  { key: 'seeking', pct: 5 },
];

const checkins: { day: string; time: string; mood: MoodKey; note?: string }[] = [
  { day: 'Today', time: '10:30 PM', mood: 'peaceful', note: 'Evening adhkar brought peace' },
  { day: 'Yesterday', time: '9:15 PM', mood: 'grateful', note: 'Alhamdulillah for blessings' },
  { day: 'Dec 29', time: '11:00 PM', mood: 'tired', note: 'Long day of fasting' },
  { day: 'Dec 28', time: '10:45 PM', mood: 'peaceful' },
  { day: 'Dec 27', time: '8:30 PM', mood: 'worried', note: 'Made dua for guidance' },
];

export default function QiblaHistoryScreen({ navigate }: QiblaHistoryScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'insights' | 'history'>('overview');

  return (
    <PhoneFrame>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-900" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-14 pb-4">
          <button 
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95" 
            onClick={() => navigate('islamic-home')}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-white text-xl font-medium flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12.5c-1.2.7-2.6 1.1-4.1 1.1-4.4 0-8-3.6-8-8 0-1.5.4-2.9 1.1-4.1A9 9 0 1 0 21 12.5Z"
                  stroke="#F5D36C"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18.2s-2.5-1.5-3.6-2.9c-1.1-1.4-.7-3.2.6-4.1 1-.7 2.3-.5 3 .4.7-.9 2-.9 3-.2 1.2.8 1.5 2.6.4 4-1.1 1.5-3.4 2.8-3.4 2.8Z"
                  fill="#F5D36C"
                  opacity="0.9"
                />
              </svg>
              Qibla & Journey
            </h1>
            <p className="text-emerald-100/70 text-xs">Your spiritual path</p>
          </div>

          <button className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-100/70" />
            <span className="text-emerald-100/70 text-xs">Week</span>
            <ChevronRight className="w-3 h-3 text-emerald-100/50" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 mb-4">
          <div className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 p-1 flex gap-1">
            <TabButton 
              label="Overview" 
              active={selectedTab === 'overview'} 
              onClick={() => setSelectedTab('overview')}
            />
            <TabButton 
              label="Insights" 
              active={selectedTab === 'insights'} 
              onClick={() => setSelectedTab('insights')}
            />
            <TabButton 
              label="History" 
              active={selectedTab === 'history'} 
              onClick={() => setSelectedTab('history')}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-28">
          {selectedTab === 'overview' && <OverviewTab />}
          {selectedTab === 'insights' && <InsightsTab />}
          {selectedTab === 'history' && <HistoryTab />}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute left-0 right-0 bottom-5 px-10">
          <div className="w-full rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 flex justify-between items-center">
            <button className="flex flex-col items-center gap-1" onClick={() => navigate('islamic-home')}>
              <Home className="w-5 h-5 text-white/60" />
              <span className="text-[10px] text-white/55">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <Compass className="w-5 h-5 text-white" />
              <span className="text-[10px] text-white/85">Qibla</span>
            </button>
            <button className="flex flex-col items-center gap-1" onClick={() => navigate('ai-chat-islamic')}>
              <MessageCircle className="w-5 h-5 text-white/60" />
              <span className="text-[10px] text-white/55">AI</span>
            </button>
            <button className="flex flex-col items-center gap-1" onClick={() => navigate('settings-islamic')}>
              <User className="w-5 h-5 text-white/60" />
              <span className="text-[10px] text-white/55">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Tab Components ---------- */

function OverviewTab() {
  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          value="12"
          label="Prayer Streak"
          gradient="from-emerald-500/25 to-teal-500/25"
          iconColor="text-emerald-400"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          value="35"
          label="Check-ins"
          gradient="from-amber-500/25 to-yellow-500/25"
          iconColor="text-yellow-400"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          value="6"
          label="Badges"
          gradient="from-purple-500/25 to-pink-500/25"
          iconColor="text-purple-400"
        />
      </div>

      {/* Spiritual Growth Chart */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-medium">Spiritual Growth</h3>
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+18%</span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-32 flex items-end justify-between gap-2 mb-3">
          {[70, 60, 80, 75, 88, 82, 92].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                <div 
                  className="w-full bg-gradient-to-t from-emerald-500/40 to-teal-500/40 rounded-t-xl transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-emerald-100/40 text-xs">{'SMTWTFS'[i]}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-emerald-100/70">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
            <span>Growth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-500/60" />
            <span>Peace</span>
          </div>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
        <h3 className="text-white text-sm font-medium mb-4">Emotional State</h3>

        <div className="space-y-3">
          {summary.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-2xl">{moodMeta[s.key].emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-100/90 text-xs">{moodMeta[s.key].label}</span>
                  <span className="text-emerald-100/70 text-xs font-medium">{s.pct}%</span>
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

      {/* Prayer Times Card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-blue-400/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🕌</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm font-medium mb-1">Prayer Consistency</h3>
            <p className="text-emerald-100/80 text-xs mb-2">Completed 5 prayers for 12 days! 🌟</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-400/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-amber-400/30 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white text-sm font-medium mb-1">New Milestone!</h3>
            <p className="text-emerald-100/80 text-xs">12-day prayer streak unlocked 🌟</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsTab() {
  return (
    <div className="space-y-4">
      <InsightCard
        icon={<TrendingUp className="w-5 h-5" />}
        title="Spiritual Progress"
        description="Your peaceful moments increased by 28% this week, MashaAllah"
        gradient="from-emerald-500/20 to-green-500/20"
        iconBg="from-emerald-400/30 to-green-400/30"
        tag="MashaAllah"
      />
      
      <InsightCard
        icon={<Moon className="w-5 h-5" />}
        title="Best Reflection Time"
        description="Evening check-ins after Maghrib show highest peace levels"
        gradient="from-indigo-500/20 to-purple-500/20"
        iconBg="from-indigo-400/30 to-purple-400/30"
        tag="Pattern"
      />
      
      <InsightCard
        icon={<BookOpen className="w-5 h-5" />}
        title="Quran Reading Impact"
        description="Days with Quran reading show 65% more peacefulness"
        gradient="from-amber-500/20 to-yellow-500/20"
        iconBg="from-amber-400/30 to-yellow-400/30"
        tag="Discovery"
      />

      <InsightCard
        icon={<Heart className="w-5 h-5" />}
        title="Dhikr Benefits"
        description="Regular dhikr practice leads to 70% better emotional balance"
        gradient="from-pink-500/20 to-rose-500/20"
        iconBg="from-pink-400/30 to-rose-400/30"
        tag="Insight"
      />

      <InsightCard
        icon={<Clock className="w-5 h-5" />}
        title="Prayer Times"
        description="Never missed Fajr this week - keep up the dedication!"
        gradient="from-blue-500/20 to-cyan-500/20"
        iconBg="from-blue-400/30 to-cyan-400/30"
        tag="Achievement"
      />

      <InsightCard
        icon={<Sun className="w-5 h-5" />}
        title="Morning Gratitude"
        description="Morning adhkar correlates with 50% better mood throughout the day"
        gradient="from-orange-500/20 to-amber-500/20"
        iconBg="from-orange-400/30 to-amber-400/30"
        tag="Tip"
      />
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="space-y-3">
      <p className="text-emerald-100/70 text-xs mb-2">Recent spiritual check-ins</p>
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
                <span className="text-white text-sm font-medium">{moodMeta[checkin.mood].label}</span>
                <span className="text-emerald-100/60 text-xs">{checkin.time}</span>
              </div>
              <p className="text-emerald-100/70 text-xs mb-2">{checkin.day}</p>
              {checkin.note && (
                <div className="rounded-lg bg-white/10 p-2 mt-2">
                  <p className="text-emerald-100/80 text-xs italic">"{checkin.note}"</p>
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
          : 'text-emerald-100/70 hover:text-white/90'
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
      <p className="text-emerald-100/80 text-xs mt-0.5">{label}</p>
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
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/90 text-xs">
                {tag}
              </span>
            )}
          </div>
          <p className="text-emerald-100/80 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}