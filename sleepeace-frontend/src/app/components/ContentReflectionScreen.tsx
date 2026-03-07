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

// Free relaxing audio URLs (royalty-free ambient sounds)
const audioTracks = [
  {
    id: 1,
    title: "Calm Night Breathing",
    subtitle: "Guided Meditation",
    icon: "✨",
    duration: "10 min",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    id: 2,
    title: "Ocean Waves",
    subtitle: "Nature Sounds",
    icon: "🌊",
    duration: "15 min",
    url: "https://cdn.pixabay.com/audio/2022/08/23/audio_3b6c45caf8.mp3",
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  {
    id: 3,
    title: "Forest Rain",
    subtitle: "Ambient Sounds",
    icon: "🌲",
    duration: "20 min",
    url: "https://cdn.pixabay.com/audio/2022/10/30/audio_a1f8a6d4f5.mp3",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: 4,
    title: "Peaceful Piano",
    subtitle: "Relaxing Music",
    icon: "🎹",
    duration: "12 min",
    url: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
    gradient: "from-orange-500/20 to-amber-500/20"
  },
  {
    id: 5,
    title: "Deep Sleep",
    subtitle: "Sleep Music",
    icon: "🌙",
    duration: "30 min",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_1d2cb38b8f.mp3",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    id: 6,
    title: "Gentle Ambient",
    subtitle: "Background Calm",
    icon: "💫",
    duration: "25 min",
    url: "https://cdn.pixabay.com/audio/2021/11/25/audio_cb4a944083.mp3",
    gradient: "from-indigo-500/20 to-blue-500/20"
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
  | 'settings';

type Mode = 'general' | 'islamic' | null;

interface UserInfo {
  name: string;
  email: string;
}

interface ContentReflectionScreenProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  currentLanguage: Language;
  userInfo: UserInfo;
}

export default function ContentReflectionScreen({ navigate, currentLanguage, userInfo }: ContentReflectionScreenProps) {
  const t = translations[currentLanguage];
  const [tab, setTab] = useState<'audio' | 'reading'>('audio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = audioTracks[currentTrackIndex];

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
    const nextIndex = (currentTrackIndex + 1) % audioTracks.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Skip to previous track
  const prevTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? audioTracks.length - 1 : currentTrackIndex - 1;
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
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-blue-900" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Scrollable Content */}
      <div className="relative w-full h-full px-6 pt-14 pb-28 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate('mood-check-general')}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-white/90 text-sm font-medium">{t.contentReflection.title}</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-light">{t.contentReflection.greeting.replace('Sarah', userInfo.name)}</h1>
          <p className="text-white/60 text-sm mt-2">
            {t.contentReflection.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-1 flex">
          <button
            onClick={() => setTab('audio')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all
              ${tab === 'audio'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/60'
              }`}
          >
            <Headphones className="w-4 h-4" />
            <span className="text-sm font-medium">{t.contentReflection.audio}</span>
          </button>
          <button
            onClick={() => setTab('reading')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all
              ${tab === 'reading'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/60'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">{t.contentReflection.reading}</span>
          </button>
        </div>

        {/* Audio Tab Content */}
        {tab === 'audio' && (
          <>
            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={currentTrack.url} preload="metadata" />

            {/* Featured Card - Now Playing */}
            <div className={`mb-6 rounded-3xl bg-gradient-to-br ${currentTrack.gradient} backdrop-blur-xl border border-white/20 overflow-hidden`}>
              {/* Cover Image Area */}
              <div className="h-48 bg-gradient-to-br from-blue-400/30 to-purple-400/30 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-3 mx-auto text-4xl">
                    {currentTrack.icon}
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    {isPlaying ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Heart className="w-3 h-3" />}
                    {isPlaying ? 'Now Playing' : t.contentReflection.recommended}
                  </span>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-5">
                <h3 className="text-white text-lg font-medium mb-1">
                  {currentTrack.title}
                </h3>
                <p className="text-white/60 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {currentTrack.duration} • {currentTrack.subtitle}
                </p>

                {/* Player Controls */}
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
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
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
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
              <h3 className="text-white text-base font-medium mb-3">{t.contentReflection.moreForYou}</h3>
              <div className="grid grid-cols-2 gap-3">
                {audioTracks.filter((_, i) => i !== currentTrackIndex).slice(0, 4).map((track, idx) => {
                  const originalIndex = audioTracks.findIndex(t => t.id === track.id);
                  return (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(originalIndex)}
                      className={`cursor-pointer rounded-2xl bg-gradient-to-br ${track.gradient} backdrop-blur-xl border border-white/20 p-4 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      <div className="text-3xl mb-2">{track.icon}</div>
                      <h4 className="text-white text-sm font-medium mb-0.5">{track.title}</h4>
                      <p className="text-white/60 text-xs">{track.subtitle}</p>
                      <p className="text-white/40 text-xs mt-1">{track.duration}</p>
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
            <div className="mb-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-white/20 overflow-hidden">
              {/* Book Cover */}
              <div className="h-56 bg-gradient-to-br from-amber-400/30 to-orange-400/30 relative flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="relative w-full max-w-[140px]">
                  <div className="aspect-[2/3] rounded-xl bg-gradient-to-br from-amber-300/40 to-orange-300/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl flex items-center justify-center p-4">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 text-white/90 mx-auto mb-2" />
                      <div className="w-16 h-0.5 bg-white/60 mx-auto mb-2" />
                      <div className="w-12 h-0.5 bg-white/40 mx-auto" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {t.contentReflection.recommended}
                  </span>
                </div>
              </div>

              {/* Book Info */}
              <div className="p-5">
                <h3 className="text-white text-lg font-medium mb-1">
                  The Art of Letting Go
                </h3>
                <p className="text-white/60 text-sm mb-3">
                  by Emma Sullivan
                </p>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  A gentle guide to releasing anxiety and finding peace through mindfulness and self-compassion.
                </p>
                <div className="flex items-center gap-3 text-white/60 text-xs mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    20 min read
                  </span>
                  <span>•</span>
                  <span>Chapter 1 of 8</span>
                </div>
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/30">
                  Start Reading
                </button>
              </div>
            </div>

            {/* Recommended Books */}
            <div className="mb-6">
              <h3 className="text-white text-base font-medium mb-3">{t.contentReflection.recommended}</h3>
              <div className="space-y-3">
                <BookCard
                  title="Sleep Better Tonight"
                  author="Dr. James Chen"
                  description="Science-backed strategies for quality sleep"
                  readTime="15 min"
                  gradient="from-blue-500/20 to-indigo-500/20"
                  icon="🌙"
                />
                <BookCard
                  title="Peaceful Mind Daily"
                  author="Sarah Williams"
                  description="Daily practices for a calmer mind"
                  readTime="12 min"
                  gradient="from-purple-500/20 to-pink-500/20"
                  icon="🧘‍♀️"
                />
                <BookCard
                  title="The Gratitude Journal"
                  author="Michael Porter"
                  description="Transform your life with gratitude"
                  readTime="10 min"
                  gradient="from-green-500/20 to-emerald-500/20"
                  icon="✨"
                />
                <BookCard
                  title="Night Time Stories"
                  author="Various Authors"
                  description="Calming tales for peaceful sleep"
                  readTime="8 min"
                  gradient="from-cyan-500/20 to-teal-500/20"
                  icon="📚"
                />
              </div>
            </div>
          </>
        )}

        {/* AI Support Card */}
        <button
          onClick={() => navigate('ai-chat')}
          className="w-full mb-6 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 p-5 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/30 to-purple-400/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-medium">{t.contentReflection.needSupport}</p>
            <p className="text-white/60 text-xs mt-0.5">{t.contentReflection.chatWithAI}</p>
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
        <div className="w-full rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-3 flex justify-between items-center">
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('general-home')}>
            <Home className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{t.generalHome.home}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('mood-history-general')}>
            <Compass className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{t.generalHome.explore}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('ai-chat')}>
            <MessageCircle className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{t.generalHome.ai}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('settings')}>
            <User className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/60">{t.generalHome.profile}</span>
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
      <p className="text-white/60 text-xs mb-2">{subtitle}</p>
      <div className="flex items-center gap-1 text-white/50 text-xs">
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
        <p className="text-white/60 text-xs mb-2">{author}</p>
        <p className="text-white/70 text-xs mb-2 leading-relaxed line-clamp-2">{description}</p>
        <div className="flex items-center gap-1 text-white/60 text-xs">
          <Clock className="w-3 h-3" />
          <span>{readTime} read</span>
        </div>
      </div>
    </button>
  );
}