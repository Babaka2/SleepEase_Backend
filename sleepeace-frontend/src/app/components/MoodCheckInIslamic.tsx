import { useState } from 'react';
import { Home, Compass, User, MessageCircle, ArrowLeft } from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import { translations, Language } from '../translations';
import { saveMood } from '../../services/mood';

type Emotion = 'peaceful' | 'worried' | 'tired' | 'overwhelmed' | null;

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

interface UserInfo {
  name: string;
  email: string;
}

interface MoodCheckInIslamicProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  currentLanguage: Language;
  userInfo: UserInfo;
}

export default function MoodCheckInIslamic({ navigate, currentLanguage, userInfo }: MoodCheckInIslamicProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(null);

  // Ensure translations exist, fallback to English if not
  const t = translations[currentLanguage] || translations['en'];

  // Navigate to content reflection when emotion is selected
  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    // 保存心情到 Supabase
    if (emotion) {
      saveMood(emotion, 'islamic').catch((err) =>
        console.error('保存心情失败:', err)
      );
    }
    // Add a small delay for visual feedback
    setTimeout(() => {
      navigate('content-islamic');
    }, 300);
  };

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
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate('islamic-home')}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-white/90 text-sm font-medium">{t.moodCheckInIslamic.title}</h2>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Greeting */}
        <div className="text-center mb-8">
          <p className="text-emerald-100/70 text-sm">As-salamu alaykum,</p>
          <h1 className="text-white text-2xl font-light mt-1">{userInfo.name}</h1>
        </div>

        {/* Main question card */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 backdrop-blur-xl border border-emerald-400/20 p-6 mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center">
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
          <h3 className="text-white text-xl font-medium text-center mb-2">
            {t.moodCheckInIslamic.questionArabic}<br />
            {t.moodCheckInIslamic.question}
          </h3>
          <p className="text-emerald-100/60 text-sm text-center">
            {t.moodCheckInIslamic.subtitle}
          </p>
        </div>

        {/* Emotion Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <EmotionButtonIslamic
            label={t.moodCheckInIslamic.peacefulContent}
            emotion="peaceful"
            selected={selectedEmotion === 'peaceful'}
            onClick={() => handleEmotionSelect('peaceful')}
          />
          <EmotionButtonIslamic
            label={t.moodCheckInIslamic.worried}
            emotion="worried"
            selected={selectedEmotion === 'worried'}
            onClick={() => handleEmotionSelect('worried')}
          />
          <EmotionButtonIslamic
            label={t.moodCheckInIslamic.overwhelmed}
            emotion="overwhelmed"
            selected={selectedEmotion === 'overwhelmed'}
            onClick={() => handleEmotionSelect('overwhelmed')}
          />
          <EmotionButtonIslamic
            label={t.moodCheckInIslamic.tiredWeary}
            emotion="tired"
            selected={selectedEmotion === 'tired'}
            onClick={() => handleEmotionSelect('tired')}
          />
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="absolute left-0 right-0 bottom-5 px-10">
        <div className="w-full rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 flex justify-between items-center">
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('islamic-home')}>
            <Home className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{t.islamicHome.home}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('mood-history-islamic')}>
            <Compass className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{t.islamicHome.qibla}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('ai-chat-islamic')}>
            <MessageCircle className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{t.islamicHome.ai}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('settings-islamic')}>
            <User className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{t.islamicHome.profile}</span>
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Components ---------- */

function EmotionButtonIslamic({
  label,
  emotion,
  selected,
  onClick,
}: {
  label: string;
  emotion: Emotion;
  selected: boolean;
  onClick: () => void;
}) {
  // SVG emotion icons with Islamic theme
  const emotionIcons = {
    peaceful: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#10B981" opacity="0.2" />
        <circle cx="24" cy="24" r="18" stroke="#10B981" strokeWidth="2" />
        <circle cx="18" cy="21" r="2.5" fill="#10B981" />
        <circle cx="30" cy="21" r="2.5" fill="#10B981" />
        <path d="M17 28 Q24 33 31 28" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M21 12c3-2 6-2 9 0" stroke="#F5D36C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      </svg>
    ),
    worried: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#FBBF24" opacity="0.2" />
        <circle cx="24" cy="24" r="18" stroke="#FBBF24" strokeWidth="2" />
        <path d="M16 20 L20 22 L16 24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M32 20 L28 22 L32 24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M18 31 Q24 28 30 31" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    overwhelmed: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#F87171" opacity="0.2" />
        <circle cx="24" cy="24" r="18" stroke="#F87171" strokeWidth="2" />
        <path d="M16 19 Q18 23 16 23" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M32 19 Q30 23 32 23" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="24" cy="30" rx="6" ry="3" fill="#F87171" opacity="0.6" />
        <path d="M15 12 L18 15 M33 12 L30 15" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tired: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#A78BFA" opacity="0.2" />
        <circle cx="24" cy="24" r="18" stroke="#A78BFA" strokeWidth="2" />
        <path d="M15 20 L21 20" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M27 20 L33 20" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18 30 Q24 27 30 30" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M34 14 Q36 18 34 18" stroke="#F5D36C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      </svg>
    ),
  };

  const colors = {
    peaceful: 'from-emerald-500/20 to-teal-600/10 border-emerald-400/30',
    worried: 'from-amber-500/20 to-yellow-600/10 border-amber-400/30',
    overwhelmed: 'from-red-500/20 to-rose-600/10 border-red-400/30',
    tired: 'from-purple-500/20 to-indigo-600/10 border-purple-400/30',
  };

  const selectedColors = {
    peaceful: 'from-emerald-500/40 to-teal-600/30 border-emerald-400/60 shadow-lg shadow-emerald-500/20',
    worried: 'from-amber-500/40 to-yellow-600/30 border-amber-400/60 shadow-lg shadow-amber-500/20',
    overwhelmed: 'from-red-500/40 to-rose-600/30 border-red-400/60 shadow-lg shadow-red-500/20',
    tired: 'from-purple-500/40 to-indigo-600/30 border-purple-400/60 shadow-lg shadow-purple-500/20',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-3xl p-5 min-h-[140px] flex flex-col items-center justify-center gap-3 transition-all backdrop-blur-md border-2
        ${selected
          ? `bg-gradient-to-br ${selectedColors[emotion!]} scale-105`
          : `bg-gradient-to-br ${colors[emotion!]} hover:scale-105 active:scale-95`
        }
      `}
    >
      <div className={`transition-transform ${selected ? 'scale-110' : ''}`}>
        {emotionIcons[emotion!]}
      </div>
      <span className="text-white text-sm font-medium text-center leading-tight">
        {label}
      </span>
    </button>
  );
}