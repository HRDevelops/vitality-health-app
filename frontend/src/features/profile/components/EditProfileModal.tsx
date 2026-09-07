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
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [heightCm, setHeightCm] = useState(String(user.heightCm));
  const [targetWeightKg, setTargetWeightKg] = useState(String(user.targetWeightKg));
  const [stepGoal, setStepGoal] = useState(String(user.stepGoal));
  const [waterGoal, setWaterGoal] = useState(String(user.waterGoal));
  const [calorieGoal, setCalorieGoal] = useState(String(user.calorieGoal));
  const [proteinGoal, setProteinGoal] = useState(String(user.macros.protein));
  const [carbsGoal, setCarbsGoal] = useState(String(user.macros.carbs));
  const [fatGoal, setFatGoal] = useState(String(user.macros.fat));
  const updateProfile = useUpdateProfile();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) return;
    updateProfile.mutate(
      {
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
        heightCm: Number(heightCm),
        targetWeightKg: Number(targetWeightKg),
        stepGoal: Number(stepGoal),
        waterGoal: Number(waterGoal),
        calorieGoal: Number(calorieGoal),
        macros: { protein: Number(proteinGoal), carbs: Number(carbsGoal), fat: Number(fatGoal) },
      },
      {
        onSuccess: () => {
          showToast('Profile updated!');
          onClose();
        },
      }
    );
  };

  return (
    <BottomSheet title="Edit Profile" subtitle="Update your name, avatar and daily targets" onClose={onClose} testId="edit-profile-modal-overlay">
      <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1" data-testid="edit-profile-modal">
        <div>
          <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            data-testid="edit-profile-name-input"
          />
        </div>
        <div>
          <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Avatar URL</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
            data-testid="edit-profile-avatar-input"
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

        <div className="border-t border-outline-variant/20 pt-4">
          <p className="mb-3 font-body-lg text-body-lg font-semibold text-on-surface">Daily Targets</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Steps Goal</label>
              <input
                value={stepGoal}
                onChange={(e) => setStepGoal(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-step-goal-input"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Water Goal (ml)</label>
              <input
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-water-goal-input"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Calorie Goal</label>
              <input
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-calorie-goal-input"
              />
            </div>
          </div>

          <p className="mb-2 mt-4 font-label-bold text-[11px] uppercase text-on-surface-variant">Macro Goals (grams)</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-label-bold text-[10px] uppercase text-on-surface-variant">Protein</label>
              <input
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-protein-goal-input"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-bold text-[10px] uppercase text-on-surface-variant">Carbs</label>
              <input
                value={carbsGoal}
                onChange={(e) => setCarbsGoal(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-carbs-goal-input"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-bold text-[10px] uppercase text-on-surface-variant">Fat</label>
              <input
                value={fatGoal}
                onChange={(e) => setFatGoal(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-fat-goal-input"
              />
            </div>
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
