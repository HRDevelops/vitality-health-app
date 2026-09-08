import { useState } from 'react';
import BottomSheet from '../../../components/ui/BottomSheet';
import Toggle from '../../../components/ui/Toggle';
import { useUnits, UnitSystem } from '../../../core/context/UnitsContext';

interface AppSettingsModalProps {
  onClose: () => void;
}

const APP_VERSION = 'v1.2.0-emerge';

function readSetting(key: string, fallback: boolean) {
  const stored = localStorage.getItem(key);
  return stored === null ? fallback : stored === 'true';
}

export default function AppSettingsModal({ onClose }: AppSettingsModalProps) {
  const { unitSystem, setUnitSystem } = useUnits();
  const [hydrationReminders, setHydrationReminders] = useState(() => readSetting('vitality_notif_hydration', true));
  const [workoutStreaks, setWorkoutStreaks] = useState(() => readSetting('vitality_notif_streaks', true));
  const [weeklyDigestNudges, setWeeklyDigestNudges] = useState(() => readSetting('vitality_notif_weekly_digest', true));

  const update = (key: string, value: boolean, setter: (v: boolean) => void) => {
    localStorage.setItem(key, String(value));
    setter(value);
  };

  return (
    <BottomSheet title="App Settings" subtitle="Personalize your Vitality experience" onClose={onClose} testId="app-settings-modal-overlay">
      <div className="space-y-6" data-testid="app-settings-modal">
        <div>
          <p className="mb-2 font-body-lg text-body-lg font-semibold text-on-surface">Units</p>
          <p className="mb-3 font-body-sm text-body-sm text-on-surface-variant">Choose how weight, distance and volume are displayed.</p>
          <div className="flex gap-2 rounded-full bg-surface-container p-1" data-testid="settings-units-toggle">
            {(['metric', 'imperial'] as UnitSystem[]).map((system) => (
              <button
                key={system}
                onClick={() => setUnitSystem(system)}
                data-testid={`settings-units-${system}`}
                className={`flex-1 rounded-full py-2 font-label-bold text-[10px] uppercase transition-colors ${
                  unitSystem === system ? 'bg-primary text-on-primary' : 'text-outline'
                }`}
              >
                {system === 'metric' ? 'Metric (kg, km, ml)' : 'Imperial (lbs, mi, oz)'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="font-body-lg text-body-lg font-semibold text-on-surface">Notifications</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body-sm text-body-sm font-semibold text-on-surface">Hydration Reminders</p>
              <p className="font-body-sm text-[12px] text-on-surface-variant">Nudge me to drink water throughout the day</p>
            </div>
            <Toggle
              checked={hydrationReminders}
              onChange={(v) => update('vitality_notif_hydration', v, setHydrationReminders)}
              testId="settings-toggle-hydration"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body-sm text-body-sm font-semibold text-on-surface">Workout Streaks</p>
              <p className="font-body-sm text-[12px] text-on-surface-variant">Celebrate when I keep a workout or mindfulness streak alive</p>
            </div>
            <Toggle
              checked={workoutStreaks}
              onChange={(v) => update('vitality_notif_streaks', v, setWorkoutStreaks)}
              testId="settings-toggle-streaks"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body-sm text-body-sm font-semibold text-on-surface">Weekly Digest Nudges</p>
              <p className="font-body-sm text-[12px] text-on-surface-variant">Remind me to check my weekly digest on Sundays</p>
            </div>
            <Toggle
              checked={weeklyDigestNudges}
              onChange={(v) => update('vitality_notif_weekly_digest', v, setWeeklyDigestNudges)}
              testId="settings-toggle-weekly-digest"
            />
          </div>
        </div>

        <p className="pt-2 text-center font-label-bold text-[10px] uppercase tracking-wide text-outline" data-testid="app-settings-version">
          Vitality {APP_VERSION}
        </p>
      </div>
    </BottomSheet>
  );
}
