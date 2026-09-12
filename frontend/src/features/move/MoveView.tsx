import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Footprints,
  Bike,
  Plus,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Gauge,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useMoveActivities, useMoveSummary } from '../../services/api/moveActivity';
import { MoveActivityType } from '../../types/domain';
import LogMoveActivityModal from './components/LogMoveActivityModal';

export default function MoveView() {
  const location = useLocation();
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [initialModalType, setInitialModalType] = useState<MoveActivityType>('WALKATHON');
  const [filterMode, setFilterMode] = useState<'ALL' | MoveActivityType>('ALL');

  const { data: summary, isLoading: summaryLoading } = useMoveSummary();
  const { data: activities, isLoading: activitiesLoading } = useMoveActivities({
    activityType: filterMode === 'ALL' ? undefined : filterMode,
    limit: 50,
  });

  useEffect(() => {
    const state = location.state as any;
    if (state?.openLogWalkathon) {
      setInitialModalType('WALKATHON');
      setLogModalOpen(true);
    } else if (state?.openLogCycling) {
      setInitialModalType('CYCLING');
      setLogModalOpen(true);
    } else if (state?.openLogMove) {
      setInitialModalType(state?.activityType || 'WALKATHON');
      setLogModalOpen(true);
    }
  }, [location.state]);

  const handleOpenLog = (type: MoveActivityType = 'WALKATHON') => {
    setInitialModalType(type);
    setLogModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fcf8ff] pb-28 text-slate-900" data-testid="move-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-container-margin py-4 backdrop-blur-md">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Anti-Cheat Engine
          </span>
          <h1 className="font-manrope text-2xl font-extrabold tracking-tight text-slate-900">
            Move &amp; Carbon
          </h1>
        </div>
        <button
          onClick={() => handleOpenLog('WALKATHON')}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 hover:bg-primary-container"
          data-testid="header-log-move-button"
        >
          <Plus size={16} />
          <span>Log Move</span>
        </button>
      </header>

      <main className="space-y-6 px-container-margin pt-5">
        {/* Strikes Notice if > 0 */}
        {summary && summary.activeStrikes > 0 && (
          <div
            className="flex items-start gap-3 rounded-2xl border border-clay/30 bg-clay/10 p-4 text-xs text-clay shadow-sm"
            data-testid="strikes-warning-banner"
          >
            <ShieldAlert size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 font-bold text-clay">
                <span>Account Strikes Active:</span>
                <span className="rounded-full bg-clay px-2 py-0.5 font-mono text-[11px] text-white tabular-nums">
                  {summary.activeStrikes} {summary.activeStrikes === 1 ? 'Strike' : 'Strikes'}
                </span>
              </div>
              <p className="mt-1 leading-relaxed text-clay/90">
                You have logged activities that exceeded plausible human speed thresholds. Those credits were
                voided (0 kg CO2) to preserve competitive integrity.
              </p>
            </div>
          </div>
        )}

        {/* Primary Metrics: Distance & CO2 Offset */}
        <section className="grid grid-cols-2 gap-3" aria-label="Primary Move Metrics">
          {/* Total Verified Distance Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Verified Distance
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Footprints size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className="font-mono text-3xl font-black tracking-tight tabular-nums text-slate-900"
                data-testid="total-distance-km"
              >
                {summary?.totalVerifiedDistanceKm ?? '0.00'}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase">km</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck size={13} className="text-fern" />
              <span>Anti-cheat verified</span>
            </div>
          </div>

          {/* Total CO2 Offset Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                CO2 Offset
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fern/10 text-fern">
                <Leaf size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className="font-mono text-3xl font-black tracking-tight tabular-nums text-slate-900"
                data-testid="total-co2-kg"
              >
                {summary?.totalCo2SavingsKg ?? '0.000'}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase">kg</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-mono text-[10px] tabular-nums font-bold text-fern">0.192 kg/km</span>
              <span>offset credit</span>
            </div>
          </div>
        </section>

        {/* Mode Breakdown Card */}
        {summary && (
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Discipline Breakdown
            </h2>
            <div className="mt-3 grid grid-cols-2 divide-x divide-slate-100">
              <div className="px-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Footprints size={15} className="text-primary" />
                  <span>Walkathon</span>
                </div>
                <p className="mt-1 font-mono text-xl font-black tabular-nums text-slate-900">
                  {summary.walkathonKm} <span className="text-xs font-medium text-slate-400">km</span>
                </p>
                <span className="text-[10px] text-slate-400">Max pace: 12.0 km/h</span>
              </div>

              <div className="px-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Bike size={15} className="text-secondary" />
                  <span>Cycling</span>
                </div>
                <p className="mt-1 font-mono text-xl font-black tabular-nums text-slate-900">
                  {summary.cyclingKm} <span className="text-xs font-medium text-slate-400">km</span>
                </p>
                <span className="text-[10px] text-slate-400">Max pace: 45.0 km/h</span>
              </div>
            </div>
          </section>
        )}

        {/* Anti-Cheat Automated Validation Guardrail */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#1c1a27] to-[#312f3d] p-5 text-white shadow-md">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-secondary-fixed" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Automated Anti-Cheat Guardrail
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Activities are analyzed for motorized vehicle fraud in real time based on physiological human limits.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center gap-1.5 text-secondary-fixed">
                <Footprints size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Walkathon Limit</span>
              </div>
              <p className="mt-1 font-mono text-lg font-black tabular-nums text-white">
                ≤ 12.0 <span className="text-xs font-medium text-slate-300">km/h</span>
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
                Paces above 12.0 km/h flagged as vehicle use.
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <div className="flex items-center gap-1.5 text-secondary-fixed">
                <Bike size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Cycling Limit</span>
              </div>
              <p className="mt-1 font-mono text-lg font-black tabular-nums text-white">
                ≤ 45.0 <span className="text-xs font-medium text-slate-300">km/h</span>
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
                Paces above 45.0 km/h flagged as vehicle use.
              </p>
            </div>
          </div>
        </section>

        {/* Recent Activities Stream */}
        <section className="space-y-3" aria-label="Activity History and Status">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Activity History
            </h2>

            {/* Segmented Filter */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  filterMode === 'ALL' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                data-testid="filter-move-all"
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('WALKATHON')}
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  filterMode === 'WALKATHON' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                data-testid="filter-move-walkathon"
              >
                Walk
              </button>
              <button
                onClick={() => setFilterMode('CYCLING')}
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  filterMode === 'CYCLING' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                data-testid="filter-move-cycling"
              >
                Cycle
              </button>
            </div>
          </div>

          <div className="space-y-2.5" data-testid="move-activities-list">
            {activitiesLoading ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
                Loading activity records...
              </div>
            ) : !activities || activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
                <p className="text-xs font-medium text-slate-500">No move activities logged yet.</p>
                <button
                  onClick={() => handleOpenLog('WALKATHON')}
                  className="mt-2 text-xs font-bold text-primary underline hover:text-primary-container"
                >
                  Log your first walkathon or cycling session
                </button>
              </div>
            ) : (
              activities.map((item) => {
                const isWalk = item.activityType === 'WALKATHON';
                const Icon = isWalk ? Footprints : Bike;
                const formattedDate = new Date(item.loggedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all ${
                      item.isFlagged
                        ? 'border-clay/30 bg-clay/5'
                        : 'border-slate-100 bg-white hover:shadow-md'
                    }`}
                    data-testid={`activity-item-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          item.isFlagged
                            ? 'bg-clay/15 text-clay'
                            : isWalk
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary/10 text-secondary'
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold tabular-nums text-slate-900">
                            {item.distanceKm} km
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              item.isFlagged
                                ? 'border-clay/30 bg-clay/10 text-clay'
                                : 'border-fern/30 bg-fern/10 text-fern'
                            }`}
                          >
                            {item.isFlagged ? 'Fraud Flagged' : 'Verified'}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formattedDate} ({item.durationMinutes}m)
                          </span>
                          <span className="font-mono tabular-nums text-slate-600">
                            {item.averagePaceKmh} km/h
                          </span>
                        </div>
                        {item.isFlagged && item.flagReason && (
                          <p className="mt-1 text-[10px] font-bold text-clay">
                            Pace exceeded {isWalk ? '12.0' : '45.0'} km/h threshold (Strike recorded)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono text-sm font-extrabold tabular-nums ${
                          item.isFlagged ? 'text-slate-400 line-through' : 'text-fern'
                        }`}
                      >
                        {item.isFlagged ? '0 kg' : `+${item.co2SavingsKg} kg`}
                      </span>
                      <span className="block text-[10px] text-slate-400">CO2</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Log Activity Modal */}
      <LogMoveActivityModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        initialType={initialModalType}
      />
    </div>
  );
}
