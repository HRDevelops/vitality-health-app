import { useEffect, useState } from 'react';
import { Bell, Sun, Droplet, Footprints, Scale, Flame, ChevronRight, HeartPulse } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardMetrics } from '../../services/api/dashboard';
import { useHealthMetricSummary } from '../../services/api/healthMetrics';
import { HealthMetricType } from '../../types/domain';
import { useAuth } from '../../core/context/AuthContext';
import { useUnits } from '../../core/context/UnitsContext';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import NotificationsSheet from '../../components/ui/NotificationsSheet';
import HealthScoreCard from './components/HealthScoreCard';
import HealthScoreModal from './components/HealthScoreModal';
import MetricCard from './components/MetricCard';
import WeeklyRecapBanner from './components/WeeklyRecapBanner';
import WeeklyDigestModal from './components/WeeklyDigestModal';
import LogWaterModal from './components/LogWaterModal';
import HealthMetricCard from '../health/components/HealthMetricCard';
import LogHealthMetricModal from '../health/components/LogHealthMetricModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { displayName } = useAuth();
  const { formatWeight, formatVolume } = useUnits();
  const { data, isLoading, isError } = useDashboardMetrics();
  const { data: healthSummary } = useHealthMetricSummary();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [healthScoreModalOpen, setHealthScoreModalOpen] = useState(false);
  const [weeklyDigestOpen, setWeeklyDigestOpen] = useState(false);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [healthModalType, setHealthModalType] = useState<HealthMetricType>('blood_pressure');
  const [healthModalLock, setHealthModalLock] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.openWeeklyDigest) {
      setWeeklyDigestOpen(true);
    }
    if ((location.state as any)?.openLogWater) {
      setWaterModalOpen(true);
    }
  }, [location.state]);

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div data-testid="dashboard-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background px-container-margin py-4">
        <div className="flex items-center gap-element-gap">
          <button
            onClick={() => navigate('/profile')}
            className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-surface-variant"
            data-testid="dashboard-avatar-button"
          >
            {data?.avatarUrl && <img src={data.avatarUrl} alt="Profile" className="h-full w-full object-cover" />}
          </button>
          <div>
            <span className="flex items-center gap-1 font-label-bold text-label-bold text-primary">
              <Sun size={14} />
              {todayLabel}
            </span>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface" data-testid="dashboard-greeting">
              Hi, {displayName ?? data?.greetingName ?? '...'}
            </h1>
          </div>
        </div>
        <button
          onClick={() => setNotificationsOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
          data-testid="dashboard-notifications-button"
        >
          <Bell size={22} />
        </button>
      </header>

      <main className="px-container-margin pb-8">
        {isLoading && <DashboardSkeleton />}
        {isError && (
          <p className="py-10 text-center font-body-sm text-body-sm text-error" data-testid="dashboard-error">
            Couldn&apos;t load your dashboard. Pull to refresh.
          </p>
        )}
        {data && (
          <>
            <HealthScoreCard score={data.healthScore} note={data.healthScoreNote} onReadMore={() => setHealthScoreModalOpen(true)} />
            <WeeklyRecapBanner onViewDigest={() => setWeeklyDigestOpen(true)} />
            <div className="mb-element-gap flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">Metrics</h2>
            </div>
            <div className="grid grid-cols-2 gap-gutter">
              <MetricCard
                testId="metric-card-calories"
                label="Calories"
                value={String(data.caloriesConsumed)}
                unit="cal"
                subtext="today so far"
                gradient="bg-gradient-to-br from-[#9b89f8] to-[#6d60e9]"
                percent={Math.min(100, Math.round((data.caloriesConsumed / data.caloriesGoal) * 100))}
                ringColor="#3ee5fe"
                icon={
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-md">
                    <Flame size={20} className="text-white" />
                  </div>
                }
                onClick={() => navigate('/nutrition')}
              />
              <MetricCard
                testId="metric-card-weight"
                label="Weight"
                value={formatWeight(data.weightKg).value}
                unit={formatWeight(data.weightKg).unit}
                subtext="last update"
                gradient="bg-gradient-to-br from-[#b8a3ff] to-[#8d79fc]"
                icon={
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                    <Scale size={28} className="text-white" />
                  </div>
                }
                onClick={() => navigate('/profile')}
              />
              <MetricCard
                testId="metric-card-water"
                label="Water"
                value={formatVolume(data.waterMl).value}
                unit={formatVolume(data.waterMl).unit}
                subtext="last update"
                gradient="bg-gradient-to-br from-[#4db4ff] to-[#0089f2]"
                icon={<Droplet size={40} className="opacity-90" />}
                onClick={() => setWaterModalOpen(true)}
              />
              <MetricCard
                testId="metric-card-steps"
                label="Steps"
                value={data.steps.toLocaleString()}
                subtext="today"
                gradient="bg-gradient-to-br from-[#535b75] to-[#3a4057]"
                percent={Math.min(100, Math.round((data.steps / data.stepsGoal) * 100))}
                ringColor="#c5c0ff"
                icon={<Footprints size={20} />}
                onClick={() => navigate('/activity')}
              />
            </div>

            {/* Clinical Health Vitals Section */}
            <div className="mt-8 space-y-3" data-testid="dashboard-clinical-vitals-section">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse size={18} className="text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Clinical Vitals
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/health')}
                  className="flex items-center gap-0.5 text-xs font-bold text-primary transition-colors hover:text-primary-container"
                  data-testid="view-health-tab-link"
                >
                  <span>View All</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <HealthMetricCard
                  type="blood_pressure"
                  metric={healthSummary?.latestBp ?? null}
                  onLogClick={() => {
                    setHealthModalType('blood_pressure');
                    setHealthModalLock(true);
                    setHealthModalOpen(true);
                  }}
                />
                <HealthMetricCard
                  type="blood_glucose"
                  metric={healthSummary?.latestGlucose ?? null}
                  onLogClick={() => {
                    setHealthModalType('blood_glucose');
                    setHealthModalLock(true);
                    setHealthModalOpen(true);
                  }}
                />
              </div>

              {/* Non-Diagnostic Educational Disclaimer */}
              <div className="rounded-xl border border-slate-200/50 bg-slate-100/70 p-3 text-center">
                <p className="text-[11px] leading-relaxed text-slate-500 italic" data-testid="clinical-disclaimer">
                  Educational &amp; tracking support only. Not a medical diagnosis. If you experience severe symptoms, seek immediate emergency medical care.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {notificationsOpen && <NotificationsSheet onClose={() => setNotificationsOpen(false)} />}
      {healthScoreModalOpen && data && <HealthScoreModal score={data.healthScore} onClose={() => setHealthScoreModalOpen(false)} />}
      {weeklyDigestOpen && <WeeklyDigestModal onClose={() => setWeeklyDigestOpen(false)} />}
      {waterModalOpen && <LogWaterModal onClose={() => setWaterModalOpen(false)} />}
      <LogHealthMetricModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        initialType={healthModalType}
        lockType={healthModalLock}
      />
    </div>
  );
}
