import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import moonIcon from 'figma:asset/7fee26ba96080226bc7fb2a7c786391cf5ba227d.png';
import PhoneFrame from './components/PhoneFrame';
import GeneralModeHome from './components/GeneralModeHome';
import IslamicModeHome from './components/IslamicModeHome';
import GeneralLoginScreen from './components/GeneralLoginScreen';
import IslamicLoginScreen from './components/IslamicLoginScreen';
import GeneralSignupScreen from './components/GeneralSignupScreen';
import IslamicSignupScreen from './components/IslamicSignupScreen';
import MoodCheckIn from './components/MoodCheckIn';
import MoodCheckInIslamic from './components/MoodCheckInIslamic';
import ContentReflectionScreen from './components/ContentReflectionScreen';
import ContentReflectionScreenIslamic from './components/ContentReflectionScreenIslamic';
import AIChatSupportScreen from './components/AIChatSupportScreen';
import AIChatSupportScreenIslamic from './components/AIChatSupportScreenIslamic';
import MoodHistoryScreen from './components/MoodHistoryScreen';
import QiblaHistoryScreen from './components/QiblaHistoryScreen';
import SettingsModeSwitching from './components/SettingsModeSwitching';
import SettingsModeSwitchingIslamic from './components/SettingsModeSwitchingIslamic';
import LanguageSelection from './components/LanguageSelection';
import { Language, translations } from './translations';
import { auth } from '../lib/firebaseClient';
import { onAuthStateChanged, signOut } from 'firebase/auth';

type Mode = 'general' | 'islamic' | null;
type Screen =
  | 'mode-selection'
  | 'general-home'
  | 'islamic-home'
  | 'general-login'
  | 'islamic-login'
  | 'general-signup'
  | 'islamic-signup'
  | 'mood-check-general'
  | 'mood-check-islamic'
  | 'content-general'
  | 'content-islamic'
  | 'ai-chat'
  | 'ai-chat-islamic'
  | 'mood-history-general'
  | 'mood-history-islamic'
  | 'settings'
  | 'settings-islamic'
  | 'language-selection';

export interface UserInfo {
  name: string;
  email: string;
}

