import { useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';

interface AppSettingsModalProps {
  onClose: () => void;
}

function readSetting(key: string, fallback: boolean) {
  const stored = localStorage.getItem(key);
  return stored === null ? fallback : stored === 'true';
}

function Toggle({ checked, onChange, testId }: { checked: boolean; onChange: (v: boolean) => void; testId: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      data-testid={testId}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-variant'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function AppSettingsModal({ onClose }: AppSettingsModalProps) {
  const [useImperialUnits, setUseImperialUnits] = useState(() => readSetting('vitality_use_imperial_units', false));
  const [dailyReminders, setDailyReminders] = useState(() => readSetting('vitality_daily_reminders', true));
  const [soundEffects, setSoundEffects] = useState(() => readSetting('vitality_sound_effects', true));

  const update = (key: string, value: boolean, setter: (v: boolean) => void) => {
    localStorage.setItem(key, String(value));
    setter(value);
  };

  return (
    <BottomSheet title="App Settings" subtitle="Personalize your Vitality experience" onClose={onClose} testId="app-settings-modal-overlay">
      <div className="space-y-5" data-testid="app-settings-modal">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Imperial Units</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Show weight/height in lbs and ft instead of kg/cm</p>
          </div>
          <Toggle
            checked={useImperialUnits}
            onChange={(v) => update('vitality_use_imperial_units', v, setUseImperialUnits)}
            testId="settings-toggle-units"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Daily Reminders</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Get notified to log meals and workouts</p>
          </div>
          <Toggle
            checked={dailyReminders}
            onChange={(v) => update('vitality_daily_reminders', v, setDailyReminders)}
            testId="settings-toggle-reminders"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">Sound Effects</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Play sounds on taps and achievements</p>
          </div>
          <Toggle
            checked={soundEffects}
            onChange={(v) => update('vitality_sound_effects', v, setSoundEffects)}
            testId="settings-toggle-sound"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
