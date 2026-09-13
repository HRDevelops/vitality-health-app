import React from 'react';
import { AlertOctagon, PhoneCall, X, ShieldAlert } from 'lucide-react';

interface EmergencyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  systolic?: number;
  diastolic?: number;
  category?: string;
}

export default function EmergencyAlertModal({
  isOpen,
  onClose,
  systolic,
  diastolic,
  category = 'Hypertensive Crisis',
}: EmergencyAlertModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md animate-fade-in"
      data-testid="emergency-alert-modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-alert-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-clay bg-white shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        data-testid="emergency-alert-modal-card"
      >
        {/* Header Alert Banner */}
        <div className="flex items-center justify-between bg-clay px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <AlertOctagon size={24} className="text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                Critical Clinical Alert
              </span>
              <h2 id="emergency-alert-title" className="text-lg font-bold leading-tight">
                {category}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Dismiss alert"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Numeric Reading Badge */}
          {systolic && diastolic && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-clay/30 bg-clay/5 p-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-clay">
                  Recorded Blood Pressure
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-extrabold tabular-nums text-clay">
                    {systolic}/{diastolic}
                  </span>
                  <span className="text-sm font-medium text-clay/80">mmHg</span>
                </div>
              </div>
              <ShieldAlert size={36} className="text-clay" />
            </div>
          )}

          {/* Clinical Instructions */}
          <div className="mb-6 space-y-3 text-sm text-slate-800">
            <p className="font-semibold text-clay">
              Your reading meets the threshold for Hypertensive Crisis (Systolic &gt; 180 and/or Diastolic &gt; 120 mmHg).
            </p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700">
              <p className="font-bold text-slate-900">Immediate Protocol Check:</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-slate-600">
                <li>Check for severe symptoms: chest pain, shortness of breath, severe headache, numbness, or blurred vision.</li>
                <li>If symptoms are present, do not wait. Call emergency services immediately.</li>
                <li>Rest quietly for 5 minutes and repeat the measurement if instructed by a healthcare provider.</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <a
              href="tel:911"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-clay py-3.5 font-bold text-white shadow-md transition-transform active:scale-95 hover:bg-clay/90"
              data-testid="emergency-call-button"
            >
              <PhoneCall size={18} />
              <span>Call Emergency Services (911)</span>
            </a>

            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95"
              data-testid="emergency-dismiss-button"
            >
              I Understand / Logged Reading
            </button>
          </div>

          {/* Non-Diagnostic Educational Disclaimer */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] leading-relaxed text-slate-500 italic" data-testid="clinical-disclaimer">
              Educational &amp; tracking support only. Not a medical diagnosis. If you experience severe symptoms, seek immediate emergency medical care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
