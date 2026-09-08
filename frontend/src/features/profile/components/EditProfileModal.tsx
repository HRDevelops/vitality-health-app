import { useRef, useState } from 'react';
import { Upload, ZoomIn, ZoomOut } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useUpdateProfile } from '../../../services/api/user';
import { useToast } from '../../../components/ui/ToastContext';
import { UserProfile } from '../../../types/domain';
import { GOAL_PRESETS } from '../../../lib/goalPresets';

interface EditProfileModalProps {
  user: UserProfile;
  onClose: () => void;
}

const AVATAR_ICONS = [
  { id: 'bolt', bg: '#7367f0', path: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z' },
  { id: 'heart', bg: '#ef4444', path: 'M12 21s-8-4.6-10-10A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 22 11c-2 5.4-10 10-10 10z' },
  { id: 'star', bg: '#f59e0b', path: 'M12 2l2.9 6.5 7.1.6-5.4 4.7 1.7 6.9L12 17l-6.3 3.7 1.7-6.9-5.4-4.7 7.1-.6z' },
  { id: 'drop', bg: '#0ea5e9', path: 'M12 2c4 5 7 9 7 13a7 7 0 1 1-14 0c0-4 3-8 7-13z' },
  { id: 'flame', bg: '#f97316', path: 'M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c0-2-1-3-1-5 2 1 4 4 4 7a6 6 0 1 1-12 0c0-4 3-7 6-10z' },
];

function buildIconAvatar(icon: (typeof AVATAR_ICONS)[number]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="128" height="128"><circle cx="12" cy="12" r="12" fill="${icon.bg}"/><path d="${icon.path}" fill="#ffffff"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function cropAndCompress(imageSrc: string, zoom: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const outputSize = 200;
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      const sourceSize = Math.min(img.width, img.height) / zoom;
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;
      ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = imageSrc;
  });
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
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const { showToast } = useToast();

  const applyPreset = (preset: (typeof GOAL_PRESETS)[number]) => {
    setActivePreset(preset.id);
    setCalorieGoal(String(preset.calorieGoal));
    setProteinGoal(String(preset.protein));
    setCarbsGoal(String(preset.carbs));
    setFatGoal(String(preset.fat));
    setWaterGoal(String(preset.waterGoal));
    setStepGoal(String(preset.stepGoal));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setZoom(1);
    };
    reader.onerror = () => showToast('Could not read that image. Please try another.');
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!cropSrc) return;
    try {
      const compressed = await cropAndCompress(cropSrc, zoom);
      setAvatarUrl(compressed);
      setCropSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      showToast('Could not process that image. Please try another.');
    }
  };

  const handleCancelCrop = () => {
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    updateProfile.mutate(
      {
        name: name.trim(),
        avatarUrl,
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
          <label className="mb-2 block font-label-bold text-[11px] uppercase text-on-surface-variant">Avatar</label>
          {!cropSrc ? (
            <>
              <div className="flex items-center gap-3">
                <img src={avatarUrl} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover" data-testid="edit-profile-avatar-preview" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 font-label-bold text-[12px] text-on-surface transition-colors hover:bg-surface-container"
                  data-testid="edit-profile-upload-photo-button"
                >
                  <Upload size={14} />
                  Upload Photo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" data-testid="edit-profile-avatar-file-input" />
              </div>
              <div className="mt-3 flex gap-2">
                {AVATAR_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setAvatarUrl(buildIconAvatar(icon))}
                    className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-primary/50"
                    style={{ backgroundColor: icon.bg }}
                    data-testid={`edit-profile-avatar-icon-${icon.id}`}
                    aria-label={`Use ${icon.id} avatar`}
                  >
                    <img src={buildIconAvatar(icon)} alt={icon.id} className="h-full w-full" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-outline-variant/30 bg-surface p-4" data-testid="avatar-crop-step">
              <p className="mb-3 text-center font-label-bold text-[11px] uppercase text-on-surface-variant">Adjust &amp; Crop</p>
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-full bg-surface-variant" data-testid="avatar-crop-frame">
                <img
                  src={cropSrc}
                  alt="Crop preview"
                  style={{ transform: `scale(${zoom})` }}
                  className="h-full w-full object-cover transition-transform"
                  data-testid="avatar-crop-preview"
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <ZoomOut size={14} className="flex-shrink-0 text-on-surface-variant" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                  data-testid="avatar-crop-zoom-slider"
                />
                <ZoomIn size={14} className="flex-shrink-0 text-on-surface-variant" />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  className="flex-1 rounded-full border border-outline-variant py-2 font-label-bold text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container"
                  data-testid="avatar-crop-cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="flex-1 rounded-full bg-primary py-2 font-label-bold text-[12px] text-on-primary transition-opacity hover:opacity-90"
                  data-testid="avatar-crop-apply-button"
                >
                  Use Photo
                </button>
              </div>
            </div>
          )}
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
          <div className="mb-3 flex items-center justify-between">
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Daily Targets</p>
          </div>

          <div className="mb-4 flex flex-wrap gap-2" data-testid="goal-presets-row">
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-full border px-4 py-1.5 font-label-bold text-[11px] transition-colors ${
                  activePreset === preset.id
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
                data-testid={`goal-preset-${preset.id}`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Steps Goal</label>
              <input
                value={stepGoal}
                onChange={(e) => {
                  setStepGoal(e.target.value);
                  setActivePreset(null);
                }}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-step-goal-input"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Water Goal (ml)</label>
              <input
                value={waterGoal}
                onChange={(e) => {
                  setWaterGoal(e.target.value);
                  setActivePreset(null);
                }}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-water-goal-input"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block font-label-bold text-[11px] uppercase text-on-surface-variant">Calorie Goal</label>
              <input
                value={calorieGoal}
                onChange={(e) => {
                  setCalorieGoal(e.target.value);
                  setActivePreset(null);
                }}
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
                onChange={(e) => {
                  setProteinGoal(e.target.value);
                  setActivePreset(null);
                }}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-protein-goal-input"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-bold text-[10px] uppercase text-on-surface-variant">Carbs</label>
              <input
                value={carbsGoal}
                onChange={(e) => {
                  setCarbsGoal(e.target.value);
                  setActivePreset(null);
                }}
                type="number"
                className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 font-body-sm text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                data-testid="edit-profile-carbs-goal-input"
              />
            </div>
            <div>
              <label className="mb-1 block font-label-bold text-[10px] uppercase text-on-surface-variant">Fat</label>
              <input
                value={fatGoal}
                onChange={(e) => {
                  setFatGoal(e.target.value);
                  setActivePreset(null);
                }}
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
