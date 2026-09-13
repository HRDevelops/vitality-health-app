import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Droplets,
  Plus,
  Globe2,
  TrendingDown,
  Clock,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { useHealthMetrics, useHealthMetricSummary } from '../../services/api/healthMetrics';
import { HealthMetricType } from '../../types/domain';
import HealthMetricCard from './components/HealthMetricCard';
import LogHealthMetricModal from './components/LogHealthMetricModal';
import HealthMetricTrendChart from './components/HealthMetricTrendChart';

export default function HealthView() {
  const location = useLocation();
  const navigate = useNavigate();
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [initialModalType, setInitialModalType] = useState<HealthMetricType>('blood_pressure');
  const [lockModalType, setLockModalType] = useState(false);
  const [filterType, setFilterType] = useState<'all' | HealthMetricType>('all');

  useEffect(() => {
    const state = location.state as any;
    if (state?.openLogBP) {
      handleOpenLog('blood_pressure', true);
    } else if (state?.openLogGlucose) {
      handleOpenLog('blood_glucose', true);
    } else if (state?.openLogVitals) {
      handleOpenLog(state?.metricType || 'blood_pressure', Boolean(state?.lockType));
    }
  }, [location.state]);

  const { data: summary, isLoading: summaryLoading } = useHealthMetricSummary();
  const { data: history, isLoading: historyLoading } = useHealthMetrics({
    type: filterType === 'all' ? undefined : filterType,
    limit: 50,
  });

  const handleOpenLog = (type: HealthMetricType = 'blood_pressure', lock: boolean = false) => {
    setInitialModalType(type);
    setLockModalType(lock);
    setLogModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fcf8ff] pb-28 text-slate-900" data-testid="health-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-container-margin py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
            data-testid="health-back-button"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Clinical Health Engine
            </span>
            <h1 className="font-manrope text-2xl font-extrabold tracking-tight text-slate-900">
              Vitals &amp; Glycemic
            </h1>
          </div>
        </div>
        <button
          onClick={() => handleOpenLog('blood_pressure', false)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 hover:bg-primary-container"
          data-testid="header-log-reading-button"
        >
          <Plus size={16} />
          <span>Log Reading</span>
        </button>
      </header>

      <main className="space-y-6 px-container-margin pt-5">
        {/* Latest Readings Summary Cards */}
        <section className="space-y-3" aria-label="Latest Clinical Readings">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Latest Recorded Vitals
            </h2>
            {summary && summary.highestRiskFlag && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                  summary.highestRiskFlag === 'Clay'
                    ? 'bg-clay/15 text-clay'
                    : summary.highestRiskFlag === 'Saffron'
                    ? 'bg-saffron/15 text-saffron'
                    : 'bg-fern/15 text-fern'
                }`}
                data-testid="highest-risk-badge"
              >
                {summary.highestRiskFlag === 'Clay'
                  ? 'Clinical Attention'
                  : summary.highestRiskFlag === 'Saffron'
                  ? 'Monitoring Required'
                  : 'Zone Optimal'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <HealthMetricCard
              type="blood_pressure"
              metric={summary?.latestBp ?? null}
              onLogClick={() => handleOpenLog('blood_pressure', true)}
            />
            <HealthMetricCard
              type="blood_glucose"
              metric={summary?.latestGlucose ?? null}
              onLogClick={() => handleOpenLog('blood_glucose', true)}
            />
          </div>
        </section>

        {/* Clinical Averages & Overview */}
        {summary && summary.totalReadings > 0 && (
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Vitals 30-Day Averages
            </h2>
            <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div className="px-2">
                <span className="text-[10px] font-semibold text-slate-400">Avg Blood Pressure</span>
                <p className="mt-1 font-mono text-base font-black tabular-nums text-slate-900">
                  {summary.averages.avgSystolic && summary.averages.avgDiastolic
                    ? `${summary.averages.avgSystolic}/${summary.averages.avgDiastolic}`
                    : '--'}
                </p>
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>
              <div className="px-2">
                <span className="text-[10px] font-semibold text-slate-400">Avg Resting Pulse</span>
                <p className="mt-1 font-mono text-base font-black tabular-nums text-slate-900">
                  {summary.averages.avgPulse ? `${summary.averages.avgPulse}` : '--'}
                </p>
                <span className="text-[10px] text-slate-400">bpm</span>
              </div>
              <div className="px-2">
                <span className="text-[10px] font-semibold text-slate-400">Avg Blood Glucose</span>
                <p className="mt-1 font-mono text-base font-black tabular-nums text-slate-900">
                  {summary.averages.avgGlucose ? `${summary.averages.avgGlucose}` : '--'}
                </p>
                <span className="text-[10px] text-slate-400">mg/dL</span>
              </div>
            </div>
          </section>
        )}

        {/* Screen 4: Interactive Trend Chart Component */}
        <section aria-label="Clinical Metric Trend Chart">
          <HealthMetricTrendChart metrics={history || []} />
        </section>

        {/* Evidence & Population Data Anchors */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#1c1a27] to-[#312f3d] p-5 text-white shadow-md">
          <div className="flex items-center gap-2">
            <Globe2 size={18} className="text-secondary-fixed" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Population Health Evidence
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Global epidemiologic benchmarks ground every reading in preventive clinical reality.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
                Global Hypertension Burden
              </span>
              <p className="mt-1 font-mono text-xl font-extrabold tabular-nums text-white">
                ~1.4 Billion
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
                Adults live with hypertension worldwide.
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-3">
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
                Annual Mortality Impact
              </span>
              <p className="mt-1 font-mono text-xl font-extrabold tabular-nums text-white">
                ~10.8 Million
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
                Deaths annually linked to high systolic BP.
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-white/15 bg-white/5 p-3">
            <TrendingDown size={18} className="mt-0.5 flex-shrink-0 text-secondary-fixed" />
            <div className="text-xs leading-relaxed text-slate-200">
              <span className="font-bold text-white">Physical Activity Efficacy: </span>
              Regular exercise reduces hypertension risk by{' '}
              <span className="font-mono font-bold tabular-nums text-secondary-fixed">~19%</span> for high activity and{' '}
              <span className="font-mono font-bold tabular-nums text-secondary-fixed">~11%</span> for moderate activity.
            </div>
          </div>
        </section>

        {/* Clinical History & Trends */}
        <section className="space-y-3" aria-label="Reading History and Logs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Clinical History &amp; Logs
            </h2>
            {/* Filter buttons */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  filterType === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                data-testid="filter-all"
              >
                All
              </button>
              <button
                onClick={() => setFilterType('blood_pressure')}
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  filterType === 'blood_pressure' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                data-testid="filter-bp"
              >
                BP
              </button>
              <button
                onClick={() => setFilterType('blood_glucose')}
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  filterType === 'blood_glucose' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                data-testid="filter-glucose"
              >
                Glucose
              </button>
            </div>
          </div>

          {/* Reading Log Items */}
          <div className="space-y-2.5" data-testid="readings-history-list">
            {historyLoading ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
                Loading clinical records...
              </div>
            ) : !history || history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
                <p className="text-xs font-medium text-slate-500">No vitals logged yet.</p>
                <button
                  onClick={() => handleOpenLog('blood_pressure', false)}
                  className="mt-2 text-xs font-bold text-primary underline hover:text-primary-container"
                >
                  Record your first health measurement
                </button>
              </div>
            ) : (
              history.map((item) => {
                const isBp = item.type === 'blood_pressure';
                const formattedDate = new Date(item.loggedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });

                const tokenBadgeClass =
                  item.uiToken === 'Clay'
                    ? 'bg-clay/15 text-clay border-clay/30'
                    : item.uiToken === 'Saffron'
                    ? 'bg-saffron/15 text-saffron border-saffron/30'
                    : 'bg-fern/15 text-fern border-fern/30';

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                    data-testid={`history-item-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {isBp ? <Activity size={18} /> : <Droplets size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-extrabold tabular-nums text-slate-900">
                            {isBp
                              ? `${item.systolic}/${item.diastolic} mmHg`
                              : `${item.glucoseValue} mg/dL`}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tokenBadgeClass}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formattedDate}
                          </span>
                          {isBp && item.pulse && (
                            <span className="flex items-center gap-1">
                              <Heart size={11} />
                              <span className="font-mono tabular-nums">{item.pulse}</span> bpm
                            </span>
                          )}
                          {!isBp && (
                            <span>{item.isFasting ? 'Fasting' : 'Post-Meal'}</span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="mt-1 text-[11px] text-slate-600 italic">"{item.notes}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Non-Diagnostic Educational Legal Guardrail */}
        <p
          className="text-[11px] text-slate-400 text-center leading-relaxed px-4 pt-6 pb-4"
          data-testid="clinical-disclaimer"
        >
          Educational &amp; tracking support only. Not a medical diagnosis. If you experience severe symptoms, seek immediate emergency medical care.
        </p>
      </main>

      {/* Log Modal */}
      <LogHealthMetricModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        initialType={initialModalType}
        lockType={lockModalType}
      />
    </div>
  );
}
