import { useState } from 'react';
import { Bell, Sun, Droplet, Footprints, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics } from '../../services/api/dashboard';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import NotificationsSheet from '../../components/ui/NotificationsSheet';
import HealthScoreCard from './components/HealthScoreCard';
import HealthScoreModal from './components/HealthScoreModal';
import MetricCard from './components/MetricCard';
import WeeklyRecapBanner from './components/WeeklyRecapBanner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboardMetrics();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [healthScoreModalOpen, setHealthScoreModalOpen] = useState(false);

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
              Hi, {data?.greetingName ?? '...'}
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
            <WeeklyRecapBanner />
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
                onClick={() => navigate('/nutrition')}
              />
              <MetricCard
                testId="metric-card-weight"
                label="Weight"
                value={String(data.weightKg)}
                unit="kg"
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
                value={String(data.waterMl)}
                unit="ml"
                subtext="last update"
                gradient="bg-gradient-to-br from-[#4db4ff] to-[#0089f2]"
                icon={<Droplet size={40} className="opacity-90" />}
                onClick={() => navigate('/nutrition')}
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
          </>
        )}
      </main>

      {notificationsOpen && <NotificationsSheet onClose={() => setNotificationsOpen(false)} />}
      {healthScoreModalOpen && data && <HealthScoreModal score={data.healthScore} onClose={() => setHealthScoreModalOpen(false)} />}
    </div>
  );
}
