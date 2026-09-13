import { useState } from 'react';
import {
  X,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  Bell,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useSubmitQuestionnaire } from '../../services/api/onboarding';
import { useToast } from '../../components/ui/ToastContext';

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UNIVERSITIES = [
  'National University of Singapore (NUS)',
  'Nanyang Technological University (NTU)',
  'Singapore Management University (SMU)',
  'Singapore University of Technology & Design (SUTD)',
  'Independent / Alumni / General Member',
];

export default function OnboardingFlowModal({ isOpen, onClose }: OnboardingFlowModalProps) {
  const { showToast } = useToast();
  const submitMutation = useSubmitQuestionnaire();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [campusName, setCampusName] = useState(UNIVERSITIES[0]);
  const [targetDailyDistanceKm, setTargetDailyDistanceKm] = useState(5.0);
  const [preferredMode, setPreferredMode] = useState<'WALKATHON' | 'CYCLING'>('WALKATHON');
  const [hasHypertensionHistory, setHasHypertensionHistory] = useState(false);
  const [notifyCrisisAlerts, setNotifyCrisisAlerts] = useState(true);

  if (!isOpen) return null;

  const handleFinish = async () => {
    try {
      await submitMutation.mutateAsync({
        campusName,
        targetDailyDistanceKm,
        preferredActivityMode: preferredMode,
        hasHypertensionHistory,
        notifyCrisisAlerts,
      });
      showToast('Cardiovascular profile saved! Onboarding achievement unlocked.');
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save onboarding preferences.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Step {step} of 3
            </span>
            <h3 className="text-base font-bold text-slate-900">Cardiovascular Baseline</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-primary' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Campus Selection */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Select Campus Affiliation</h4>
                <p className="text-[11px] text-slate-500">
                  Compete in the 3-tier intercollegiate Move leaderboard
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {UNIVERSITIES.map((univ) => (
                <button
                  key={univ}
                  type="button"
                  onClick={() => setCampusName(univ)}
                  className={`w-full rounded-2xl border p-3.5 text-left text-xs font-semibold transition-all ${
                    campusName === univ
                      ? 'border-primary bg-primary/5 text-primary shadow-xs font-bold ring-1 ring-primary'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {univ}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all"
            >
              <span>Continue to Movement Goals</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Activity & Cardiovascular History */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HeartPulse size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Daily Cardiovascular Target</h4>
                <p className="text-[11px] text-slate-500">
                  Calibrate active distance and clinical thresholds
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Daily Active Distance: {targetDailyDistanceKm} km
              </label>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={targetDailyDistanceKm}
                onChange={(e) => setTargetDailyDistanceKm(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>1.0 km (Starter)</span>
                <span>5.0 km (Standard)</span>
                <span>15.0 km (Athlete)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Movement Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferredMode('WALKATHON')}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                    preferredMode === 'WALKATHON'
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Walkathon (Pace &lt;12 km/h)
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredMode('CYCLING')}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition-all ${
                    preferredMode === 'CYCLING'
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Cycling (Pace &lt;45 km/h)
                </button>
              </div>
            </div>

            {/* Hypertension history toggle */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Family History of Hypertension</h5>
                  <p className="text-[10px] text-slate-500">
                    Enables heightened clinical sodium and BP vigilance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHasHypertensionHistory(!hasHypertensionHistory)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hasHypertensionHistory ? 'bg-primary' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hasHypertensionHistory ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95"
              >
                <span>Continue to Alerts</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Crisis Alert Preferences */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Emergency &amp; Crisis Escalation</h4>
                <p className="text-[11px] text-slate-500">
                  Diaspora Care Circle and immediate alert rules
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Real-Time Clinical Crisis Escalation</h5>
                  <p className="text-[10px] text-slate-500">
                    Receive urgent notifications when family members log Hypertensive Crisis (&gt;180/120)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyCrisisAlerts(!notifyCrisisAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifyCrisisAlerts ? 'bg-primary' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifyCrisisAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-start gap-2">
              <ShieldCheck size={16} className="text-fern shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-900 leading-snug">
                Your profile will be calibrated to AHA/ACC 2017 Blood Pressure guidelines and ADA Blood Glucose targets.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitMutation.isPending}
                className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>{submitMutation.isPending ? 'Saving Profile...' : 'Complete Orientation'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
