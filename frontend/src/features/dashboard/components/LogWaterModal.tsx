import { useState } from 'react';
import { Droplet } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useDashboardMetrics } from '../../../services/api/dashboard';
import { useLogWater } from '../../../services/api/activity';
import { useUnits } from '../../../core/context/UnitsContext';
import { useToast } from '../../../components/ui/ToastContext';

interface LogWaterModalProps {
  onClose: () => void;
}

const QUICK_AMOUNTS_ML = [250, 500];

export default function LogWaterModal({ onClose }: LogWaterModalProps) {
  const { data: metrics } = useDashboardMetrics();
  const logWater = useLogWater();
  const { formatVolume } = useUnits();
  const { showToast } = useToast();
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  const waterMl = metrics?.waterMl ?? 0;
  const goalMl = metrics?.waterGoalMl ?? 2000;
  const percent = Math.min(100, Math.round((waterMl / goalMl) * 100));

  const handleAdd = (amountMl: number) => {
    setPendingAmount(amountMl);
    logWater.mutate(amountMl, {
      onSuccess: () => {
        const parts = formatVolume(amountMl);
        showToast(`+${parts.value}${parts.unit} logged!`);
      },
      onSettled: () => setPendingAmount(null),
    });
  };

  return (
    <BottomSheet title="Log Water" subtitle="Stay on top of your hydration goal" onClose={onClose} testId="log-water-modal-overlay">
      <div className="space-y-6" data-testid="log-water-modal">
        <div className="flex flex-col items-center rounded-3xl bg-gradient-to-br from-[#4db4ff] to-[#0089f2] p-6 text-white shadow-glow">
          <Droplet size={32} className="mb-2 opacity-90" />
          <p className="font-metric-display text-metric-display" data-testid="log-water-current-value">
            {formatVolume(waterMl).value} {formatVolume(waterMl).unit}
          </p>
          <p className="font-body-sm text-body-sm opacity-80">
            of {formatVolume(goalMl).value}
            {formatVolume(goalMl).unit} goal · {percent}%
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {QUICK_AMOUNTS_ML.map((amountMl) => {
            const parts = formatVolume(amountMl);
            return (
              <button
                key={amountMl}
                onClick={() => handleAdd(amountMl)}
                disabled={logWater.isPending}
                data-testid={`log-water-quick-${amountMl}`}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-container-low p-5 shadow-sm transition-transform hover:scale-[0.97] disabled:opacity-60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20 text-primary">
                  <Droplet size={20} className={pendingAmount === amountMl ? 'animate-pulse' : ''} />
                </div>
                <span className="font-label-bold text-label-bold text-on-surface">
                  +{parts.value}
                  {parts.unit}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
