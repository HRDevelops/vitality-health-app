import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Plus,
  AlertTriangle,
  ChevronRight,
  HeartPulse,
  Droplet,
  ShieldAlert,
  Clock,
  PhoneCall,
  ArrowLeft,
} from 'lucide-react';
import { MonitoredMember } from '../../types/domain';
import { useCareCircleMembers } from '../../services/api/careCircle';
import ConnectRelativeModal from './components/ConnectRelativeModal';
import FamilyMemberDetailModal from './components/FamilyMemberDetailModal';

export default function CareCircleView() {
  const navigate = useNavigate();
  const { data: members, isLoading } = useCareCircleMembers();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MonitoredMember | null>(null);

  const crisisMember = members?.find((m) => m.hasActiveCrisis);

  return (
    <div
      className="relative mx-auto min-h-screen w-full max-w-md bg-[#fcf8ff] pb-24 px-4 pt-5"
      data-testid="care-circle-view"
    >
      {/* Top Emergency Escalation Banner */}
      {crisisMember && (
        <div className="mb-4 rounded-2xl border border-clay/30 bg-clay/10 p-3.5 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-clay text-white shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-clay">
                  Emergency Escalation
                </span>
                <span className="rounded-full bg-clay text-white px-1.5 py-0.2 text-[9px] font-bold">
                  Active
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-900 leading-snug">
                {crisisMember.crisisMessage ||
                  `Urgent: ${crisisMember.name} logged a critical vital alert. Urgent medical consultation advised.`}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMember(crisisMember)}
                  className="rounded-xl bg-clay px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-clay/90 transition-all"
                >
                  View Vitals
                </button>
                <a
                  href="tel:911"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl bg-clay/15 px-2.5 py-1.5 text-xs font-bold text-clay hover:bg-clay/25 transition-colors"
                >
                  <PhoneCall size={12} />
                  <span>Call Emergency</span>
                </a>
                <a
                  href="tel:+15550192834"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <PhoneCall size={12} />
                  <span>Call Relative</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
            data-testid="care-circle-back-button"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="font-heading text-xl font-black text-slate-900">Care Circle</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Monitor your family members' vital readings remotely with real-time clinical alerts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/95 transition-all shrink-0 ml-2"
        >
          <Plus size={14} />
          <span>Connect</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="mt-12 flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-xs font-medium text-slate-500">Connecting to Care Circle...</p>
        </div>
      ) : !members || members.length === 0 ? (
        /* Empty State */
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <HeartHandshake size={28} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Family Members Connected</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Support your parents or relatives back home. Connect using a 6-character pairing code to receive their daily blood pressure and blood glucose updates.
          </p>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/95 transition-all"
          >
            <Plus size={14} />
            <span>Connect a Relative</span>
          </button>
        </div>
      ) : (
        /* Family Members Feed */
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Monitored Relatives ({members.length})
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>Live Sync</span>
            </div>
          </div>

          {members.map((member) => {
            const hasCrisis = member.hasActiveCrisis;
            const bp = member.latestBp;
            const glucose = member.latestGlucose;

            const syncLabel = member.lastSyncAt
              ? new Date(member.lastSyncAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric',
                })
              : 'No sync yet';

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md ${
                  hasCrisis
                    ? 'border-clay/40 bg-clay/[0.02] ring-1 ring-clay/30'
                    : 'border-slate-100'
                }`}
              >
                {/* Member Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">{member.name}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {member.relationshipType}
                        </span>
                      </div>
                      <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock size={10} />
                        <span>Last recorded: {syncLabel}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    {hasCrisis ? (
                      <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[10px] font-black text-clay">
                        Crisis
                      </span>
                    ) : bp?.uiToken === 'Fern' ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Optimal
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Review
                      </span>
                    )}
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* Vitals Summary Strip */}
                <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100/80">
                  {/* BP Metric */}
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <HeartPulse size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-medium text-slate-500">Blood Pressure</span>
                      <p className="font-label-bold text-xs text-slate-900 tabular-nums truncate">
                        {bp ? (
                          <>
                            {bp.systolic}/{bp.diastolic}{' '}
                            <span className="text-[9px] font-normal text-slate-500">mmHg</span>
                          </>
                        ) : (
                          '--'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Glucose Metric */}
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 shrink-0">
                      <Droplet size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-medium text-slate-500">Glucose</span>
                      <p className="font-label-bold text-xs text-slate-900 tabular-nums truncate">
                        {glucose?.glucoseValue ? (
                          <>
                            {glucose.glucoseValue}{' '}
                            <span className="text-[9px] font-normal text-slate-500">
                              {glucose.glucoseUnit === 'MMOL_L' ? 'mmol/L' : 'mg/dL'}
                            </span>
                          </>
                        ) : (
                          '--'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Non-Diagnostic Educational Disclaimer */}
      <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/80 p-3.5 shadow-2xs flex items-start gap-2.5">
        <ShieldAlert size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Educational &amp; tracking support only. Not a medical diagnosis. If your family member experiences severe symptoms, urge them to seek immediate emergency medical care.
        </p>
      </div>

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <ConnectRelativeModal onClose={() => setIsConnectModalOpen(false)} />
      )}

      {/* Detail Modal */}
      {selectedMember && (
        <FamilyMemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
