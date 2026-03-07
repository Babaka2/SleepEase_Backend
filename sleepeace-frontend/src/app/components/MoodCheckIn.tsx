import { useState } from 'react';
import { Home, Compass, User, MessageCircle, ArrowLeft, Sparkles } from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import { translations, Language } from '../translations';
import { saveMood } from '../../services/mood';

type Emotion = 'calm' | 'anxious' | 'tired' | 'overwhelmed' | null;

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

interface MoodCheckInProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  currentLanguage: Language;
  userName?: string;
}

export default function MoodCheckIn({ navigate, currentLanguage, userName }: MoodCheckInProps) {
  const t = translations[currentLanguage].moodCheckIn;
  const navT = translations[currentLanguage].generalHome;
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(null);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;
    return t.goodEvening;
  };

  // Handle emotion selection and navigate to content screen
  const handleEmotionSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    // 保存心情到 Supabase
    if (emotion) {
      saveMood(emotion, 'general').catch((err) =>
        console.error('保存心情失败:', err)
      );
    }
    // Add a small delay for visual feedback
    setTimeout(() => {
      navigate('content-general');
    }, 300);
  };

  return (
    <PhoneFrame>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-blue-900" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Scrollable Content */}
      <div className="relative w-full h-full px-6 pt-14 pb-28 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate('general-home')}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-white/90 text-sm font-medium">{t.title}</h2>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Greeting */}
        <div className="text-center mb-8">
          <p className="text-white/60 text-sm">{getGreeting()}</p>
          <h1 className="text-white text-2xl font-light mt-1">{userName || t.guest}</h1>
        </div>

        {/* Main question card */}
        <div className="rounded-3xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 p-6 mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white/80" />
          </div>
          <h3 className="text-white text-xl font-medium text-center mb-2 whitespace-pre-line">
            {t.question}
          </h3>
          <p className="text-white/50 text-sm text-center">
            {t.subtitle}
          </p>
        </div>

        {/* Emotion Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <EmotionButton
            label={t.calmPeaceful}
            emotion="calm"
            selected={selectedEmotion === 'calm'}
            onClick={() => handleEmotionSelect('calm')}
          />
          <EmotionButton
            label={t.anxious}
            emotion="anxious"
            selected={selectedEmotion === 'anxious'}
            onClick={() => handleEmotionSelect('anxious')}
          />
          <EmotionButton
            label={t.overwhelmed}
            emotion="overwhelmed"
            selected={selectedEmotion === 'overwhelmed'}
            onClick={() => handleEmotionSelect('overwhelmed')}
          />
          <EmotionButton
            label={t.tiredSleepy}
            emotion="tired"
            selected={selectedEmotion === 'tired'}
            onClick={() => handleEmotionSelect('tired')}
          />
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="absolute left-0 right-0 bottom-5 px-10">
        <div className="w-full rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-3 flex justify-between items-center">
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('general-home')}>
            <Home className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{navT.home}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('mood-history-general')}>
            <Compass className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{navT.explore}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('ai-chat')}>
            <MessageCircle className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{navT.ai}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('settings')}>
            <User className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{navT.profile}</span>
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Components ---------- */

function EmotionButton({
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
  // SVG emotion icons
  const emotionIcons = {
    calm: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="#60A5FA" opacity="0.2" />
        <circle cx="24" cy="24" r="18" stroke="#60A5FA" strokeWidth="2" />
        <circle cx="18" cy="21" r="2.5" fill="#60A5FA" />
        <circle cx="30" cy="21" r="2.5" fill="#60A5FA" />
        <path d="M17 28 Q24 33 31 28" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    anxious: (
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
        <text x="34" y="16" fill="#A78BFA" fontSize="12" opacity="0.7">z</text>
        <text x="37" y="12" fill="#A78BFA" fontSize="10" opacity="0.5">z</text>
      </svg>
    ),
  };

  const colors = {
    calm: 'from-blue-500/20 to-blue-600/10 border-blue-400/30',
    anxious: 'from-amber-500/20 to-amber-600/10 border-amber-400/30',
    overwhelmed: 'from-red-500/20 to-red-600/10 border-red-400/30',
    tired: 'from-purple-500/20 to-purple-600/10 border-purple-400/30',
  };

  const selectedColors = {
    calm: 'from-blue-500/40 to-blue-600/30 border-blue-400/60 shadow-lg shadow-blue-500/20',
    anxious: 'from-amber-500/40 to-amber-600/30 border-amber-400/60 shadow-lg shadow-amber-500/20',
    overwhelmed: 'from-red-500/40 to-red-600/30 border-red-400/60 shadow-lg shadow-red-500/20',
    tired: 'from-purple-500/40 to-purple-600/30 border-purple-400/60 shadow-lg shadow-purple-500/20',
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