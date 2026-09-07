import { useState } from 'react';
import { Mail, CheckCircle2, KeyRound, Copy, Check } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useForgotPassword, useResetPassword } from '../../../services/api/auth';
import { useToast } from '../../../components/ui/ToastContext';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

type Step = 'request' | 'reset' | 'done';

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [copied, setCopied] = useState(false);
  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();
  const { showToast } = useToast();

  const handleSend = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    forgotPassword.mutate(email, {
      onSuccess: (data) => {
        if (data.resetToken) setToken(data.resetToken);
        setStep('reset');
      },
    });
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    if (!token.trim() || newPassword.length < 6) return;
    resetPassword.mutate(
      { token: token.trim(), newPassword },
      {
        onSuccess: () => {
          setStep('done');
          showToast('Password reset! Sign in with your new password.');
        },
      }
    );
  };

  return (
    <BottomSheet
      title="Reset your password"
      subtitle="We'll simulate a reset link for this demo"
      onClose={onClose}
      testId="forgot-password-modal-overlay"
    >
      <div className="space-y-4" data-testid="forgot-password-modal">
        {step === 'done' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center" data-testid="forgot-password-success-message">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed/40 text-primary">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Password reset!</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              You can now sign in to {email} with your new password.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-full bg-primary py-3 font-label-bold text-label-bold text-on-primary"
              data-testid="forgot-password-done-button"
            >
              Done
            </button>
          </div>
        )}

        {step === 'request' && (
          <>
            <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3">
              <Mail size={16} className="text-outline" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent font-body-lg text-body-lg text-on-surface outline-none"
                data-testid="forgot-password-email-input"
              />
            </div>
            {forgotPassword.isError && (
              <p className="font-body-sm text-body-sm text-error" data-testid="forgot-password-error">
                Something went wrong. Please try again.
              </p>
            )}
            <button
              onClick={handleSend}
              disabled={forgotPassword.isPending}
              className="w-full rounded-full bg-primary py-4 font-label-bold text-label-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              data-testid="forgot-password-submit-button"
            >
              {forgotPassword.isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-primary-fixed/20 px-4 py-4 text-center">
              <CheckCircle2 size={22} className="text-primary" />
              <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                Reset instructions sent to {email || 'your inbox'}
              </p>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Demo mode: use the token below (already filled in) — no real email was sent.
              </p>
            </div>

            <div>
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Reset Token</label>
              <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-3 py-2">
                <KeyRound size={16} className="flex-shrink-0 text-outline" />
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full truncate bg-transparent font-body-sm text-body-sm text-on-surface outline-none"
                  data-testid="forgot-password-token-input"
                />
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 text-primary"
                  data-testid="forgot-password-copy-token-button"
                  aria-label="Copy token"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="forgot-password-new-password-input"
              />
            </div>

            {resetPassword.isError && (
              <p className="font-body-sm text-body-sm text-error" data-testid="forgot-password-reset-error">
                Invalid or expired token. Please try again.
              </p>
            )}

            <button
              onClick={handleReset}
              disabled={resetPassword.isPending || !token.trim() || newPassword.length < 6}
              className="w-full rounded-full bg-primary py-4 font-label-bold text-label-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              data-testid="forgot-password-reset-submit-button"
            >
              {resetPassword.isPending ? 'Resetting...' : 'Set New Password'}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
