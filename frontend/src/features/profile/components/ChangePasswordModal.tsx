import { useState } from 'react';
import { Lock } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useChangePassword } from '../../../services/api/user';
import { useToast } from '../../../components/ui/ToastContext';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const changePassword = useChangePassword();
  const { showToast } = useToast();

  const handleSubmit = () => {
    setFormError(null);
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New passwords do not match.');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          showToast('Password updated successfully.');
          onClose();
        },
        onError: (err: any) => {
          setFormError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
        },
      }
    );
  };

  return (
    <BottomSheet title="Change Password" subtitle="Keep your account secure" onClose={onClose} testId="change-password-modal-overlay">
      <div className="space-y-4" data-testid="change-password-modal">
        <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3">
          <Lock size={16} className="text-outline" />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none"
            data-testid="change-password-current-input"
          />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3">
          <Lock size={16} className="text-outline" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none"
            data-testid="change-password-new-input"
          />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface px-4 py-3">
          <Lock size={16} className="text-outline" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none"
            data-testid="change-password-confirm-input"
          />
        </div>

        {formError && (
          <p className="font-body-sm text-body-sm text-error" data-testid="change-password-error">
            {formError}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
          className="w-full rounded-full bg-primary py-4 font-label-bold text-label-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
          data-testid="change-password-submit-button"
        >
          {changePassword.isPending ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </BottomSheet>
  );
}
