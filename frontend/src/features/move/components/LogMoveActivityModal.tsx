import React, { useState, useMemo, useEffect } from 'react';
import { X, Footprints, Bike, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Leaf, AlertCircle } from 'lucide-react';
import { useLogMoveActivity } from '../../../services/api/moveActivity';
import { MoveActivityType, MoveActivity } from '../../../types/domain';

interface LogMoveActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: MoveActivityType;
}

export default function LogMoveActivityModal({
  isOpen,
  onClose,
  initialType = 'WALKATHON',
}: LogMoveActivityModalProps) {
  const [activityType, setActivityType] = useState<MoveActivityType>(initialType);
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActivityType(initialType);
      setFormError(null);
    }
  }, [isOpen, initialType]);

  const logMutation = useLogMoveActivity();

  // Real-time live pace calculation
  const paceAnalysis = useMemo(() => {
    const dist = parseFloat(distanceKm);
    const dur = parseFloat(durationMinutes);
    if (!dist || !dur || dist <= 0 || dur <= 0) return null;

    const hours = dur / 60;
    const paceKmh = Number((dist / hours).toFixed(2));
    const threshold = activityType === 'WALKATHON' ? 12.0 : 45.0;
    const isFraud = paceKmh > threshold;
    const estimatedCo2 = isFraud ? 0 : Number((dist * 0.192).toFixed(2));

    return {
      paceKmh,
      threshold,
      isFraud,
      estimatedCo2,
    };
  }, [distanceKm, durationMinutes, activityType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const dist = parseFloat(distanceKm);
    const dur = parseFloat(durationMinutes);

    if (!dist || isNaN(dist) || dist <= 0) {
      setFormError('Please enter a valid distance in kilometers.');
      return;
    }

    if (!dur || isNaN(dur) || dur <= 0) {
      setFormError('Please enter a valid duration in minutes.');
      return;
    }

    try {
      await logMutation.mutateAsync({
        activityType,
        distanceKm: dist,
        durationMinutes: dur,
      });

      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to record move activity.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid="log-move-activity-overlay"
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2.5rem] bg-white p-6 shadow-2xl animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
        data-testid="log-move-activity-sheet"
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Anti-Cheat Activity Engine
            </span>
            <h2 className="font-manrope text-xl font-extrabold text-slate-900">
              Log Move Activity
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mt-5 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActivityType('WALKATHON');
              setFormError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
              activityType === 'WALKATHON'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="toggle-walkathon-mode"
          >
            <Footprints size={15} />
            <span>Walkathon</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivityType('CYCLING');
              setFormError(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
              activityType === 'CYCLING'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid="toggle-cycling-mode"
          >
            <Bike size={15} />
            <span>Cycling</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="5.2"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 font-mono text-xl font-bold tabular-nums text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-move-distance"
                min="0.1"
                max="300"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                Duration (min)
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="42"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 font-mono text-xl font-bold tabular-nums text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-move-duration"
                min="1"
                max="1440"
                required
              />
            </div>
          </div>

          {/* Live Pace & CO2 Calculator Display */}
          {paceAnalysis && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">Calculated Average Speed:</span>
                </div>
                <div className="flex items-baseline gap-1 font-mono text-base font-black tabular-nums text-slate-900">
                  <span>{paceAnalysis.paceKmh}</span>
                  <span className="text-[11px] font-medium text-slate-500">km/h</span>
                </div>
              </div>

              {/* Real-time Anti-Cheat Pace Guardrail */}
              {paceAnalysis.isFraud ? (
                <div
                  className="rounded-xl border border-clay/30 bg-clay/10 p-3.5 text-xs leading-relaxed text-clay shadow-sm"
                  data-testid="pace-fraud-warning"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert size={16} />
                    <span>Anti-Cheat Fraud Warning</span>
                  </div>
                  <p className="mt-1">
                    Speed exceeds human {activityType === 'WALKATHON' ? 'Walkathon' : 'Cycling'} threshold (
                    <span className="font-mono font-bold tabular-nums">{paceAnalysis.threshold} km/h</span>). Submitting
                    will void credit (<span className="font-mono tabular-nums">0 kg CO2</span>) and issue an account
                    strike.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-fern/30 bg-fern/10 p-3 text-xs text-fern">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={16} />
                    <span>Verified Human Pace (≤ {paceAnalysis.threshold} km/h)</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-extrabold tabular-nums">
                    <Leaf size={14} />
                    <span>+{paceAnalysis.estimatedCo2} kg CO2</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-clay/30 bg-clay/10 p-3 text-xs text-clay">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={logMutation.isPending}
            className="w-full rounded-xl bg-primary py-3.5 font-manrope text-sm font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 hover:bg-primary-container"
            data-testid="submit-move-activity-button"
          >
            {logMutation.isPending ? 'Validating Pace...' : 'Record Move Activity'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-slate-400">
            Paces above motorized thresholds trigger immediate strike penalties and distance voiding.
          </span>
        </div>
      </div>
    </div>
  );
}
