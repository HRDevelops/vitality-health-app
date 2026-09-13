import React, { useState, useMemo, useEffect } from 'react';
import { X, Activity, Droplets, Heart, Clock, AlertCircle, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useCreateHealthMetric } from '../../../services/api/healthMetrics';
import { HealthMetricType, GlucoseUnit, HealthMetricUiToken, HealthMetric } from '../../../types/domain';
import EmergencyAlertModal from './EmergencyAlertModal';

interface LogHealthMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: HealthMetricType;
  lockType?: boolean;
}

export default function LogHealthMetricModal({
  isOpen,
  onClose,
  initialType = 'blood_pressure',
  lockType = false,
}: LogHealthMetricModalProps) {
  const [metricType, setMetricType] = useState<HealthMetricType>(initialType);

  // Sync state with incoming initialType
  useEffect(() => {
    if (isOpen) {
      setMetricType(initialType);
      setFormError(null);
    }
  }, [isOpen, initialType]);

  // Blood Pressure state
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');

  // Blood Glucose state
  const [glucoseInput, setGlucoseInput] = useState<string>('');
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('MG_DL');
  const [isFasting, setIsFasting] = useState<boolean>(true);

  // General notes & error
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Emergency Alert state
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [crisisReading, setCrisisReading] = useState<{ systolic: number; diastolic: number } | null>(null);

  const createMutation = useCreateHealthMetric();

  // Unit conversion helper when user switches between mg/dL and mmol/L
  const handleUnitToggle = (newUnit: GlucoseUnit) => {
    if (newUnit === glucoseUnit) return;
    if (glucoseInput && !isNaN(Number(glucoseInput))) {
      const currentVal = Number(glucoseInput);
      if (newUnit === 'MMOL_L') {
        setGlucoseInput((currentVal / 18.0182).toFixed(1));
      } else {
        setGlucoseInput(Math.round(currentVal * 18.0182).toString());
      }
    }
    setGlucoseUnit(newUnit);
  };

  // Real-time clinical zone preview calculation
  const bpPreview = useMemo<{ category: string; uiToken: HealthMetricUiToken; isCrisis: boolean } | null>(() => {
    const s = Number(systolic);
    const d = Number(diastolic);
    if (!s || !d || s < 50 || d < 30) return null;

    if (s > 180 || d > 120) {
      return { category: 'Hypertensive Crisis', uiToken: 'Clay', isCrisis: true };
    }
    if (s >= 140 || d >= 90) {
      return { category: 'High — Stage 2', uiToken: 'Clay', isCrisis: false };
    }
    if (s >= 130 || d >= 80) {
      return { category: 'High — Stage 1', uiToken: 'Saffron', isCrisis: false };
    }
    if (s >= 120 && d < 80) {
      return { category: 'Elevated', uiToken: 'Saffron', isCrisis: false };
    }
    return { category: 'Normal', uiToken: 'Fern', isCrisis: false };
  }, [systolic, diastolic]);

  const glucosePreview = useMemo<{ category: string; uiToken: HealthMetricUiToken } | null>(() => {
    const raw = Number(glucoseInput);
    if (!raw || raw <= 0) return null;

    const valMgDl = glucoseUnit === 'MMOL_L' ? raw * 18.0182 : raw;
    if (valMgDl < 70) {
      return { category: 'Hypoglycemia', uiToken: 'Clay' };
    }
    if (isFasting) {
      if (valMgDl >= 126) return { category: 'Diabetes', uiToken: 'Clay' };
      if (valMgDl >= 100) return { category: 'Prediabetes', uiToken: 'Saffron' };
      return { category: 'Normal', uiToken: 'Fern' };
    } else {
      if (valMgDl >= 200) return { category: 'Diabetes', uiToken: 'Clay' };
      if (valMgDl >= 140) return { category: 'Prediabetes', uiToken: 'Saffron' };
      return { category: 'Normal', uiToken: 'Fern' };
    }
  }, [glucoseInput, glucoseUnit, isFasting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (metricType === 'blood_pressure') {
        const s = Number(systolic);
        const d = Number(diastolic);
        const p = pulse ? Number(pulse) : undefined;

        if (!s || isNaN(s) || s <= 0) {
          setFormError('Please enter a valid Systolic value (mmHg).');
          return;
        }
        if (!d || isNaN(d) || d <= 0) {
          setFormError('Please enter a valid Diastolic value (mmHg).');
          return;
        }

        const result = (await createMutation.mutateAsync({
          type: 'blood_pressure',
          systolic: s,
          diastolic: d,
          pulse: p,
          notes: notes.trim() || undefined,
        })) as HealthMetric;

        if (result.isCriticalAlert) {
          setCrisisReading({ systolic: s, diastolic: d });
          setEmergencyModalOpen(true);
        } else {
          onClose();
        }
      } else {
        const val = Number(glucoseInput);
        if (!val || isNaN(val) || val <= 0) {
          setFormError('Please enter a valid Blood Glucose value.');
          return;
        }

        await createMutation.mutateAsync({
          type: 'blood_glucose',
          glucoseValue: val,
          glucoseUnit,
          isFasting,
          notes: notes.trim() || undefined,
        });

        onClose();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to record health metric.');
    }
  };

  if (!isOpen && !emergencyModalOpen) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
          data-testid="log-health-metric-overlay"
        >
          <div
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2.5rem] bg-white p-6 shadow-2xl animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
            data-testid="log-health-metric-sheet"
          >
            {/* Sheet Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Clinical Metric Engine</span>
                <h2 className="font-manrope text-xl font-extrabold text-slate-900">
                  {lockType
                    ? metricType === 'blood_pressure'
                      ? 'Log Blood Pressure'
                      : 'Log Blood Glucose'
                    : 'Log Health Metric'}
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

            {/* Segmented Toggle for Blood Pressure vs. Blood Glucose (only if lockType is false) */}
            {!lockType ? (
              <div className="mt-5 flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMetricType('blood_pressure');
                    setFormError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                    metricType === 'blood_pressure'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  data-testid="toggle-bp-type"
                >
                  <Activity size={15} />
                  <span>Blood Pressure</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMetricType('blood_glucose');
                    setFormError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                    metricType === 'blood_glucose'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  data-testid="toggle-glucose-type"
                >
                  <Droplets size={15} />
                  <span>Blood Glucose</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-xs font-bold text-primary">
                {metricType === 'blood_pressure' ? <Activity size={16} /> : <Droplets size={16} />}
                <span>{metricType === 'blood_pressure' ? 'AHA/ACC 2017 Protocol' : 'ADA Glycemic Protocol'}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {metricType === 'blood_pressure' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Systolic (mmHg)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 font-mono text-xl font-bold tabular-nums text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        data-testid="input-systolic"
                        min="50"
                        max="300"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Diastolic (mmHg)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 font-mono text-xl font-bold tabular-nums text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        data-testid="input-diastolic"
                        min="30"
                        max="200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Pulse (Optional, bpm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="72"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 pl-10 font-mono text-base font-bold tabular-nums text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        data-testid="input-pulse"
                        min="30"
                        max="220"
                      />
                      <Heart size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Real-time BP Classification Preview */}
                  {bpPreview && (
                    <div
                      className={`flex items-center justify-between rounded-xl border p-3 ${
                        bpPreview.uiToken === 'Clay'
                          ? 'border-clay/40 bg-clay/10 text-clay'
                          : bpPreview.uiToken === 'Saffron'
                          ? 'border-saffron/40 bg-saffron/10 text-saffron'
                          : 'border-fern/40 bg-fern/10 text-fern'
                      }`}
                      data-testid="bp-preview-badge"
                    >
                      <div className="flex items-center gap-2">
                        {bpPreview.uiToken === 'Clay' ? (
                          <ShieldAlert size={16} />
                        ) : bpPreview.uiToken === 'Saffron' ? (
                          <AlertTriangle size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wide">AHA Classification</span>
                      </div>
                      <span className="text-xs font-extrabold">{bpPreview.category}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Fasting Toggle */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Measurement Context
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFasting(true)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                          isFasting
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/40'
                        }`}
                        data-testid="fasting-toggle-true"
                      >
                        <Clock size={14} />
                        <span>Fasting (8h+)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFasting(false)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                          !isFasting
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/40'
                        }`}
                        data-testid="fasting-toggle-false"
                      >
                        <Clock size={14} />
                        <span>Random / Post-Meal</span>
                      </button>
                    </div>
                  </div>

                  {/* Glucose Value & Unit Switch */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Glucose Value
                      </label>
                      {/* Unit switch pills */}
                      <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleUnitToggle('MG_DL')}
                          className={`rounded-md px-2 py-0.5 transition-colors ${
                            glucoseUnit === 'MG_DL' ? 'bg-primary text-white' : 'text-slate-600'
                          }`}
                          data-testid="unit-mgdl"
                        >
                          mg/dL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnitToggle('MMOL_L')}
                          className={`rounded-md px-2 py-0.5 transition-colors ${
                            glucoseUnit === 'MMOL_L' ? 'bg-primary text-white' : 'text-slate-600'
                          }`}
                          data-testid="unit-mmoll"
                        >
                          mmol/L
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        placeholder={glucoseUnit === 'MG_DL' ? '95' : '5.3'}
                        value={glucoseInput}
                        onChange={(e) => setGlucoseInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 pr-16 font-mono text-xl font-bold tabular-nums text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                        data-testid="input-glucose"
                        min="1"
                        max="800"
                        required
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs font-semibold uppercase text-slate-400">
                        {glucoseUnit === 'MG_DL' ? 'mg/dL' : 'mmol/L'}
                      </span>
                    </div>
                  </div>

                  {/* Real-time Glucose Classification Preview */}
                  {glucosePreview && (
                    <div
                      className={`flex items-center justify-between rounded-xl border p-3 ${
                        glucosePreview.uiToken === 'Clay'
                          ? 'border-clay/40 bg-clay/10 text-clay'
                          : glucosePreview.uiToken === 'Saffron'
                          ? 'border-saffron/40 bg-saffron/10 text-saffron'
                          : 'border-fern/40 bg-fern/10 text-fern'
                      }`}
                      data-testid="glucose-preview-badge"
                    >
                      <div className="flex items-center gap-2">
                        {glucosePreview.uiToken === 'Clay' ? (
                          <ShieldAlert size={16} />
                        ) : glucosePreview.uiToken === 'Saffron' ? (
                          <AlertTriangle size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wide">ADA Classification</span>
                      </div>
                      <span className="text-xs font-extrabold">{glucosePreview.category}</span>
                    </div>
                  )}
                </>
              )}

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                  Notes (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={280}
                    placeholder="e.g., After morning walk, rested 5 mins"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 pl-10 text-xs text-slate-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    data-testid="input-notes"
                  />
                  <FileText size={15} className="absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>

              {/* Form Error Notice */}
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-clay/30 bg-clay/10 p-3 text-xs text-clay">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full rounded-xl bg-primary py-3.5 font-manrope text-sm font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 hover:bg-primary-container"
                data-testid="submit-health-metric-button"
              >
                {createMutation.isPending ? 'Saving Reading...' : 'Record Reading'}
              </button>
            </form>

            {/* Non-Diagnostic Educational Disclaimer */}
            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <p className="text-[11px] leading-relaxed text-slate-500 italic" data-testid="clinical-disclaimer">
                Educational &amp; tracking support only. Not a medical diagnosis. If you experience severe symptoms, seek immediate emergency medical care.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Interception Modal */}
      <EmergencyAlertModal
        isOpen={emergencyModalOpen}
        onClose={() => {
          setEmergencyModalOpen(false);
          onClose();
        }}
        systolic={crisisReading?.systolic}
        diastolic={crisisReading?.diastolic}
      />
    </>
  );
}
