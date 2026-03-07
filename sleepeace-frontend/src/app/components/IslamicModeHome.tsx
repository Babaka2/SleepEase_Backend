import {
  Settings,
  Play,
  Home,
  Compass,
  User,
  MessageCircle,
  Sparkles,
  Moon,
  Heart,
  TrendingUp,
  Flame,
  BookOpen,
  Star,
  CheckCircle2,
  Clock,
  Headphones,
  Music,
  Wind
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
  | 'settings-islamic';

type Mode = 'general' | 'islamic' | null;

interface IslamicModeHomeProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  userInfo: { name: string; email: string };
  currentLanguage: Language;
}

export default function IslamicModeHome({ navigate, userInfo, currentLanguage }: IslamicModeHomeProps) {
  const t = translations[currentLanguage].islamicHome;

  return (
    <PhoneFrame>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-900" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>

      {/* Scrollable Content */}
      <div className="relative w-full h-full px-6 pt-14 pb-28 overflow-y-auto">
        {/* Greeting + Settings */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-emerald-100/70 text-sm">{t.greeting}</p>
            <p className="text-white text-2xl font-light mt-1">{userInfo.name || t.guest}</p>
          </div>

          <button
            className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate('settings-islamic')}
          >
            <Settings className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Streak & Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Prayer Streak */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 backdrop-blur-xl border border-emerald-400/20 p-3">
            <Flame className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-white text-xl font-bold">12</p>
            <p className="text-emerald-100/70 text-xs">{t.dayStreak}</p>
          </div>

          {/* Spiritual Score */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-500/25 backdrop-blur-xl border border-amber-400/20 p-3">
            <TrendingUp className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-white text-xl font-bold">92%</p>
            <p className="text-emerald-100/70 text-xs">{t.prayers}</p>
          </div>

          {/* Dhikr Count */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/25 to-pink-500/25 backdrop-blur-xl border border-purple-400/20 p-3">
            <Star className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-white text-xl font-bold">156</p>
            <p className="text-emerald-100/70 text-xs">{t.duasMastered}</p>
          </div>
        </div>

        {/* Main Reflection Card */}
        <button
          onClick={() => navigate('mood-check-islamic')}
          className="w-full mb-6 rounded-3xl bg-gradient-to-br from-white/15 to-white/5 border border-yellow-200/20 backdrop-blur-xl p-6 text-center transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 border border-yellow-200/30 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
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
          </div>
          <p className="text-white text-xl font-medium mb-2">
            {t.moodQuestion}
          </p>
          <p className="text-emerald-100/60 text-sm mb-1">
            {t.moodQuestion2}
          </p>
          <p className="text-emerald-200/70 text-xs flex items-center justify-center gap-2 mt-3">
            <Sparkles className="w-4 h-4" />
            {t.spiritualCheckIn}
          </p>
        </button>

        {/* Daily Islamic Goals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-medium">{t.todaysGoals}</h3>
            <button className="text-emerald-100/60 text-xs" onClick={() => navigate('mood-history-islamic')}>{t.viewAll}</button>
          </div>

          <div className="space-y-2">
            <IslamicGoalItem
              icon={<span className="text-base">🕌</span>}
              label={t.complete5Prayers}
              completed={true}
            />
            <IslamicGoalItem
              icon={<span className="text-base">📖</span>}
              label={t.readQuranDaily}
              completed={true}
            />
            <IslamicGoalItem
              icon={<span className="text-base">🤲</span>}
              label={t.morningEveningAdhkar}
              completed={false}
            />
          </div>
        </div>

        {/* Prayer Times */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-3">{t.nextPrayer}</h3>

          <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/20 backdrop-blur-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <span className="text-2xl">🕌</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{t.fajrPrayer}</p>
                <p className="text-emerald-100/60 text-xs">{t.tomorrowMorning}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white text-lg font-semibold">5:42 AM</p>
              <p className="text-emerald-300/80 text-xs flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" />
                {t.inTime}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-3">{t.quickActions}</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Evening Adhkar */}
            <button className="rounded-3xl bg-emerald-600/40 backdrop-blur-xl border border-emerald-400/20 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-emerald-600/50 active:scale-95">
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.eveningAdhkar}</h3>
                <p className="text-emerald-100/70 text-xs mt-1">{t.remembrance}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl mb-1">📿</span>
              </div>
            </button>

            {/* Quran Audio */}
            <button
              className="rounded-3xl bg-amber-600/40 backdrop-blur-xl border-2 border-yellow-400/30 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-amber-600/50 active:scale-95"
              onClick={() => navigate('content-islamic')}
            >
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.quranAudio}</h3>
                <p className="text-emerald-100/70 text-xs mt-1">{t.listenReflect}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl mb-1">📖</span>
              </div>
            </button>

            {/* Dua Collection */}
            <button className="rounded-3xl bg-purple-600/40 backdrop-blur-xl border border-purple-400/20 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-purple-600/50 active:scale-95">
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.dailyDuas}</h3>
                <p className="text-emerald-100/70 text-xs mt-1">{t.supplications}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl mb-1">🤲</span>
              </div>
            </button>

            {/* Islamic Meditation */}
            <button className="rounded-3xl bg-teal-600/40 backdrop-blur-xl border border-teal-400/20 p-5 flex flex-col justify-between min-h-[140px] transition-all hover:bg-teal-600/50 active:scale-95">
              <div>
                <h3 className="text-white text-base font-medium whitespace-pre-line">{t.peacefulSounds}</h3>
                <p className="text-emerald-100/70 text-xs mt-1">{t.relaxation}</p>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <Wind className="w-5 h-5 text-emerald-300/70 mb-1" />
              </div>
            </button>
          </div>
        </div>

        {/* Spiritual Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-medium">{t.thisWeek}</h3>
            <button className="text-emerald-100/60 text-xs" onClick={() => navigate('mood-history-islamic')}>{t.seeDetails}</button>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{t.growingStronger}</p>
                <p className="text-emerald-100/70 text-xs">{t.spiritualGrowth}</p>
              </div>
            </div>

            {/* Mini chart */}
            <div className="flex items-end justify-between gap-2 h-16">
              {[65, 55, 75, 70, 85, 80, 92].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gradient-to-t from-emerald-500/40 to-teal-500/40 rounded-t-lg transition-all" style={{ height: `${height}%` }} />
                  <span className="text-emerald-100/50 text-xs">{'SMTWTFS'[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hadith of the Day */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            {t.hadithOfDay}
          </h3>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-400/20 backdrop-blur-xl p-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/30 to-amber-400/30 flex items-center justify-center mb-3">
              <span className="text-2xl">📿</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed italic mb-3">
              "{t.hadithContent}"
            </p>
            <p className="text-emerald-200/70 text-xs mb-4">
              {t.hadithSource}
            </p>

            <div className="pt-3 border-t border-white/10">
              <p className="text-emerald-200/80 text-xs mb-1.5">{t.todaysReflection}</p>
              <p className="text-emerald-100/80 text-xs leading-relaxed">
                {t.reflectionText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="absolute left-0 right-0 bottom-5 px-10">
        <div className="w-full rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 flex justify-between items-center">
          <button className="flex flex-col items-center gap-1">
            <Home className="w-5 h-5 text-white" />
            <span className="text-[10px] text-white/85">{t.home}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('mood-history-islamic')}>
            <Compass className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{t.qibla}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('ai-chat-islamic')}>
            <MessageCircle className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{t.ai}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('settings-islamic')}>
            <User className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{t.profile}</span>
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Components ---------- */

function IslamicGoalItem({ icon, label, completed }: { icon: React.ReactNode; label: string; completed: boolean }) {
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