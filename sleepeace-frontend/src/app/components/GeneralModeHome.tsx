import {
  Settings,
  Play,
  Home,
  Compass,
  User,
  MessageCircle,
  Sparkles,
  Wind,
  Moon,
  Music,
  Heart,
  TrendingUp,
  Flame,
  Target,
  Zap,
  BookOpen,
  Headphones,
  Coffee,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import PhoneFrame from "./PhoneFrame";
import { Language, translations } from "../translations";

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

interface GeneralModeHomeProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  userInfo: { name: string; email: string };
  currentLanguage: Language;
}

export default function GeneralModeHome({ navigate, userInfo, currentLanguage }: GeneralModeHomeProps) {
  const t = translations[currentLanguage].generalHome;

  return (
    <PhoneFrame>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-blue-900" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Scrollable content */}
      <div className="relative w-full h-full p-6 pt-14 pb-28 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/60 text-sm">{t.greeting}</p>
            <h1 className="text-white text-2xl font-light mt-0.5">
              {userInfo.name || t.guest}
            </h1>
          </div>
          <button
            className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate('settings')}
          >
            <Settings className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Streak & Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Streak */}
          <div className="rounded-2xl bg-gradient-to-br from-orange-500/25 to-red-500/25 backdrop-blur-xl border border-orange-400/20 p-3">
            <Flame className="w-5 h-5 text-orange-400 mb-2" />
            <p className="text-white text-xl font-bold">7</p>
            <p className="text-white/70 text-xs">{t.streak}</p>
          </div>

          {/* Mood Score */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-500/25 to-purple-500/25 backdrop-blur-xl border border-blue-400/20 p-3">
            <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-white text-xl font-bold">85%</p>
            <p className="text-white/70 text-xs">{t.progress}</p>
          </div>

          {/* Minutes */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 backdrop-blur-xl border border-emerald-400/20 p-3">
            <Zap className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-white text-xl font-bold">42</p>
            <p className="text-white/70 text-xs">{t.minutes}</p>
          </div>
        </div>

        {/* Main mood card */}
        <button
          className="w-full rounded-3xl bg-gradient-to-br from-slate-200/90 to-slate-300/70 backdrop-blur-xl shadow-xl border border-white/40 p-6 mb-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate('mood-check-general')}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/70 shadow-lg flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#475569" strokeWidth="2.5" opacity="0.9" />
              <circle cx="18" cy="20" r="2.5" fill="#475569" opacity="0.9" />
              <circle cx="30" cy="20" r="2.5" fill="#475569" opacity="0.9" />
              <path d="M16 28 Q24 35 32 28" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
            </svg>
          </div>

          <h2 className="text-slate-800 text-2xl font-medium leading-tight mb-3" style={{ whiteSpace: 'pre-line' }}>
            {t.moodQuestion}
          </h2>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t.tapToCheckIn}
          </p>
        </button>

        {/* Daily Goals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-medium">{t.todaysGoals}</h3>
            <button className="text-white/60 text-xs" onClick={() => navigate('mood-history-general')}>{t.viewAll}</button>
          </div>

          <div className="space-y-2">
            <GoalItem
              icon={<Heart className="w-4 h-4" />}
              label={t.logMood}
              completed={true}
            />
            <GoalItem
              icon={<Wind className="w-4 h-4" />}
              label={t.breathing}
              completed={false}
            />
            <GoalItem
              icon={<BookOpen className="w-4 h-4" />}
              label={t.readAffirmations}
              completed={false}
            />
          </div>
        </div>

        {/* Quick action cards */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-3">{t.quickActions}</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Quick Relax */}
            <button className="rounded-3xl bg-slate-700/60 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-slate-700/70 active:scale-95">
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.quickRelax}</h3>
                <p className="text-white/60 text-xs mt-1">{t.quickRelax5min}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                <Wind className="w-5 h-5 text-white/50 mb-1" />
              </div>
            </button>

            {/* Sleep Sounds */}
            <button className="rounded-3xl bg-slate-600/50 backdrop-blur-xl border-2 border-white/30 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-slate-600/60 active:scale-95">
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.sleepSounds}</h3>
                <p className="text-white/60 text-xs mt-1">{t.sleepSoundsTracks}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <Moon className="w-5 h-5 text-white/60 mb-1" />
              </div>
            </button>

            {/* Breathing */}
            <button className="rounded-3xl bg-blue-600/40 backdrop-blur-xl border border-blue-400/20 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-blue-600/50 active:scale-95">
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.deepBreathing}</h3>
                <p className="text-white/60 text-xs mt-1">{t.deepBreathing3min}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Wind className="w-5 h-5 text-white" />
                </div>
                <Heart className="w-5 h-5 text-white/60 mb-1" />
              </div>
            </button>

            {/* Meditation */}
            <button
              className="rounded-3xl bg-purple-600/40 backdrop-blur-xl border border-purple-400/20 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-purple-600/50 active:scale-95"
              onClick={() => navigate('content-general')}
            >
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.meditationLibrary}</h3>
                <p className="text-white/60 text-xs mt-1">{t.meditationSessions}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <Sparkles className="w-5 h-5 text-white/60 mb-1" />
              </div>
            </button>
          </div>
        </div>

        {/* Recent Mood Trend */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-medium">{t.thisWeek}</h3>
            <button className="text-white/60 text-xs" onClick={() => navigate('mood-history-general')}>{t.seeDetails}</button>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{t.sleepQuality}</p>
                <p className="text-white/60 text-xs">{t.sleepQualityImprovement}</p>
              </div>
            </div>

            {/* Mini chart */}
            <div className="flex items-end justify-between gap-2 h-16">
              {[60, 45, 70, 55, 80, 75, 85].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gradient-to-t from-blue-500/40 to-purple-500/40 rounded-t-lg transition-all" style={{ height: `${height}%` }} />
                  <span className="text-white/40 text-xs">{'SMTWTFS'[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wellness tip card */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-white/10 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-300/80" />
            </div>
            <div className="flex-1">
              <h4 className="text-white/90 text-sm font-medium mb-1">{t.tipTitle}</h4>
              <p className="text-white/60 text-xs leading-relaxed">
                {t.tipContent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="absolute left-0 right-0 bottom-5 px-10">
        <div className="w-full rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-3 flex justify-between items-center">
          <button className="flex flex-col items-center gap-1">
            <Home className="w-5 h-5 text-white" />
            <span className="text-[10px] text-white">{t.home}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('mood-history-general')}>
            <Compass className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{t.explore}</span>
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
    </PhoneFrame>
  );
}

/* ---------- Components ---------- */

function GoalItem({ icon, label, completed }: { icon: React.ReactNode; label: string; completed: boolean }) {
  return (
    <div className={`rounded-xl backdrop-blur-xl border p-3 flex items-center gap-3 ${completed
        ? 'bg-emerald-500/20 border-emerald-400/30'
        : 'bg-white/10 border-white/20'
      }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${completed ? 'bg-emerald-500/30' : 'bg-white/15'
        }`}>
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <div className="text-white/70">{icon}</div>
        )}
      </div>
      <p className={`text-sm flex-1 ${completed ? 'text-white/90 line-through' : 'text-white/80'
        }`}>{label}</p>
    </div>
  );
}