export default function App() {
  const [selectedMode, setSelectedMode] = useState<Mode>('general');
  const [currentScreen, setCurrentScreen] = useState<Screen>('mode-selection');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    console.log("Initializing Firebase auth listener...");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({
          name: user.displayName || user.email?.split('@')[0] || '',
          email: user.email || '',
        });
      } else {
        setUserInfo({ name: '', email: '' });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Navigation function that can be passed to all components
  const navigate = (screen: Screen, mode?: Mode) => {
    if (mode) setSelectedMode(mode);
    setCurrentScreen(screen);
  };

  // Function to update user info after signup
  const updateUserInfo = (info: UserInfo) => {
    setUserInfo(info);
  };

  // Function to log out user
  const handleLogout = async () => {
    await signOut(auth);
    setUserInfo({ name: '', email: '' });
    setSelectedMode(null);
    setCurrentScreen('mode-selection');
  };

  // Render appropriate screen
  if (currentScreen === 'general-home') {
    return <GeneralModeHome navigate={navigate} userInfo={userInfo} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'islamic-home') {
    return <IslamicModeHome navigate={navigate} userInfo={userInfo} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'general-login') {
    return <GeneralLoginScreen navigate={navigate} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'islamic-login') {
    return <IslamicLoginScreen navigate={navigate} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'general-signup') {
    return <GeneralSignupScreen navigate={navigate} updateUserInfo={updateUserInfo} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'islamic-signup') {
    return <IslamicSignupScreen navigate={navigate} updateUserInfo={updateUserInfo} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'mood-check-general') {
    return <MoodCheckIn navigate={navigate} currentLanguage={currentLanguage} userName={userInfo.name} />;
  } else if (currentScreen === 'mood-check-islamic') {
    return <MoodCheckInIslamic navigate={navigate} currentLanguage={currentLanguage} userInfo={userInfo} />;
  } else if (currentScreen === 'content-general') {
    return <ContentReflectionScreen navigate={navigate} currentLanguage={currentLanguage} userInfo={userInfo} />;
  } else if (currentScreen === 'content-islamic') {
    return <ContentReflectionScreenIslamic navigate={navigate} currentLanguage={currentLanguage} userInfo={userInfo} />;
  } else if (currentScreen === 'ai-chat') {
    return <AIChatSupportScreen navigate={navigate} currentLanguage={currentLanguage} userName={userInfo.name} />;
  } else if (currentScreen === 'ai-chat-islamic') {
    return <AIChatSupportScreenIslamic navigate={navigate} currentLanguage={currentLanguage} userName={userInfo.name} />;
  } else if (currentScreen === 'mood-history-general') {
    return <MoodHistoryScreen navigate={navigate} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'mood-history-islamic') {
    return <QiblaHistoryScreen navigate={navigate} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'settings') {
    return <SettingsModeSwitching navigate={navigate} currentMode={selectedMode as 'general' | 'islamic'} userInfo={userInfo} onLogout={handleLogout} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'settings-islamic') {
    return <SettingsModeSwitchingIslamic navigate={navigate} currentMode={selectedMode as 'general' | 'islamic'} userInfo={userInfo} onLogout={handleLogout} currentLanguage={currentLanguage} />;
  } else if (currentScreen === 'language-selection') {
    return <LanguageSelection navigate={navigate} currentMode={selectedMode as 'general' | 'islamic'} currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />;
  }

  // Get translations for mode selection
  const t = translations[currentLanguage].modeSelection;

  // Welcome screen - initial mode selection
  return (
    <PhoneFrame>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />

        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Soft glow effects */}
        <div className="absolute top-20 left-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-1/4 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 pb-12">
        {/* Logo/Brand area */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 border border-white/10 flex items-center justify-center backdrop-blur-sm">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4 L22 10 L16 16 L10 10 Z" fill="white" opacity="0.9" />
              <circle cx="16" cy="22" r="6" stroke="white" strokeWidth="2" opacity="0.9" fill="none" />
            </svg>
          </div>

          {/* Main Heading */}
          <h1 className="text-white text-3xl font-light mb-3">
            {t.title}
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-sm">
            {t.subtitle}
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          {/* General Mode Card */}
          <button
            onClick={() => setSelectedMode('general')}
            className={`relative h-44 rounded-3xl p-5 flex flex-col items-center justify-center transition-all duration-300 border-2 ${selectedMode === 'general'
              ? 'bg-white/15 border-white/40 shadow-lg shadow-blue-500/20'
              : 'bg-white/8 border-white/15 hover:bg-white/10'
              }`}
            style={{
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Icon with glow effect */}
            <div className={`mb-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${selectedMode === 'general'
              ? 'bg-gradient-to-br from-blue-400/30 to-purple-400/30 shadow-lg shadow-blue-400/30'
              : 'bg-white/10'
              }`}>
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="2" opacity="0.95" />
                <circle cx="18" cy="20" r="2" fill="white" opacity="0.95" />
                <circle cx="30" cy="20" r="2" fill="white" opacity="0.95" />
                <path d="M17 28 Q24 34 31 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" fill="none" />
              </svg>
            </div>

            <span className="text-white/90 text-sm font-medium mb-1">{t.generalMode}</span>
            <span className="text-white/40 text-[10px]">{t.generalDesc}</span>

            {/* Check Mark */}
            {selectedMode === 'general' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={3} />
              </div>
            )}

            {/* Subtle indicator dot */}
            {selectedMode === 'general' && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
            )}
          </button>

          {/* Islamic Mode Card */}
          <button
            onClick={() => setSelectedMode('islamic')}
            className={`relative h-44 rounded-3xl p-5 flex flex-col items-center justify-center transition-all duration-300 border-2 ${selectedMode === 'islamic'
              ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-yellow-300/60 shadow-lg shadow-emerald-500/20'
              : 'bg-gradient-to-br from-emerald-950/30 to-teal-950/30 border-yellow-400/20 hover:border-yellow-400/30'
              }`}
            style={{
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Icon with glow effect */}
            <div className={`mb-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${selectedMode === 'islamic'
              ? 'bg-yellow-300/25 shadow-lg shadow-yellow-400/30'
              : 'bg-yellow-400/10'
              }`}>
              {/* Custom Crescent Moon + Heart SVG */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                {/* Crescent Moon */}
                <path
                  d="M22 16c0-5.5-4.5-10-10-10 0 0 3 2 3 10s-3 10-3 10c5.5 0 10-4.5 10-10Z"
                  fill="#F5D36C"
                  opacity="0.95"
                />
                {/* Small Heart */}
                <path
                  d="M16 12.5s-1.5-.8-2.2-1.8c-.7-.9-.4-2 .4-2.5.6-.4 1.4-.3 1.8.2.4-.5 1.2-.6 1.8-.2.7.5.9 1.6.2 2.5-.7 1-2.2 1.8-2.2 1.8Z"
                  fill="#F5D36C"
                  opacity="0.95"
                />
                {/* Stars accent */}
                <circle cx="26" cy="10" r="1" fill="#F5D36C" opacity="0.7" />
                <circle cx="24" cy="6" r="0.8" fill="#F5D36C" opacity="0.6" />
              </svg>
            </div>

            <span className="text-white/90 text-sm font-medium mb-1">{t.islamicMode}</span>
            <span className="text-emerald-100/40 text-[10px]">{t.islamicDesc}</span>

            {/* Check Mark */}
            {selectedMode === 'islamic' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center shadow-lg">
                <Check className="w-3.5 h-3.5 text-emerald-800" strokeWidth={3} />
              </div>
            )}

            {/* Subtle indicator dot */}
            {selectedMode === 'islamic' && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-300/60" />
            )}
          </button>
        </div>

        {/* Continue Button */}
        <button
          className="w-full py-3.5 px-8 rounded-full text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: '#3A5F7D',
            boxShadow: '0 4px 20px rgba(58, 95, 125, 0.3)'
          }}
          onClick={() => navigate(selectedMode === 'general' ? 'general-login' : 'islamic-login')}
        >
          {t.continue}
        </button>

        {/* Footer hint */}
        <p className="mt-6 text-white/30 text-xs text-center">
          You can switch modes anytime in settings
        </p>
      </div>
    </PhoneFrame>
  );
}