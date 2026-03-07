import {
  ChevronRight,
  Moon,
  User,
  Sun,
  Globe,
  Shield,
  FileText,
  Home,
  Compass,
  MessageCircle,
  Bell,
  Palette,
  Volume2,
  HelpCircle,
  Mail,
  Star,
  Award,
  Heart,
  LogOut,
  BookOpen,
  Smartphone,
  Calendar
} from 'lucide-react';
import PhoneFrame from './PhoneFrame';

type Mode = 'General Mode' | 'Islamic Mode';

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
  | 'settings-islamic'
  | 'language-selection';

interface SettingsModeSwitchingIslamicProps {
  navigate: (screen: Screen, mode?: 'general' | 'islamic' | null) => void;
  currentMode: 'general' | 'islamic';
  userInfo: { name: string; email: string };
  onLogout: () => void;
  currentLanguage: Language;
}

import { Language, translations } from '../translations';
import { updateUserMode } from '../../services/auth';

export default function SettingsModeSwitchingIslamic({ navigate, currentMode, userInfo, onLogout, currentLanguage }: SettingsModeSwitchingIslamicProps) {
  const t = translations[currentLanguage].settings;

  const handleModeSwitch = async () => {
    const newMode = currentMode === 'general' ? 'islamic' : 'general';
    try {
      await updateUserMode(newMode);
    } catch (e) {
      console.error('Mode update failed:', e);
    }
    navigate(newMode === 'general' ? 'general-home' : 'islamic-home', newMode);
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-light mb-1 flex items-center gap-2">
            <Moon className="w-6 h-6 text-yellow-300" />
            {t.title}
          </h1>
          <p className="text-emerald-100/70 text-sm">{t.subtitle}</p>
        </div>

        {/* Profile Card */}
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-emerald-400/20 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/40 to-teal-400/40 flex items-center justify-center">
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
            <div className="flex-1">
              <h3 className="text-white text-lg font-medium">{userInfo.name || translations[currentLanguage].islamicHome.guest}</h3>
              <p className="text-emerald-100/80 text-sm">{userInfo.email || 'No email'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-emerald-100/70 text-xs">{t.blessedMember}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </div>
        </div>

        {/* ISLAMIC SETTINGS */}
        <SectionLabel text={t.islamicSettingsTitle} />
        <div className="space-y-2 mb-6">
          {/* Prayer Times */}
          <SettingRow
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 9v11a2 2 0 002 2h14a2 2 0 002-2V9l-9-7z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" />
            </svg>}
            label={t.prayerTimes}
            subtitle={t.prayerTimesDesc}
            iconBg="from-emerald-500/30 to-teal-500/30"
          />

          {/* Qibla Direction */}
          <SettingRow
            icon={<Compass className="w-5 h-5" />}
            label={t.qiblaDirection}
            subtitle={t.qiblaDesc}
            iconBg="from-blue-500/30 to-cyan-500/30"
          />

          {/* Hijri Calendar */}
          <SettingRow
            icon={<Calendar className="w-5 h-5" />}
            label={t.hijriCalendar}
            subtitle={t.hijriDesc}
            iconBg="from-purple-500/30 to-indigo-500/30"
          />

          {/* Quran Reading */}
          <SettingRow
            icon={<BookOpen className="w-5 h-5" />}
            label={t.quranProgress}
            subtitle={t.quranDesc}
            iconBg="from-amber-500/30 to-yellow-500/30"
          />
        </div>

        {/* PREFERENCES */}
        <SectionLabel text={t.preferences} />
        <div className="space-y-2 mb-6">
          {/* App Mode */}
          <SettingRow
            icon={<Sun className="w-5 h-5" />}
            label={t.appMode}
            subtitle={currentMode === 'general' ? t.generalMode : t.islamicMode}
            iconBg="from-orange-500/30 to-amber-500/30"
            onClick={handleModeSwitch}
          />

          {/* Notifications */}
          <SettingRow
            icon={<Bell className="w-5 h-5" />}
            label={t.notifications}
            subtitle={t.prayerReminders}
            iconBg="from-emerald-500/30 to-green-500/30"
            badge="On"
          />

          {/* Theme */}
          <SettingRow
            icon={<Palette className="w-5 h-5" />}
            label={t.theme}
            subtitle={t.islamicMode}
            iconBg="from-teal-500/30 to-cyan-500/30"
          />

          {/* Sound */}
          <SettingRow
            icon={<Volume2 className="w-5 h-5" />}
            label={t.sound}
            subtitle={t.makkahAdhan}
            iconBg="from-blue-500/30 to-indigo-500/30"
          />

          {/* Language */}
          <SettingRow
            icon={<Globe className="w-5 h-5" />}
            label={t.language}
            subtitle={currentLanguage === 'en' ? 'English' : currentLanguage === 'zh' ? '中文' : currentLanguage === 'ar' ? 'العربية' : 'Bahasa Melayu'}
            iconBg="from-purple-500/30 to-pink-500/30"
            onClick={() => navigate('language-selection')}
          />
        </div>

        {/* ACCOUNT */}
        <SectionLabel text={t.account} />
        <div className="space-y-2 mb-6">
          <SettingRow
            icon={<User className="w-5 h-5" />}
            label={t.manageAccount}
            subtitle={t.personalInfo}
            iconBg="from-slate-500/30 to-gray-500/30"
          />

          <SettingRow
            icon={<Award className="w-5 h-5" />}
            label={t.spiritualMilestones}
            subtitle={t.achievementsDesc}
            iconBg="from-yellow-500/30 to-amber-500/30"
          />

          <SettingRow
            icon={<Heart className="w-5 h-5" />}
            label={t.savedDuas}
            subtitle={t.favoritesDesc}
            iconBg="from-red-500/30 to-rose-500/30"
          />
        </div>

        {/* SUPPORT */}
        <SectionLabel text={t.support} />
        <div className="space-y-2 mb-6">
          <SettingRow
            icon={<HelpCircle className="w-5 h-5" />}
            label={t.helpCenter}
            subtitle={t.helpCenterDesc}
            iconBg="from-cyan-500/30 to-teal-500/30"
          />

          <SettingRow
            icon={<Mail className="w-5 h-5" />}
            label={t.contactSupport}
            subtitle={t.contactDesc}
            iconBg="from-blue-500/30 to-indigo-500/30"
          />
        </div>

        {/* LEGAL */}
        <SectionLabel text={t.legal} />
        <div className="space-y-2 mb-6">
          <SettingRow
            icon={<Shield className="w-5 h-5" />}
            label={t.privacyPolicy}
            subtitle={t.yourDataSafe}
            iconBg="from-green-500/30 to-emerald-500/30"
          />

          <SettingRow
            icon={<FileText className="w-5 h-5" />}
            label={t.termsOfService}
            subtitle={t.usageAgreement}
            iconBg="from-slate-500/30 to-gray-500/30"
          />
        </div>

        {/* ABOUT */}
        <SectionLabel text={t.about} />
        <div className="space-y-2 mb-6">
          <SettingRow
            icon={<Smartphone className="w-5 h-5" />}
            label={t.appVersion}
            subtitle={t.appVersionDesc}
            iconBg="from-purple-500/30 to-indigo-500/30"
            hideArrow
          />
        </div>

        {/* Log Out Button */}
        <button className="w-full mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-xl border border-red-400/20 px-5 py-4 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95" onClick={onLogout}>
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-white font-medium">{t.logOut}</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute left-0 right-0 bottom-5 px-10">
        <div className="w-full rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 px-4 py-3 flex justify-between items-center">
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('islamic-home')}>
            <Home className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{translations[currentLanguage].islamicHome.home}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('mood-history-islamic')}>
            <Compass className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{translations[currentLanguage].islamicHome.qibla}</span>
          </button>
          <button className="flex flex-col items-center gap-1" onClick={() => navigate('ai-chat-islamic')}>
            <MessageCircle className="w-5 h-5 text-white/60" />
            <span className="text-[10px] text-white/55">{translations[currentLanguage].islamicHome.ai}</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <User className="w-5 h-5 text-white" />
            <span className="text-[10px] text-white/85">{translations[currentLanguage].islamicHome.profile}</span>
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------- Components ---------- */

function SectionLabel({ text }: { text: string }) {
  return <p className="text-emerald-100/50 text-xs tracking-widest mb-3 mt-2">{text}</p>;
}

function SettingRow({
  icon,
  label,
  subtitle,
  iconBg,
  badge,
  hideArrow = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  iconBg: string;
  badge?: string;
  hideArrow?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className="w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex items-center gap-3 transition-all hover:bg-white/15 active:scale-95"
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white flex-shrink-0`}>
        {icon}
      </div>

      <div className="flex-1 text-left min-w-0">
        <p className="text-white text-sm font-medium">{label}</p>
        {subtitle && <p className="text-emerald-100/70 text-xs mt-0.5">{subtitle}</p>}
      </div>

      {badge && (
        <div className="px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/30">
          <span className="text-emerald-200 text-xs font-medium">{badge}</span>
        </div>
      )}

      {!hideArrow && <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />}
    </button>
  );
}