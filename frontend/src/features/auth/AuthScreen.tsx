import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import ForgotPasswordModal from './components/ForgotPasswordModal';

interface AuthScreenProps {
  mode: 'login' | 'signup';
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.68 9c0-.593.102-1.17.284-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1-2 49.9-15.2 69.5-34.3z" />
    </svg>
  );
}

export default function AuthScreen({ mode }: AuthScreenProps) {
  const navigate = useNavigate();
  const { login, signup, loginAsDemo } = useAuth();
  const isSignup = mode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const validate = (): string | null => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await loginAsDemo();
      navigate('/', { replace: true });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSocial = (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setTimeout(async () => {
      await loginAsDemo();
      setSocialLoading(null);
      navigate('/', { replace: true });
    }, 1000);
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-gradient-to-br from-primary via-[#6d60e9] to-secondary-container"
      data-testid="auth-screen"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-container-margin pb-10 pt-16">
        <div className="mb-10 flex flex-col items-center text-center text-on-primary animate-fade-slide-up">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 shadow-glow backdrop-blur-md">
            <HeartPulse size={30} />
          </div>
          <h1 className="font-headline-lg text-headline-lg">Vitality</h1>
          <p className="mt-1 font-body-sm text-body-sm text-primary-fixed">Move. Nourish. Breathe.</p>
        </div>

        <div
          className="flex-1 rounded-3xl bg-surface-container-lowest p-container-margin shadow-glow animate-fade-slide-up"
          data-testid="auth-card"
        >
          <h2 className="mb-1 font-headline-md text-headline-md text-on-surface">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mb-6 font-body-sm text-body-sm text-on-surface-variant">
            {isSignup ? 'Start your wellness journey today.' : 'Sign in to continue your wellness journey.'}
          </p>

          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-label-bold text-label-bold text-on-primary shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
            data-testid="auth-demo-button"
          >
            {demoLoading && <Loader2 size={16} className="animate-spin" />}
            Continue as Grace (Demo)
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/40" />
            <span className="font-label-bold text-[10px] uppercase text-outline">or continue with</span>
            <div className="h-px flex-1 bg-outline-variant/40" />
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocial('google')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-2 rounded-full border border-outline-variant/40 bg-surface py-3 font-body-sm text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60"
              data-testid="auth-google-button"
            >
              {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
              Google
            </button>
            <button
              onClick={() => handleSocial('apple')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center gap-2 rounded-full border border-outline-variant/40 bg-surface py-3 font-body-sm text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60"
              data-testid="auth-apple-button"
            >
              {socialLoading === 'apple' ? <Loader2 size={16} className="animate-spin" /> : <AppleIcon />}
              Apple
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1 block font-label-bold text-[10px] uppercase text-outline" htmlFor="auth-email">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3">
                <Mail size={16} className="text-outline" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="grace@vitality.app"
                  className="w-full bg-transparent font-body-lg text-body-lg text-on-surface outline-none"
                  data-testid="auth-email-input"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-label-bold text-[10px] uppercase text-outline" htmlFor="auth-password">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3">
                <Lock size={16} className="text-outline" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent font-body-lg text-body-lg text-on-surface outline-none"
                  data-testid="auth-password-input"
                />
              </div>
            </div>

            {error && (
              <p className="font-body-sm text-body-sm text-error" data-testid="auth-error-message">
                {error}
              </p>
            )}

            {!isSignup && (
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="block font-body-sm text-body-sm text-primary hover:underline"
                data-testid="auth-forgot-password-link"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-on-surface py-4 font-label-bold text-label-bold text-surface transition-transform hover:scale-[1.02] disabled:opacity-60"
              data-testid="auth-submit-button"
            >
              {submitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => navigate(isSignup ? '/login' : '/signup')}
              className="font-semibold text-primary hover:underline"
              data-testid="auth-toggle-link"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  );
}
