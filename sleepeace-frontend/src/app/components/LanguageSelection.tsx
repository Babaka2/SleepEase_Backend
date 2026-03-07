import { ArrowLeft, Check } from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import { Language, translations, languageNames, languageFlagEmojis } from '../translations';

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

type Mode = 'general' | 'islamic' | null;

interface LanguageSelectionProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  currentMode: 'general' | 'islamic';
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelection({ 
  navigate, 
  currentMode, 
  currentLanguage, 
  onLanguageChange 
}: LanguageSelectionProps) {
  const t = translations[currentLanguage].languageSelection;
  const isIslamic = currentMode === 'islamic';
  
  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文 (Chinese)' },
    { code: 'ar', label: 'العربية (Arabic)' },
    { code: 'ms', label: 'Bahasa Melayu (Malay)' },
  ];

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang);
    // Go back to settings after selecting
    setTimeout(() => {
      navigate(isIslamic ? 'settings-islamic' : 'settings');
    }, 300);
  };

  return (
    <PhoneFrame>
      {/* Background gradient */}
      <div className={`absolute inset-0 ${
        isIslamic 
          ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-900' 
          : 'bg-gradient-to-b from-slate-700 via-slate-800 to-blue-900'
      }`} />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-10 w-32 h-32 ${
          isIslamic ? 'bg-emerald-400/10' : 'bg-blue-400/10'
        } rounded-full blur-3xl`} />
        <div className={`absolute bottom-40 left-10 w-40 h-40 ${
          isIslamic ? 'bg-yellow-400/10' : 'bg-purple-400/10'
        } rounded-full blur-3xl`} />
      </div>

      {/* Content */}
      <div className="relative w-full h-full px-6 pt-14 pb-28 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate(isIslamic ? 'settings-islamic' : 'settings')}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className={`text-white text-2xl font-light ${currentLanguage === 'ar' ? 'text-right' : ''}`}>
              {t.title}
            </h1>
            <p className={`${
              isIslamic ? 'text-emerald-100/70' : 'text-white/60'
            } text-sm mt-0.5 ${currentLanguage === 'ar' ? 'text-right' : ''}`}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Language Options */}
        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full rounded-2xl ${
                currentLanguage === lang.code
                  ? isIslamic
                    ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border-emerald-400/40'
                    : 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-blue-400/40'
                  : 'bg-white/10 border-white/20'
              } backdrop-blur-xl border p-5 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95`}
            >
              {/* Flag Emoji */}
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {languageFlagEmojis[lang.code]}
              </div>
              
              {/* Language Name */}
              <div className="flex-1 text-left">
                <p className="text-white text-lg font-medium">{lang.label}</p>
                <p className={`${
                  isIslamic ? 'text-emerald-100/70' : 'text-white/60'
                } text-sm`}>
                  {languageNames[lang.code]}
                </p>
              </div>
              
              {/* Check Icon */}
              {currentLanguage === lang.code && (
                <div className={`w-8 h-8 rounded-full ${
                  isIslamic 
                    ? 'bg-emerald-500/40' 
                    : 'bg-blue-500/40'
                } flex items-center justify-center flex-shrink-0`}>
                  <Check className={`w-5 h-5 ${
                    isIslamic ? 'text-emerald-300' : 'text-blue-300'
                  }`} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info Card */}
        <div className={`mt-6 rounded-2xl ${
          isIslamic 
            ? 'bg-emerald-500/10 border-emerald-400/20' 
            : 'bg-blue-500/10 border-blue-400/20'
        } backdrop-blur-xl border p-4`}>
          <p className={`${
            isIslamic ? 'text-emerald-100/80' : 'text-white/70'
          } text-sm text-center ${currentLanguage === 'ar' ? 'text-right' : ''}`}>
            {currentLanguage === 'en' && '✨ Your language preference will be applied across the entire app'}
            {currentLanguage === 'zh' && '✨ 您的语言偏好将应用于整个应用程序'}
            {currentLanguage === 'ar' && '✨ سيتم تطبيق تفضيل اللغة الخاص بك على التطبيق بأكمله'}
            {currentLanguage === 'ms' && '✨ Pilihan bahasa anda akan digunakan di seluruh aplikasi'}
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
