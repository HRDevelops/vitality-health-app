import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Footprints, Flame, MapPin, Clock } from 'lucide-react';
import { useActivityDaily, useActivityTrends } from '../../services/api/activity';
import { useDashboardMetrics } from '../../services/api/dashboard';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import ProgressRing from '../../components/ui/ProgressRing';
import ActivityInsightModal from './components/ActivityInsightModal';
import AddWorkoutModal from './components/AddWorkoutModal';

type RangeOption = 'daily' | 'week' | 'month';

export default function ActivityTracker() {
  const location = useLocation();
  const [range, setRange] = useState<RangeOption>('daily');
  const [insightOpen, setInsightOpen] = useState(false);
  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.openAddWorkout) {
      setAddWorkoutOpen(true);
    }
  }, [location.state]);

  const { data: daily, isLoading } = useActivityDaily();
  const { data: metrics } = useDashboardMetrics();
  const { data: trends } = useActivityTrends(range === 'month' ? 'month' : 'week');

  const maxSteps = trends ? Math.max(...trends.points.map((p) => p.steps), 1) : 1;

  return (
    <div data-testid="activity-tracker-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background px-container-margin py-4">
        <div className="flex items-center gap-3">
          {metrics?.avatarUrl && <img src={metrics.avatarUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover" />}
          <h1 className="font-headline-md text-headline-md text-on-surface">Hi, {metrics?.greetingName ?? 'Grace'}</h1>
        </div>
      </header>

      <main className="flex flex-col gap-section-gap px-container-margin pb-24 pt-2">
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-lg-mobile text-on-background">Activity</h2>
            <button
              onClick={() => setInsightOpen(true)}
              className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 font-label-bold text-label-bold text-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
              data-testid="activity-insight-button"
            >
              Insight
            </button>
          </div>
          <p className="font-body-sm text-body-sm text-outline">DAILY STEPS</p>
        </section>

        {isLoading && <DashboardSkeleton />}

        {daily && (
          <>
            <section
              className="relative flex flex-col items-center justify-center overflow-hidden rounded-[32px] bg-surface-container-lowest p-8 shadow-soft"
              data-testid="activity-goal-card"
            >
              <div className="z-10 mb-8 text-center">
                <h3 className="mb-1 font-headline-md text-headline-md text-on-surface">You have walked</h3>
                <p className="font-headline-md text-headline-md text-primary">
                  <span className="font-bold">{daily.progressPercent}%</span> of your goal
                </p>
              </div>
              <ProgressRing percent={daily.progressPercent} size={256} strokeWidth={16} trackColor="rgba(120,117,134,0.15)" progressColor="#5445cf">
                <div className="flex flex-col items-center text-center">
                  <Footprints size={28} className="mb-2 text-primary" />
                  <span className="text-[40px] font-bold leading-[48px] tracking-tight text-on-surface" data-testid="activity-steps-value">
                    {daily.steps.toLocaleString()}
                  </span>
                  <span className="mt-1 font-body-sm text-body-sm text-outline">steps</span>
                </div>
              </ProgressRing>
            </section>

            <section className="grid grid-cols-3 gap-gutter">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container/20">
                  <Flame size={20} className="text-secondary" />
                </div>
                <span className="font-label-bold text-label-bold text-on-surface">{daily.caloriesBurned} kcal</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20">
                  <MapPin size={20} className="text-primary" />
                </div>
                <span className="font-label-bold text-label-bold text-on-surface">{daily.distanceKm} km</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed/30">
                  <Clock size={20} className="text-on-secondary-fixed-variant" />
                </div>
                <span className="font-label-bold text-label-bold text-on-surface">{daily.activeMinutes} min</span>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-on-primary shadow-lg" data-testid="activity-trends-chart">
              <div className="relative z-10 mb-6 flex items-center gap-4">
                {(['daily', 'week', 'month'] as RangeOption[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    data-testid={`activity-range-${r}`}
                    className={`rounded-full px-3 py-1 font-label-bold text-label-bold transition-colors ${
                      range === r ? 'bg-white/20 text-white' : 'text-primary-fixed-dim hover:text-white'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="relative z-10 flex h-40 items-end justify-between gap-1 pb-2 pt-4">
                {trends?.points.map((p) => (
                  <div key={p.date} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-full bg-white/70 transition-all"
                      style={{ height: `${Math.max(6, (p.steps / maxSteps) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="relative z-10 mt-2 flex items-center justify-between px-2 font-label-bold text-label-bold text-primary-fixed-dim">
                {trends?.points.map((p) => (
                  <span key={p.date}>{p.label}</span>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {insightOpen && daily && <ActivityInsightModal daily={daily} trends={trends} onClose={() => setInsightOpen(false)} />}
      {addWorkoutOpen && <AddWorkoutModal onClose={() => setAddWorkoutOpen(false)} />}
    </div>
  );
}
