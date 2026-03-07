import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import PhoneFrame from './PhoneFrame';
import { Language, translations } from '../translations';
import { signUp, signInWithGoogle } from '../../services/auth';

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
  | 'settings-islamic';

type Mode = 'general' | 'islamic' | null;

interface IslamicSignupScreenProps {
  navigate: (screen: Screen, mode?: Mode) => void;
  updateUserInfo: (info: { name: string; email: string }) => void;
  currentLanguage: Language;
}

export default function IslamicSignupScreen({ navigate, updateUserInfo, currentLanguage }: IslamicSignupScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const t = translations[currentLanguage].signup;

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const { user } = await signInWithGoogle();
      updateUserInfo({ name: user.displayName || '', email: user.email || '' });
      navigate('islamic-home', 'islamic');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await signUp(email, password, name, 'Islamic');
      updateUserInfo({ name, email });
      navigate('islamic-home', 'islamic');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Content */}
      <div className="relative w-full h-full flex flex-col px-6 pt-14 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all hover:bg-white/15 active:scale-95"
            onClick={() => navigate('islamic-login')}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>

          <div className="flex-1">
            <h1 className="text-white text-xl font-medium">{t.createAccount}</h1>
            <p className="text-emerald-100/70 text-xs">{t.subtitle}</p>
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-yellow-300/30 backdrop-blur-xl flex items-center justify-center mb-3">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <path
                d="M35 24c-2 1.2-4.3 1.8-6.8 1.8-7.3 0-13.2-6-13.2-13.2 0-2.5.7-4.8 1.8-6.8A15 15 0 1 0 35 24Z"
                stroke="#F5D36C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M24 30.3s-4.2-2.5-6-4.8c-1.8-2.3-1.2-5.3 1-6.8 1.7-1.2 3.8-.8 5 .7 1.2-1.5 3.3-1.5 5-.3 2 1.3 2.5 4.3.7 6.7-1.8 2.5-5.7 4.7-5.7 4.7Z"
                fill="#F5D36C"
                opacity="0.9"
              />
            </svg>
          </div>
          <h2 className="text-white text-lg font-light">Islamic Mode</h2>
        </div>

        {/* Greeting */}
        <div className="text-center mb-5">
          <p className="text-emerald-100/80 text-sm mb-1">Bismillah ar-Rahman ar-Rahim</p>
          <p className="text-emerald-100/60 text-xs">In the name of Allah, the Most Gracious</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="space-y-3.5 mb-5">
            {/* Name Input */}
            <div>
              <label className="text-emerald-100/80 text-xs mb-1.5 block">{t.fullName}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-100/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-emerald-100/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="text-emerald-100/80 text-xs mb-1.5 block">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-100/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-emerald-100/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-emerald-100/80 text-xs mb-1.5 block">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-100/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-emerald-100/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/40 hover:text-emerald-100/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="text-emerald-100/80 text-xs mb-1.5 block">{t.confirmPassword}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-100/40" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-emerald-100/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/40 hover:text-emerald-100/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-emerald-100/70 text-xs">
                {t.agreeTo}{' '}
                <button type="button" className="text-emerald-300 hover:text-emerald-200">{t.termsLink}</button>
                {' '}{t.and}{' '}
                <button type="button" className="text-emerald-300 hover:text-emerald-200">{t.privacyLink}</button>
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 rounded-2xl bg-red-500/20 border border-red-400/30">
              <p className="text-red-300 text-xs text-center">{error}</p>
            </div>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '...' : t.createAccount}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-emerald-100/50 text-xs">{t.orContinueWith}</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Social Signup Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm hover:bg-white/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-xs">Google</span>
            </button>
            <button
              type="button"
              className="py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm hover:bg-white/15 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-xs">Apple</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-auto pt-2">
            <p className="text-emerald-100/60 text-xs">
              {t.alreadyHaveAccount}{' '}
              <button
                type="button"
                onClick={() => navigate('islamic-login')}
                className="text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                {t.signIn}
              </button>
            </p>
          </div>
        </form>

        {/* Islamic Blessing */}
        <div className="text-center mt-3">
          <p className="text-emerald-100/50 text-xs italic">
            بارك الله فيك
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}