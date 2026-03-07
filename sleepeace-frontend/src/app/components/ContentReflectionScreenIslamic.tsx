import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Compass,
  User,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Moon,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  Headphones,
  BookOpen,
  Heart,
  Clock,
} from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import { translations, Language } from '../translations';

// Islamic audio tracks - Quran recitations from public CDN
const islamicAudioTracks = [
  {
    id: 1,
    title: "Surah Al-Mulk",
    subtitle: "The Sovereignty",
    icon: "📖",
    duration: "12 min",
    url: "https://server8.mp3quran.net/afs/067.mp3",
    gradient: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: 2,
    title: "Surah Ar-Rahman",
    subtitle: "The Most Merciful",
    icon: "💚",
    duration: "13 min",
    url: "https://server8.mp3quran.net/afs/055.mp3",
    gradient: "from-amber-500/20 to-yellow-500/20"
  },
  {
    id: 3,
    title: "Surah Yasin",
    subtitle: "The Heart of Quran",
    icon: "❤️",
    duration: "15 min",
    url: "https://server8.mp3quran.net/afs/036.mp3",
    gradient: "from-red-500/20 to-pink-500/20"
  },
  {
    id: 4,
    title: "Surah Al-Kahf",
    subtitle: "The Cave",
    icon: "🕌",
    duration: "25 min",
    url: "https://server8.mp3quran.net/afs/018.mp3",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: 5,
    title: "Surah Al-Waqiah",
    subtitle: "The Event",
    icon: "✨",
    duration: "10 min",
    url: "https://server8.mp3quran.net/afs/056.mp3",
    gradient: "from-purple-500/20 to-indigo-500/20"
  },
  {
    id: 6,
    title: "Surah Al-Baqarah",
    subtitle: "The Cow",
    icon: "📿",
    duration: "2 hrs",
    url: "https://server8.mp3quran.net/afs/002.mp3",
    gradient: "from-teal-500/20 to-green-500/20"
  },
  {
    id: 7,
    title: "Ayat Al-Kursi",
    subtitle: "Verse of the Throne",
    icon: "👑",
    duration: "2 min",
    url: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3",
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
  {
    id: 8,
    title: "Last 10 Surahs",
    subtitle: "Short Surahs",
    icon: "🌙",
    duration: "8 min",
    url: "https://server8.mp3quran.net/afs/105.mp3",
    gradient: "from-indigo-500/20 to-violet-500/20"
  }
];

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

interface ContentReflectionScreenIslamicProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  currentLanguage: Language;
  userInfo: UserInfo;
}

