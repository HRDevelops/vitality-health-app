import { X, AlertTriangle, HeartPulse, Droplet, Clock, ShieldAlert, Trash2, PhoneCall } from 'lucide-react';
import { MonitoredMember } from '../../../types/domain';
import { useMemberVitals, useRevokeLink } from '../../../services/api/careCircle';

interface FamilyMemberDetailModalProps {
  member: MonitoredMember;
  onClose: () => void;
}

export default function FamilyMemberDetailModal({
  member,
  onClose,
}: FamilyMemberDetailModalProps) {
  const { data: historyData, isLoading } = useMemberVitals(member.id);
  const revokeMutation = useRevokeLink();

  const handleRevoke = async () => {
    if (window.confirm(`Are you sure you want to stop monitoring ${member.name}?`)) {
      await revokeMutation.mutateAsync(member.linkId);
      onClose();
    }
  };

  const readings = historyData?.readings || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-surface-container border border-slate-200">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {member.relationshipType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Remote Family Monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Emergency Crisis Escalation Banner */}
        {member.hasActiveCrisis && (
          <div className="mt-4 rounded-2xl border border-clay/30 bg-clay/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay text-white shrink-0 mt-0.5 shadow-sm">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-clay">
                  Critical Health Alert
                </h4>
                <p className="mt-1 text-xs font-semibold text-slate-900 leading-snug">
                  {member.crisisMessage ||
                    `Urgent: ${member.name} logged a critical vital reading. Urgent medical consultation advised.`}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href="tel:911"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-clay px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-clay/90 transition-colors"
                  >
                    <PhoneCall size={13} />
                    <span>Call Emergency</span>
                  </a>
                  <a
                    href="tel:+15550192834"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-clay/30 bg-white px-3 py-1.5 text-xs font-bold text-clay shadow-2xs hover:bg-clay/5 transition-colors"
                  >
                    <PhoneCall size={13} />
                    <span>Call Relative</span>
                  </a>
                  <span className="text-[10px] text-slate-500">Urge immediate evaluation</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Latest Vitals Overview */}
        <div className="mt-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Current Clinical Vitals
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            {/* BP Card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                  <HeartPulse size={13} className="text-primary" />
                  Blood Pressure
                </span>
                {member.latestBp && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                      member.latestBp.uiToken === 'Fern'
                        ? 'bg-emerald-100 text-emerald-800'
                        : member.latestBp.uiToken === 'Saffron'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-clay/10 text-clay'
                    }`}
                  >
                    {member.latestBp.category}
                  </span>
                )}
              </div>

              <div className="mt-2 font-label-bold text-lg text-slate-900 tabular-nums">
                {member.latestBp ? (
                  <>
                    {member.latestBp.systolic}/{member.latestBp.diastolic}{' '}
                    <span className="text-xs font-normal text-slate-500">mmHg</span>
                  </>
                ) : (
                  <span className="text-xs font-normal text-slate-400">No logs yet</span>
                )}
              </div>

              {member.latestBp?.pulse && (
                <p className="mt-0.5 text-[10px] text-slate-500 tabular-nums">
                  Pulse: {member.latestBp.pulse} bpm
                </p>
              )}
            </div>

            {/* Glucose Card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                  <Droplet size={13} className="text-teal-600" />
                  Blood Glucose
                </span>
                {member.latestGlucose && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                      member.latestGlucose.uiToken === 'Fern'
                        ? 'bg-emerald-100 text-emerald-800'
                        : member.latestGlucose.uiToken === 'Saffron'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-clay/10 text-clay'
                    }`}
                  >
                    {member.latestGlucose.category}
                  </span>
                )}
              </div>

              <div className="mt-2 font-label-bold text-lg text-slate-900 tabular-nums">
                {member.latestGlucose?.glucoseValue ? (
                  <>
                    {member.latestGlucose.glucoseValue}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {member.latestGlucose.glucoseUnit === 'MMOL_L' ? 'mmol/L' : 'mg/dL'}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-normal text-slate-400">No logs yet</span>
                )}
              </div>

              {member.latestGlucose && (
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {member.latestGlucose.isFasting ? 'Fasting check' : 'Random / Post-Meal'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 14-Day Vitals Timeline */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              14-Day Vital History
            </h4>
            <span className="text-[10px] text-slate-400">
              {readings.length} {readings.length === 1 ? 'reading' : 'readings'}
            </span>
          </div>

          {isLoading ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading history...</p>
          ) : readings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No clinical vitals logged in the past 14 days.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {readings.map((reading) => {
                const isBp = reading.type === 'blood_pressure';
                const tokenColor =
                  reading.uiToken === 'Fern'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : reading.uiToken === 'Saffron'
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-clay/30 bg-clay/10 text-clay';

                const dateLabel = new Date(reading.loggedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          isBp ? 'bg-primary/10 text-primary' : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {isBp ? <HeartPulse size={14} /> : <Droplet size={14} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {isBp
                              ? `${reading.systolic}/${reading.diastolic} mmHg`
                              : `${reading.glucoseValue} mg/dL`}
                          </span>
                          <span
                            className={`rounded-md border px-1 py-0.2 text-[9px] font-bold ${tokenColor}`}
                          >
                            {reading.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{dateLabel}</p>
                      </div>
                    </div>

                    {reading.notes && (
                      <p className="text-[10px] text-slate-500 max-w-[120px] truncate" title={reading.notes}>
                        {reading.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revoke Link Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={handleRevoke}
            disabled={revokeMutation.isPending}
            className="flex items-center gap-1 text-[11px] font-bold text-clay/80 hover:text-clay transition-colors"
          >
            <Trash2 size={13} />
            <span>Stop Monitoring Relative</span>
          </button>

          <span className="text-[10px] text-slate-400">Remote Family Link</span>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-4 rounded-xl border border-slate-200/60 bg-slate-50 p-3 flex items-start gap-2">
          <ShieldAlert size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Educational &amp; tracking support only. Not a medical diagnosis. If your family member experiences severe symptoms, urge them to seek immediate emergency medical care.
          </p>
        </div>
      </div>
    </div>
  );
}
