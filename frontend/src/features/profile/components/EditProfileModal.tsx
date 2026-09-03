import { useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useUpdateProfile } from '../../../services/api/user';
import { useToast } from '../../../components/ui/ToastContext';
import { UserProfile } from '../../../types/domain';

interface EditProfileModalProps {
  user: UserProfile;
  onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [heightCm, setHeightCm] = useState(String(user.heightCm));
  const [targetWeightKg, setTargetWeightKg] = useState(String(user.targetWeightKg));
  const updateProfile = useUpdateProfile();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) return;
    updateProfile.mutate(
      { name: name.trim(), heightCm: Number(heightCm), targetWeightKg: Number(targetWeightKg) },
      {
        onSuccess: () => {
          showToast('Profile updated!');
          onClose();
        },
      }
    );
  };

  return (
    <BottomSheet title="Edit Profile" subtitle="Update your name and biometric targets" onClose={onClose} testId="edit-profile-modal-overlay">
      <div className="space-y-4" data-testid="edit-profile-modal">
        <div>
          <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            data-testid="edit-profile-name-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Height (cm)</label>
            <input
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              type="number"
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
              data-testid="edit-profile-height-input"
            />
          </div>
          <div>
            <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Target Weight (kg)</label>
            <input
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
              type="number"
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
              data-testid="edit-profile-target-weight-input"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={updateProfile.isPending || !name.trim()}
          className="w-full rounded-xl bg-primary py-4 font-headline-md text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          data-testid="edit-profile-submit-button"
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </BottomSheet>
  );
}
