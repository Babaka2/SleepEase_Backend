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
  Moon,
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

/* ---- Islamic Reading Content ---- */
interface IslamicBook {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  readTime: string;
  category: string;
  chapters: { title: string; content: string }[];
}

const islamicBooks: IslamicBook[] = [
  {
    id: 'fortress',
    title: 'Fortress of the Muslim',
    subtitle: 'Collection of Authentic Du\'as',
    icon: '📖',
    gradient: 'from-amber-500/20 to-orange-500/20',
    readTime: '15 min',
    category: 'Morning Du\'as',
    chapters: [
      {
        title: 'Morning Adhkar',
        content: `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ

"In the name of Allah, the Most Gracious, the Most Merciful."

أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ

"We have reached the morning and at this very time the whole kingdom belongs to Allah. All praise is for Allah."

لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ

"None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent."

Recite this du'a when you wake up in the morning. The Prophet ﷺ said: "Whoever says this in the morning has indeed been grateful for that day." (Abu Dawud)`,
      },
      {
        title: 'Evening Adhkar',
        content: `أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ

"We have reached the evening and at this very time the whole kingdom belongs to Allah. All praise is for Allah."

اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ

"O Allah, verily I have reached the evening and call on You to bear witness, and I call on the bearers of Your Throne."

اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ

"O Allah, what blessing I or any of Your creation have risen upon, is from You alone."

The Prophet ﷺ encouraged reciting these adhkar every evening for protection and blessings throughout the night.`,
      },
      {
        title: 'Before Sleep',
        content: `بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا

"In Your name O Allah, I die and I live."

اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ

"O Allah, protect me from Your punishment on the day You resurrect Your servants."

The Prophet ﷺ used to place his right hand under his cheek and say: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ" three times. (Abu Dawud)

It is also Sunnah to recite Surah Al-Mulk (67), Surah As-Sajdah (32), Ayat al-Kursi, and the last two verses of Surah Al-Baqarah before sleeping.`,
      },
      {
        title: 'Du\'as for Protection',
        content: `أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ

"I seek refuge in the perfect words of Allah from the evil of what He has created."

بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ

"In the name of Allah with whose name nothing in the earth or the heavens can cause harm."

حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ

"Allah is sufficient for me. There is no god but He. In Him I put my trust."

The Prophet ﷺ said: "Whoever says these words three times in the morning and evening, nothing will harm him." (Abu Dawud, At-Tirmidhi)`,
      },
    ],
  },
  {
    id: 'prophets',
    title: 'Stories of the Prophets',
    subtitle: 'Ibn Kathir',
    icon: '📚',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    readTime: '20 min',
    category: 'Islamic History',
    chapters: [
      {
        title: 'Prophet Adam (AS)',
        content: `Allah created Adam (AS) from clay and breathed His spirit into him. He was the first human being and the first prophet.

Allah said: "Indeed, I will make upon the earth a successive authority." (Al-Baqarah 2:30)

Allah taught Adam the names of all things and commanded the angels to prostrate before him. All the angels prostrated except Iblis (Satan), who refused out of arrogance.

Allah placed Adam and his wife Hawwa (Eve) in Paradise and told them: "Eat from wherever you will but do not approach this tree, lest you be among the wrongdoers." (Al-Baqarah 2:35)

Satan deceived them, causing their removal from Paradise. Adam repented sincerely and Allah accepted his repentance, saying: "Then Adam received from his Lord words, and He accepted his repentance." (Al-Baqarah 2:37)`,
      },
      {
        title: 'Prophet Nuh (AS)',
        content: `Prophet Nuh (Noah) was sent to his people who had turned to idol worship. He called them to worship Allah alone for 950 years.

"Indeed, We sent Nuh to his people, and he remained among them a thousand years minus fifty years." (Al-Ankabut 29:14)

Despite his tireless efforts, only a few believed. The disbelievers mocked him and his followers. Allah then commanded Nuh to build an ark.

"And construct the ship under Our observation and Our inspiration." (Hud 11:37)

When the flood came, Nuh called to his son to board the ship, but his son refused, saying he would take refuge on a mountain. The waves swept him away.

After the flood, the ark settled on Mount Judi, and a new chapter of humanity began with the believers who were saved.`,
      },
      {
        title: 'Prophet Ibrahim (AS)',
        content: `Prophet Ibrahim (Abraham) is known as Khalilullah — the Friend of Allah. He was born in a time of widespread idol worship.

As a young man, Ibrahim questioned the worship of idols. He observed the stars, moon, and sun, recognizing that none of them could be God as they all set and disappeared.

"Indeed, I have turned my face toward He who created the heavens and the earth, inclining toward truth, and I am not of those who associate others with Allah." (Al-An'am 6:79)

Ibrahim was tested with great trials — being thrown into a fire by his own people, being commanded to leave his wife Hajar and infant son Ismail in the barren desert of Makkah, and being commanded to sacrifice his son.

In each trial, Ibrahim demonstrated complete trust in Allah. The fire became cool and safe. Hajar found the well of Zamzam. And a ram was provided as a sacrifice in place of Ismail.`,
      },
    ],
  },
  {
    id: 'sealed-nectar',
    title: 'The Sealed Nectar',
    subtitle: 'Biography of Prophet ﷺ',
    icon: '🕌',
    gradient: 'from-emerald-500/20 to-green-500/20',
    readTime: '25 min',
    category: 'Seerah',
    chapters: [
      {
        title: 'Birth and Early Life',
        content: `Prophet Muhammad ﷺ was born in Makkah in the Year of the Elephant (570 CE), on a Monday in the month of Rabi ul-Awal.

His father Abdullah had passed away before his birth, and his mother Aminah entrusted him to a wet nurse, Halimah As-Sa'diyyah, as was the custom among the noble families of Quraysh.

During his time with Halimah in the desert, miraculous events occurred that foretold his future prophethood. He grew up known for his honesty and trustworthiness, earning the titles "As-Sadiq" (The Truthful) and "Al-Amin" (The Trustworthy).

His mother passed away when he was six years old, after which his grandfather Abdul-Muttalib took care of him. When his grandfather passed away two years later, his uncle Abu Talib raised him with great love and protection.

As a young man, Muhammad ﷺ worked as a shepherd and later as a merchant, gaining a reputation for integrity and wisdom throughout Makkah.`,
      },
      {
        title: 'The Revelation',
        content: `At the age of forty, while meditating in the Cave of Hira on Mount Nur, the Angel Jibreel (Gabriel) appeared to Muhammad ﷺ with the first revelation:

"Read! In the name of your Lord who created. Created man from a clinging substance. Read, and your Lord is the most Generous. Who taught by the pen. Taught man that which he knew not." (Al-'Alaq 96:1-5)

Trembling from the experience, he returned to his wife Khadijah who comforted him and said: "By Allah, Allah will never disgrace you. You keep good relations with your relatives, help the poor, serve your guests generously, and assist those afflicted by calamity."

Khadijah took him to her cousin Waraqah ibn Nawfal, a Christian scholar, who confirmed that the angel who came to Muhammad was the same one who had come to Prophet Musa (Moses).

Thus began the prophethood of Muhammad ﷺ, and with it, the final message of Islam to all of humanity.`,
      },
    ],
  },
  {
    id: 'tafsir',
    title: 'Understanding the Quran',
    subtitle: 'Quran Commentary',
    icon: '📖',
    gradient: 'from-purple-500/20 to-pink-500/20',
    readTime: '18 min',
    category: 'Tafsir',
    chapters: [
      {
        title: 'Surah Al-Fatiha',
        content: `Surah Al-Fatiha is the opening chapter of the Quran and is recited in every unit of prayer. The Prophet ﷺ said: "There is no prayer for the one who does not recite the Opening of the Book." (Bukhari & Muslim)

بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
"In the name of Allah, the Most Gracious, the Most Merciful."

الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
"All praise is due to Allah, Lord of all the worlds."

الرَّحْمَنِ الرَّحِيمِ
"The Most Gracious, the Most Merciful."

مَالِكِ يَوْمِ الدِّينِ
"Master of the Day of Judgment."

إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
"You alone we worship, and You alone we ask for help."

اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
"Guide us to the straight path."

This surah is a comprehensive du'a that encompasses praise of Allah, acknowledgment of His sovereignty, and a plea for guidance.`,
      },
      {
        title: 'Ayat al-Kursi (2:255)',
        content: `Ayat al-Kursi is considered the greatest verse of the Quran. The Prophet ﷺ said: "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing will prevent him from entering Paradise except death." (An-Nasa'i)

اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ

"Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence."

لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ

"Neither drowsiness overtakes Him nor sleep."

لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ

"To Him belongs whatever is in the heavens and whatever is on the earth."

This powerful verse affirms Allah's absolute sovereignty, knowledge, and power over all creation. It is a shield of protection when recited with sincerity and understanding.`,
      },
    ],
  },
  {
    id: 'gardens',
    title: 'Gardens of the Righteous',
    subtitle: 'Imam An-Nawawi',
    icon: '🌿',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    readTime: '12 min',
    category: 'Hadith',
    chapters: [
      {
        title: 'Sincerity and Intention',
        content: `عَنْ أَمِيرِ الْمُؤْمِنِينَ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ:

"Actions are judged by their intentions, and every person will be rewarded according to what they intended."
(Bukhari & Muslim)

This foundational hadith teaches that the value of any deed lies in the intention behind it. A person who migrates for the sake of Allah and His Messenger will be rewarded accordingly, but one who does so for worldly gain will only receive that.

The scholars have said that this hadith is one-third of Islam, as it addresses the condition of the heart — the most important aspect of worship.

Practical application: Before any act of worship or good deed, pause and renew your intention. Ask yourself: "Am I doing this for the sake of Allah?"`,
      },
      {
        title: 'Patience and Gratitude',
        content: `عَنْ أَبِي يَحْيَى صُهَيْبِ بْنِ سِنَانٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ:

"How wonderful is the affair of the believer, for his affairs are all good, and this applies to no one but the believer. If something good happens to him, he is thankful for it and that is good for him. If something bad happens to him, he bears it with patience and that is good for him."
(Muslim)

This beautiful hadith shows that a believer is in a win-win situation in all circumstances — either grateful in times of ease, or patient in times of hardship. Both states bring reward from Allah.

عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ:

"Look at those below you and do not look at those above you, for this is more likely to prevent you from belittling the blessings of Allah upon you."
(Bukhari & Muslim)`,
      },
    ],
  },
];

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
  const [selectedBook, setSelectedBook] = useState<IslamicBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  // Reading progress (localStorage)
  const getReadProgress = useCallback((bookId: string) => {
    try { return JSON.parse(localStorage.getItem(`islamic-read-${bookId}`) || '{}'); } catch { return {}; }
  }, []);
  const saveReadProgress = useCallback((bookId: string, chapter: number, done: boolean) => {
    const prev = getReadProgress(bookId);
    prev[chapter] = done;
    localStorage.setItem(`islamic-read-${bookId}`, JSON.stringify(prev));
  }, [getReadProgress]);
  const getBookProgress = useCallback((bookId: string, totalChapters: number) => {
    const prog = getReadProgress(bookId);
    const read = Object.values(prog).filter(Boolean).length;
    return Math.round((read / totalChapters) * 100);
  }, [getReadProgress]);

  const openBook = (book: IslamicBook, chapter = 0) => {
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
        {tab === 'reading' && !selectedBook && (
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
                <h3 className="text-white text-lg font-medium mb-1">{islamicBooks[0].title}</h3>
                <p className="text-emerald-100/70 text-sm mb-3">{islamicBooks[0].subtitle}</p>
                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  A beautiful collection of authentic supplications and remembrances from the Quran and Sunnah for daily life.
                </p>
                <div className="flex items-center gap-3 text-emerald-100/70 text-xs mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {islamicBooks[0].readTime} read
                  </span>
                  <span>•</span>
                  <span>{islamicBooks[0].category}</span>
                </div>
                {getBookProgress(islamicBooks[0].id, islamicBooks[0].chapters.length) > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-emerald-100/60 mb-1">
                      <span>Progress</span>
                      <span>{getBookProgress(islamicBooks[0].id, islamicBooks[0].chapters.length)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400/60 rounded-full transition-all" style={{ width: `${getBookProgress(islamicBooks[0].id, islamicBooks[0].chapters.length)}%` }} />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => openBook(islamicBooks[0])}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/30"
                >
                  {getBookProgress(islamicBooks[0].id, islamicBooks[0].chapters.length) > 0 ? 'Continue Reading' : 'Start Reading'}
                </button>
              </div>
            </div>

            {/* Recommended Books */}
            <div className="mb-6">
              <h3 className="text-white text-base font-medium mb-3">{t.contentReflectionIslamic.islamicLibrary}</h3>
              <div className="space-y-3">
                {islamicBooks.slice(1).map(book => (
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
                      <p className="text-emerald-100/70 text-xs mb-1">{book.subtitle}</p>
                      <p className="text-emerald-100/50 text-xs mb-2">{book.chapters.length} chapters</p>
                      {getBookProgress(book.id, book.chapters.length) > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400/60 rounded-full" style={{ width: `${getBookProgress(book.id, book.chapters.length)}%` }} />
                          </div>
                          <span className="text-emerald-100/50 text-xs">{getBookProgress(book.id, book.chapters.length)}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-emerald-100/70 text-xs mt-1">
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
                <p className="text-emerald-100/50 text-xs">Chapter {currentChapter + 1} of {selectedBook.chapters.length}</p>
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
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-400/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookMarked className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-medium">Chapter {currentChapter + 1}</span>
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
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
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
                        ? 'bg-emerald-500/20 border border-emerald-400/30'
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
