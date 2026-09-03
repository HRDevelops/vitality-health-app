import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  };

  return (
    <BottomSheet
      title="Reset your password"
      subtitle="We'll simulate a reset link for this demo"
      onClose={onClose}
      testId="forgot-password-modal-overlay"
    >
      <div className="space-y-4" data-testid="forgot-password-modal">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center" data-testid="forgot-password-success-message">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed/40 text-primary">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Reset link sent!</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Check {email || 'your inbox'} for instructions. (Demo simulation — no real email was sent.)
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-full bg-primary py-3 font-label-bold text-label-bold text-on-primary"
              data-testid="forgot-password-done-button"
            >
              Done
            </button>
          </div>
        ) : (
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
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full rounded-full bg-primary py-4 font-label-bold text-label-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              data-testid="forgot-password-submit-button"
            >
              {sending ? 'Sending...' : 'Send Reset Link'}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