export default function ContentReflectionScreenIslamic({ navigate, currentLanguage, userInfo }: ContentReflectionScreenIslamicProps) {
  const t = translations[currentLanguage];
  const [tab, setTab] = useState<'audio' | 'reading'>('audio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = islamicAudioTracks[currentTrackIndex];

  // Update time as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setTotalDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  // Play/Pause toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Skip to next track
  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % islamicAudioTracks.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Skip to previous track
  const prevTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? islamicAudioTracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Select a specific track
  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    setCurrentTime(0);
    // Auto-play after selection
    setTimeout(() => {
      audioRef.current?.play();
      setIsPlaying(true);
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

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
        <div className="flex items-center justify-between mb-6">
          <button
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate('mood-check-islamic')}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-white/90 text-sm font-medium">{t.contentReflectionIslamic.title}</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-light">{t.contentReflectionIslamic.greeting.replace('Sarah', userInfo.name)}</h1>
          <p className="text-emerald-100/70 text-sm mt-2">
            {t.contentReflectionIslamic.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-1 flex">
          <button
            onClick={() => setTab('audio')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all
              ${tab === 'audio'
                ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-white shadow-lg'
                : 'text-white/60'
              }`}
          >
            <Headphones className="w-4 h-4" />
            <span className="text-sm font-medium">{t.contentReflectionIslamic.audio}</span>
          </button>
          <button
            onClick={() => setTab('reading')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all
              ${tab === 'reading'
                ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-white shadow-lg'
                : 'text-white/60'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">{t.contentReflectionIslamic.reading}</span>
          </button>
        </div>

        {/* Audio Tab Content */}
        {tab === 'audio' && (
          <>
            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={currentTrack.url} preload="metadata" />

            {/* Featured Card - Now Playing */}
            <div className={`mb-6 rounded-3xl bg-gradient-to-br ${currentTrack.gradient} backdrop-blur-xl border border-emerald-400/20 overflow-hidden`}>
              {/* Cover Image Area */}
              <div className="h-48 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-3 mx-auto text-4xl">
                    {currentTrack.icon}
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    {isPlaying ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Heart className="w-3 h-3" />}
                    {isPlaying ? 'Now Playing' : t.contentReflectionIslamic.recommended}
                  </span>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-5">
                <h3 className="text-white text-lg font-medium mb-1">
                  {currentTrack.title}
                </h3>
                <p className="text-emerald-100/70 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {currentTrack.duration} • {currentTrack.subtitle}
                </p>

                {/* Player Controls */}
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-100/70">
                      <span>{formatTime(currentTime)}</span>
                      <span>{totalDuration > 0 ? formatTime(totalDuration) : '--:--'}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={prevTrack}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
                    >
                      <SkipBack className="w-4 h-4 text-white/80" />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 text-white" fill="white" />
                      ) : (
                        <Play className="w-7 h-7 text-white ml-1" fill="white" />
                      )}
                    </button>

                    <button
                      onClick={nextTrack}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
                    >
                      <SkipForward className="w-4 h-4 text-white/80" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* More Content Section */}
            <div className="mb-6">
              <h3 className="text-white text-base font-medium mb-3">{t.contentReflectionIslamic.moreForYou}</h3>
              <div className="grid grid-cols-2 gap-3">
                {islamicAudioTracks.filter((_, i) => i !== currentTrackIndex).slice(0, 4).map((track) => {
                  const originalIndex = islamicAudioTracks.findIndex(t => t.id === track.id);
                  return (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(originalIndex)}
                      className={`cursor-pointer rounded-2xl bg-gradient-to-br ${track.gradient} backdrop-blur-xl border border-white/20 p-4 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      <div className="text-3xl mb-2">{track.icon}</div>
                      <h4 className="text-white text-sm font-medium mb-0.5">{track.title}</h4>
                      <p className="text-emerald-100/60 text-xs">{track.subtitle}</p>
                      <p className="text-emerald-100/40 text-xs mt-1">{track.duration}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Reading Tab Content */}
        {tab === 'reading' && (
          <>
            {/* Featured Book */}
            <div className="mb-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-400/20 overflow-hidden">
              {/* Book Cover */}
              <div className="h-56 bg-gradient-to-br from-amber-400/30 to-orange-400/30 relative flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="relative w-full max-w-[140px]">
                  <div className="aspect-[2/3] rounded-xl bg-gradient-to-br from-emerald-400/40 to-teal-400/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl flex items-center justify-center p-4">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 text-white/90 mx-auto mb-2" />
                      <div className="w-16 h-0.5 bg-white/60 mx-auto mb-2" />
                      <div className="w-12 h-0.5 bg-white/40 mx-auto" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {t.contentReflectionIslamic.recommended}
                  </span>
                </div>
              </div>

              {/* Book Info */}
              <div className="p-5">
                <h3 className="text-white text-lg font-medium mb-1">
                  Fortress of the Muslim
                </h3>
                <p className="text-emerald-100/70 text-sm mb-3">
                  Collection of Authentic Du'as
                </p>
                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  A beautiful collection of authentic supplications and remembrances from the Quran and Sunnah for daily life.
                </p>
                <div className="flex items-center gap-3 text-emerald-100/70 text-xs mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    15 min read
                  </span>
                  <span>•</span>
                  <span>Morning Du'as</span>
                </div>
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/30">
                  Start Reading
                </button>
              </div>
            </div>

            {/* Recommended Books */}
            <div className="mb-6">
              <h3 className="text-white text-base font-medium mb-3">{t.contentReflectionIslamic.islamicLibrary}</h3>
              <div className="space-y-3">
                <BookCard
                  title="Stories of the Prophets"
                  author="Ibn Kathir"
                  description="Learn from the lives of the prophets"
                  readTime="20 min"
                  gradient="from-blue-500/20 to-indigo-500/20"
                  icon="📚"
                />
                <BookCard
                  title="The Sealed Nectar"
                  author="Biography of Prophet ﷺ"
                  description="Complete life story of the Prophet"
                  readTime="25 min"
                  gradient="from-emerald-500/20 to-green-500/20"
                  icon="🕌"
                />
                <BookCard
                  title="Tafsir Al-Jalalayn"
                  author="Quran Commentary"
                  description="Understanding the meaning of Quran"
                  readTime="18 min"
                  gradient="from-purple-500/20 to-pink-500/20"
                  icon="📖"
                />
                <BookCard
                  title="Gardens of the Righteous"
                  author="Imam An-Nawawi"
                  description="Hadith collection for daily guidance"
                  readTime="12 min"
                  gradient="from-cyan-500/20 to-teal-500/20"
                  icon="🌿"
                />
              </div>
            </div>
          </>
        )}

        {/* AI Support Card */}
        <button
          onClick={() => navigate('ai-chat-islamic')}
          className="w-full mb-6 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 p-5 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/30 to-teal-400/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-medium">{t.contentReflectionIslamic.needGuidance}</p>
            <p className="text-emerald-100/70 text-xs mt-0.5">{t.contentReflectionIslamic.chatWithAI}</p>
          </div>
          <div className="text-white/40">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
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

function ContentCard({
  title,
  subtitle,
  icon,
  duration,
  gradient,
}: {
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  gradient: string;
}) {
  return (
    <button className={`rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 p-4 text-left transition-all hover:scale-105 active:scale-95`}>
      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <h4 className="text-white text-sm font-medium mb-0.5">{title}</h4>
      <p className="text-emerald-100/70 text-xs mb-2">{subtitle}</p>
      <div className="flex items-center gap-1 text-emerald-100/60 text-xs">
        <Clock className="w-3 h-3" />
        <span>{duration}</span>
      </div>
    </button>
  );
}

function BookCard({
  title,
  author,
  description,
  readTime,
  gradient,
  icon,
}: {
  title: string;
  author: string;
  description: string;
  readTime: string;
  gradient: string;
  icon: string;
}) {
  return (
    <button className={`rounded-2xl bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 p-4 text-left transition-all hover:scale-105 active:scale-95 flex items-start gap-3 min-h-[110px]`}>
      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium mb-0.5">{title}</h4>
        <p className="text-emerald-100/70 text-xs mb-2">{author}</p>
        <p className="text-white/80 text-xs mb-2 leading-relaxed line-clamp-2">{description}</p>
        <div className="flex items-center gap-1 text-emerald-100/70 text-xs">
          <Clock className="w-3 h-3" />
          <span>{readTime} read</span>
        </div>
      </div>
    </button>
  );
}
