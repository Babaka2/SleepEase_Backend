import { useState, useRef, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookMarked,
} from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import { translations, Language } from '../translations';

/* ---- General Reading Content ---- */
interface WellnessBook {
  id: string;
  title: string;
  author: string;
  icon: string;
  gradient: string;
  readTime: string;
  category: string;
  description: string;
  chapters: { title: string; content: string }[];
}

const wellnessBooks: WellnessBook[] = [
  {
    id: 'letting-go',
    title: 'The Art of Letting Go',
    author: 'Emma Sullivan',
    icon: '🌿',
    gradient: 'from-amber-500/20 to-orange-500/20',
    readTime: '20 min',
    category: 'Chapter 1 of 4',
    description: 'A gentle guide to releasing anxiety and finding peace through mindfulness and self-compassion.',
    chapters: [
      {
        title: 'Understanding Anxiety',
        content: `Anxiety is not your enemy — it's a signal. Like a smoke alarm, it alerts you to potential threats. But sometimes the alarm goes off when there's no fire.

The first step to letting go is understanding what you're holding onto. Many of us carry worries about the future, regrets about the past, and fears about things we cannot control.

Research shows that 85% of the things we worry about never actually happen. And of the 15% that do, 79% of people report they handled the situation better than expected.

Practice: Close your eyes. Take three deep breaths. Ask yourself: "What am I holding onto right now?" Don't judge the answer — simply observe it.

The goal isn't to stop feeling anxious. It's to change your relationship with anxiety. Instead of fighting it, acknowledge it: "I notice I'm feeling anxious. That's okay. This feeling will pass."

Remember: You are not your thoughts. You are the observer of your thoughts.`,
      },
      {
        title: 'The Power of Acceptance',
        content: `"Grant me the serenity to accept the things I cannot change, the courage to change the things I can, and the wisdom to know the difference."

Acceptance doesn't mean giving up. It means recognizing what is within your control and what isn't. When you stop fighting reality, you free up enormous energy for positive change.

The Acceptance Paradox: When you truly accept yourself as you are, change becomes easier, not harder. Self-criticism keeps us stuck. Self-compassion sets us free.

Try this exercise:
1. Think of something you've been resisting or fighting against
2. Say to yourself: "This is how things are right now"
3. Notice how your body responds — often there's a subtle relaxation
4. Ask: "What can I do from here?"

The Japanese concept of "Wabi-Sabi" teaches us to find beauty in imperfection. Your flaws are not failures — they're part of what makes you uniquely human.

When you accept the present moment fully, you stop creating additional suffering through resistance. Pain is inevitable; suffering is optional.`,
      },
      {
        title: 'Building Daily Calm',
        content: `Calm isn't something you find — it's something you build. Like a muscle, it grows stronger with daily practice.

Morning Routine for Calm:
• Wake up 10 minutes earlier than needed
• Before checking your phone, take 5 deep breaths
• Set one intention for the day (not a to-do, but a way of being)
• Example: "Today I choose patience" or "Today I choose kindness"

The 4-7-8 Breathing Technique:
1. Inhale quietly through your nose for 4 seconds
2. Hold your breath for 7 seconds
3. Exhale completely through your mouth for 8 seconds
4. Repeat 3-4 times

This technique activates your parasympathetic nervous system — your body's natural "calm down" response.

Evening Wind-Down:
• 30 minutes before bed, dim the lights
• Write down 3 things you're grateful for today
• Do a body scan: starting from your toes, progressively relax each muscle group
• End with the thought: "I did enough today. I am enough."

Consistency matters more than perfection. Even 5 minutes of daily practice creates lasting change.`,
      },
      {
        title: 'Letting Go of Perfectionism',
        content: `Perfectionism isn't about having high standards — it's about fear. Fear of failure, fear of judgment, fear of not being enough.

The perfectionist's trap: "If I can just get everything right, I'll finally feel okay." But the finish line keeps moving. Nothing is ever quite good enough.

Signs of perfectionism:
• All-or-nothing thinking ("If it's not perfect, it's worthless")
• Procrastination (not starting because you might fail)
• Difficulty celebrating achievements
• Harsh self-criticism
• Comparing yourself to others constantly

The antidote is "good enough." Not mediocrity — but the recognition that done is better than perfect, and progress is better than paralysis.

Practical steps:
1. Set a time limit for tasks (when time is up, submit/share/move on)
2. Celebrate effort, not just outcomes
3. Practice making small "mistakes" intentionally (send a text with a typo, leave one dish unwashed)
4. Replace "I should" with "I could"
5. Ask: "Will this matter in 5 years?"

Remember: The most beautiful things in life — a sunset, a child's laugh, a genuine friendship — are beautifully imperfect.`,
      },
    ],
  },
  {
    id: 'sleep-better',
    title: 'Sleep Better Tonight',
    author: 'Dr. James Chen',
    icon: '🌙',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    readTime: '15 min',
    category: 'Sleep Science',
    description: 'Science-backed strategies for quality sleep.',
    chapters: [
      {
        title: 'The Science of Sleep',
        content: `Sleep isn't just "turning off" — it's one of the most active and important processes your body performs.

During sleep, your brain consolidates memories, processes emotions, clears toxins, and repairs tissues. Missing even one hour of sleep can reduce cognitive performance by up to 32%.

The Sleep Architecture:
Your sleep cycles through stages roughly every 90 minutes:

Stage 1 (Light Sleep): The transition between wakefulness and sleep. Lasts 5-10 minutes.

Stage 2 (Deeper Sleep): Body temperature drops, heart rate slows. This is where you spend about 50% of your sleep time.

Stage 3 (Deep Sleep): The most restorative stage. Growth hormone is released, immune function is enhanced, and the brain clears waste products.

REM Sleep: Where most dreaming occurs. Critical for emotional regulation, creativity, and memory consolidation.

The key insight: It's not just about how long you sleep, but the quality and completeness of your sleep cycles. Waking up in the middle of deep sleep leaves you groggy, while waking at the end of a cycle feels natural and refreshing.

Aim for 7-9 hours, and try to wake up at the end of a 90-minute cycle.`,
      },
      {
        title: 'Your Sleep Environment',
        content: `Your bedroom should be a sleep sanctuary. Small changes to your environment can dramatically improve sleep quality.

Temperature: Keep your bedroom between 60-67°F (15-19°C). Your body needs to cool down to initiate sleep. A room that's too warm is one of the most common sleep disruptors.

Darkness: Even small amounts of light can suppress melatonin production. Use blackout curtains or a sleep mask. Cover LED lights on devices.

Sound: If you live in a noisy area, try white noise or nature sounds. These mask disruptive sounds and create a consistent auditory environment.

Your Bed: Use your bed only for sleep. This trains your brain to associate the bed with rest, not with scrolling, working, or worrying.

The 20-Minute Rule: If you can't fall asleep within 20 minutes, get up and do something calming in dim light (reading, gentle stretching). Return to bed when you feel sleepy. This prevents your brain from associating the bed with frustration.

Screen hygiene: Stop screens 30-60 minutes before bed. Blue light from devices suppresses melatonin by up to 50%. If you must use devices, enable night mode or wear blue-light blocking glasses.`,
      },
      {
        title: 'Building a Sleep Routine',
        content: `Your body loves predictability. A consistent sleep routine trains your internal clock and makes falling asleep easier over time.

The Ideal Evening Routine (adjust times to your schedule):

9:00 PM — Last screen time. Put devices in another room if possible.

9:15 PM — Light stretching or gentle yoga (5-10 minutes). Focus on releasing tension in your shoulders, neck, and jaw.

9:30 PM — Warm shower or bath. The subsequent cooling of your body temperature mimics the natural drop that occurs before sleep.

9:45 PM — Journal for 5 minutes. Write down tomorrow's top 3 priorities (this clears your mind of planning thoughts). Write 3 things you're grateful for today.

10:00 PM — Reading (physical book, not a screen). Even 10 minutes of reading reduces stress by 68%.

10:15 PM — Lights out. Practice the 4-7-8 breathing technique or a body scan meditation.

Important rules:
• Keep the same wake time every day — yes, even weekends
• Avoid caffeine after 2 PM
• Finish eating 2-3 hours before bed
• Limit alcohol — it may help you fall asleep but destroys sleep quality

The first week may feel challenging. By week two, your body begins to adapt. By week four, it becomes natural.`,
      },
    ],
  },
  {
    id: 'peaceful-mind',
    title: 'Peaceful Mind Daily',
    author: 'Sarah Williams',
    icon: '🧘‍♀️',
    gradient: 'from-purple-500/20 to-pink-500/20',
    readTime: '12 min',
    category: 'Mindfulness',
    description: 'Daily practices for a calmer mind.',
    chapters: [
      {
        title: 'What is Mindfulness?',
        content: `Mindfulness is the practice of paying attention to the present moment, on purpose, without judgment.

It sounds simple, but consider this: studies show that the average person spends 47% of their waking hours thinking about something other than what they're actually doing. We're physically present but mentally elsewhere.

Mindfulness isn't about emptying your mind. It's about noticing what's there without getting swept away by it.

Imagine sitting by a river. Your thoughts are leaves floating past. You don't need to grab each leaf. You don't need to stop the river. Just watch.

The benefits are backed by thousands of studies:
• Reduced anxiety and depression
• Lower blood pressure and stress hormones
• Improved focus and memory
• Better emotional regulation
• Enhanced immune function
• Greater life satisfaction

A simple start — the STOP technique:
S — Stop what you're doing
T — Take a breath
O — Observe your thoughts, feelings, and body sensations
P — Proceed with awareness

Try this right now. Stop reading for 10 seconds. Take one deep breath. Notice how your body feels. Then continue.

That's mindfulness. You just did it.`,
      },
      {
        title: '5-Minute Daily Practice',
        content: `You don't need an hour of meditation to benefit from mindfulness. Five minutes a day can change your brain.

The 5-Minute Morning Mindfulness:

Minute 1 — Arrival
Sit comfortably. Close your eyes. Feel the weight of your body. Notice the temperature of the air. You're here, right now.

Minute 2 — Breath Awareness
Focus on your breathing. Don't change it — just notice it. Feel the air entering your nostrils, filling your lungs, and leaving again. Cool in, warm out.

Minute 3 — Body Check
Scan from head to toe. Where do you feel tension? Where do you feel ease? Simply notice without trying to fix anything.

Minute 4 — Thoughts & Emotions
What's on your mind? What emotion is present? Label it gently: "I notice worry" or "I notice excitement." Labeling emotions reduces their intensity by up to 50%.

Minute 5 — Intention
Set one intention for today. Not a task — a quality. "Today I choose patience." "Today I choose curiosity." "Today I choose kindness — starting with myself."

Open your eyes. You're ready.

The key is consistency, not duration. Five minutes every day is more powerful than thirty minutes once a week.`,
      },
    ],
  },
  {
    id: 'gratitude',
    title: 'The Gratitude Journal',
    author: 'Michael Porter',
    icon: '✨',
    gradient: 'from-green-500/20 to-emerald-500/20',
    readTime: '10 min',
    category: 'Positive Psychology',
    description: 'Transform your life with gratitude.',
    chapters: [
      {
        title: 'Why Gratitude Works',
        content: `Gratitude is not just feeling thankful — it's a practice that physically rewires your brain for happiness.

Neuroscience research shows that regularly practicing gratitude:
• Increases dopamine and serotonin (the same neurotransmitters targeted by antidepressants)
• Activates the hypothalamus, which regulates stress
• Strengthens neural pathways associated with positive thinking
• Improves sleep quality by 25% (according to a study in Applied Psychology)

The negativity bias: Our brains evolved to focus on threats and problems. We naturally remember one criticism more vividly than ten compliments. Gratitude practice counterbalances this default setting.

Dr. Robert Emmons' research found that people who kept gratitude journals:
• Exercised more regularly
• Had fewer physical symptoms
• Felt better about their lives
• Were more optimistic about the future
• Made more progress toward personal goals

The practice is simple:
Write down 3 specific things you're grateful for each day. Not generic ("I'm grateful for my family") but specific ("I'm grateful for the way my friend listened to me today without judging").

Specificity is the key. It forces you to actually relive the positive experience, which amplifies its emotional impact.`,
      },
      {
        title: 'Daily Gratitude Exercises',
        content: `Beyond the basic journal, here are powerful gratitude exercises to deepen your practice:

The Gratitude Letter:
Think of someone who positively impacted your life but you never properly thanked. Write them a detailed letter explaining what they did and how it affected you. If possible, read it to them in person. Studies show this produces the single biggest happiness boost of any positive psychology intervention.

Mental Subtraction:
Instead of imagining adding good things to your life, imagine subtracting them. What would your life be like without your best friend? Without your health? Without your home? This contrast makes you vividly aware of what you have.

Gratitude Walk:
Take a 10-minute walk where you notice things to be grateful for. The warmth of sunlight. A tree providing shade. The ground beneath your feet. Your legs that carry you. Notice the small miracles you usually overlook.

The "What Went Well" Exercise:
Each evening, write down 3 things that went well today, and why they went well. This shifts your evening review from problems to positives.

Savoring:
When something good happens — even something small like a delicious meal or a beautiful sunset — pause and fully take it in. Extend the positive experience by 20-30 seconds. Tell someone about it. This doubles the emotional benefit.

Start with one exercise this week. Then add another next week. Gratitude is a skill. The more you practice, the stronger it becomes.`,
      },
    ],
  },
  {
    id: 'night-stories',
    title: 'Night Time Stories',
    author: 'Various Authors',
    icon: '📚',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    readTime: '8 min',
    category: 'Bedtime Reading',
    description: 'Calming tales for peaceful sleep.',
    chapters: [
      {
        title: 'The Lighthouse Keeper',
        content: `On a small island at the edge of the world, there lived an old lighthouse keeper named Thomas.

Every evening, as the sky turned from blue to amber to indigo, Thomas would climb the 147 steps of his lighthouse and light the great lamp.

The warm golden light would sweep across the dark water, a steady pulse of reassurance to ships passing in the night.

Thomas had been doing this for forty years. In all that time, he had never missed a single night. Not during storms, not during illness, not during the long winters when the wind howled so loudly that it seemed the sky itself was crying.

People from the town sometimes asked him, "Don't you get lonely out there?"

Thomas would smile and say, "How can I be lonely? Every night, I send out light. And somewhere out there, someone sees it and knows they are not alone. We are connected by that light, the ships and I."

One night, a terrible storm rolled in. The waves crashed against the rocks with fury. Thomas climbed his stairs as always, his old bones aching with each step.

As the lamp turned, he saw something — a tiny light, far out on the water. A ship, signaling back to him.

In that moment, Thomas understood something he had always felt but never put into words: every light we put out into the world comes back to us, eventually. Every act of caring, every steady presence, every choice to keep going even when it's hard — it all matters. It all connects us.

Thomas sat in his chair, watched the storm pass, and felt a deep, quiet peace.

The light kept turning. The ships kept passing. And all was well.`,
      },
      {
        title: 'The Garden of Rest',
        content: `There is a garden that exists at the edge of sleep. You can only find it when you stop looking for it.

Imagine walking down a gentle path lined with lavender. The air is warm and still. Each step you take is softer than the last, as if the ground itself is welcoming you.

The path curves past an old stone wall covered in climbing roses — soft pink and cream white, their petals catching the last light of day.

Beyond the wall, the garden opens up. There is a pond so still it mirrors the sky perfectly. A single willow tree bends over the water, its long branches creating a natural curtain of green.

Beneath the willow, there is a hammock. It gently sways in the faintest breeze.

You lie down in it. The hammock holds you like the hands of someone you trust completely.

Above you, through the willow leaves, stars are beginning to appear. First one, then three, then dozens. The sky fills with them, like tiny lanterns being lit one by one.

You hear the softest sounds: water trickling, leaves whispering, a distant owl asking its gentle question.

Your eyelids grow heavy. Your breathing slows. Each exhale releases something — a worry, a thought, a tension — until you are empty of everything except peace.

In this garden, nothing needs to be done. Nothing needs to be solved. Nothing needs to be fixed.

You are safe. You are held. You are enough.

The stars keep watch. The water keeps flowing. And sleep comes, as natural and welcome as morning light.`,
      },
    ],
  },
];

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
  const [selectedBook, setSelectedBook] = useState<WellnessBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  // Reading progress (localStorage)
  const getReadProgress = useCallback((bookId: string) => {
    try { return JSON.parse(localStorage.getItem(`general-read-${bookId}`) || '{}'); } catch { return {}; }
  }, []);
  const saveReadProgress = useCallback((bookId: string, chapter: number, done: boolean) => {
    const prev = getReadProgress(bookId);
    prev[chapter] = done;
    localStorage.setItem(`general-read-${bookId}`, JSON.stringify(prev));
  }, [getReadProgress]);
  const getBookProgress = useCallback((bookId: string, totalChapters: number) => {
    const prog = getReadProgress(bookId);
    const read = Object.values(prog).filter(Boolean).length;
    return Math.round((read / totalChapters) * 100);
  }, [getReadProgress]);

  const openBook = (book: WellnessBook, chapter = 0) => {
    setSelectedBook(book);
    setCurrentChapter(chapter);
  };
  const closeBook = () => {
    setSelectedBook(null);
    setCurrentChapter(0);
  };
  const markChapterDone = () => {
    if (!selectedBook) return;
    saveReadProgress(selectedBook.id, currentChapter, true);
  };
  const nextChapter = () => {
    if (!selectedBook) return;
    markChapterDone();
    if (currentChapter < selectedBook.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };
  const prevChapter = () => {
    if (currentChapter > 0) setCurrentChapter(currentChapter - 1);
  };

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
        {tab === 'reading' && !selectedBook && (
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
                <h3 className="text-white text-lg font-medium mb-1">{wellnessBooks[0].title}</h3>
                <p className="text-white/60 text-sm mb-3">by {wellnessBooks[0].author}</p>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">{wellnessBooks[0].description}</p>
                <div className="flex items-center gap-3 text-white/60 text-xs mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {wellnessBooks[0].readTime} read
                  </span>
                  <span>•</span>
                  <span>{wellnessBooks[0].category}</span>
                </div>
                {getBookProgress(wellnessBooks[0].id, wellnessBooks[0].chapters.length) > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                      <span>Progress</span>
                      <span>{getBookProgress(wellnessBooks[0].id, wellnessBooks[0].chapters.length)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400/60 rounded-full transition-all" style={{ width: `${getBookProgress(wellnessBooks[0].id, wellnessBooks[0].chapters.length)}%` }} />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => openBook(wellnessBooks[0])}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/30"
                >
                  {getBookProgress(wellnessBooks[0].id, wellnessBooks[0].chapters.length) > 0 ? 'Continue Reading' : 'Start Reading'}
                </button>
              </div>
            </div>

            {/* Recommended Books */}
            <div className="mb-6">
              <h3 className="text-white text-base font-medium mb-3">{t.contentReflection.recommended}</h3>
              <div className="space-y-3">
                {wellnessBooks.slice(1).map(book => (
                  <button
                    key={book.id}
                    onClick={() => openBook(book)}
                    className={`w-full rounded-2xl bg-gradient-to-br ${book.gradient} backdrop-blur-xl border border-white/20 p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex items-start gap-3 min-h-[110px]`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{book.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium mb-0.5">{book.title}</h4>
                      <p className="text-white/60 text-xs mb-1">{book.author}</p>
                      <p className="text-white/50 text-xs mb-2">{book.chapters.length} chapters</p>
                      {getBookProgress(book.id, book.chapters.length) > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400/60 rounded-full" style={{ width: `${getBookProgress(book.id, book.chapters.length)}%` }} />
                          </div>
                          <span className="text-white/50 text-xs">{getBookProgress(book.id, book.chapters.length)}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-white/60 text-xs mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{book.readTime} read</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Reader View */}
        {tab === 'reading' && selectedBook && (
          <div className="space-y-4">
            {/* Reader Header */}
            <div className="flex items-center gap-3 mb-2">
              <button onClick={closeBook} className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center active:scale-95">
                <ChevronLeft className="w-5 h-5 text-white/80" />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm font-medium truncate">{selectedBook.title}</h3>
                <p className="text-white/50 text-xs">Chapter {currentChapter + 1} of {selectedBook.chapters.length}</p>
              </div>
              <button
                onClick={markChapterDone}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all active:scale-95 ${
                  getReadProgress(selectedBook.id)[currentChapter]
                    ? 'bg-emerald-500/30 border border-emerald-400/30 text-emerald-300'
                    : 'bg-white/10 border border-white/20 text-white/70'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {getReadProgress(selectedBook.id)[currentChapter] ? 'Done' : 'Mark Done'}
              </button>
            </div>

            {/* Chapter Title */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 border border-blue-400/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookMarked className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">Chapter {currentChapter + 1}</span>
              </div>
              <h2 className="text-white text-lg font-medium">{selectedBook.chapters[currentChapter].title}</h2>
            </div>

            {/* Chapter Content */}
            <div className="rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 p-5">
              <div className="text-white/85 text-sm leading-relaxed whitespace-pre-line">
                {selectedBook.chapters[currentChapter].content}
              </div>
            </div>

            {/* Chapter Navigation */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={prevChapter}
                disabled={currentChapter === 0}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-95 ${
                  currentChapter === 0
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 border border-white/20 text-white/80'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={nextChapter}
                disabled={currentChapter >= selectedBook.chapters.length - 1}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-95 ${
                  currentChapter >= selectedBook.chapters.length - 1
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Chapter List */}
            <div className="rounded-2xl bg-white/8 border border-white/15 p-4">
              <h4 className="text-white/70 text-xs font-medium mb-3 uppercase tracking-wider">All Chapters</h4>
              <div className="space-y-2">
                {selectedBook.chapters.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentChapter(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                      i === currentChapter
                        ? 'bg-blue-500/20 border border-blue-400/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      getReadProgress(selectedBook.id)[i]
                        ? 'bg-emerald-500/30 text-emerald-400'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {getReadProgress(selectedBook.id)[i] ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-sm ${i === currentChapter ? 'text-white font-medium' : 'text-white/70'}`}>{ch.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
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