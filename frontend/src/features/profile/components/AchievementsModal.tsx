import { Trophy, Droplet, Headphones, Flame, PieChart } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useDashboardMetrics } from '../../../services/api/dashboard';
import { useActivityTrends } from '../../../services/api/activity';

type BadgeStatus = 'unlocked' | 'in-progress' | 'locked';

interface AchievementsModalProps {
  onClose: () => void;
}

const STATUS_STYLES: Record<BadgeStatus, { pill: string; iconWrap: string; label: string }> = {
  unlocked: { pill: 'bg-primary text-on-primary', iconWrap: 'bg-primary text-on-primary', label: 'Unlocked' },
  'in-progress': { pill: 'bg-secondary-fixed text-on-secondary-fixed-variant', iconWrap: 'bg-secondary-fixed/60 text-on-secondary-fixed-variant', label: 'In Progress' },
  locked: { pill: 'bg-surface-variant text-outline', iconWrap: 'bg-surface-variant text-outline', label: 'Locked' },
};

export default function AchievementsModal({ onClose }: AchievementsModalProps) {
  const { data: metrics } = useDashboardMetrics();
  const { data: trends } = useActivityTrends('week');

  const steps = metrics?.steps ?? 0;
  const stepsGoal = metrics?.stepsGoal ?? 10000;
  const waterMl = metrics?.waterMl ?? 0;
  const waterGoalMl = metrics?.waterGoalMl ?? 2000;
  const daysLogged = trends ? trends.points.filter((p) => p.steps > 0).length : 0;
  const totalDays = trends?.points.length ?? 7;

  const statusFor = (ratio: number): BadgeStatus => (ratio >= 0.95 ? 'unlocked' : ratio > 0 ? 'in-progress' : 'locked');

  const badges: { id: string; title: string; subtitle: string; status: BadgeStatus; icon: typeof Trophy }[] = [
    {
      id: '10k-club',
      title: '10k Club',
      subtitle: `${steps.toLocaleString()} / ${stepsGoal.toLocaleString()} steps today`,
      status: statusFor(steps / stepsGoal),
      icon: Trophy,
    },
    {
      id: 'hydration-hero',
      title: 'Hydration Hero',
      subtitle: `${waterMl.toLocaleString()} / ${waterGoalMl.toLocaleString()} ml today`,
      status: statusFor(waterMl / waterGoalMl),
      icon: Droplet,
    },
    {
      id: 'mindful-master',
      title: 'Mindful Master',
      subtitle: '3 podcast sessions completed',
      status: 'unlocked',
      icon: Headphones,
    },
    {
      id: '7-day-streak',
      title: '7-Day Streak',
      subtitle: `${daysLogged}/${totalDays} days logged`,
      status: statusFor(daysLogged / totalDays),
      icon: Flame,
    },
    {
      id: 'macro-balancer',
      title: 'Macro Balancer',
      subtitle: 'Log balanced macros for 3 days to unlock',
      status: 'locked',
      icon: PieChart,
    },
  ];

  return (
    <BottomSheet title="Achievements" subtitle="Your milestones so far" onClose={onClose} testId="achievements-modal-overlay">
      <div className="grid grid-cols-2 gap-3" data-testid="achievements-modal">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const style = STATUS_STYLES[badge.status];
          return (
            <div
              key={badge.id}
              data-testid={`achievement-badge-${badge.id}`}
              className="flex flex-col items-center rounded-2xl bg-surface-container-low p-4 text-center shadow-sm"
            >
              <span className={`mb-3 rounded-full px-3 py-1 font-label-bold text-[10px] uppercase ${style.pill}`} data-testid={`achievement-status-${badge.id}`}>
                {style.label}
              </span>
              <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${style.iconWrap}`}>
                <Icon size={24} />
              </div>
              <h4 className="mb-1 font-headline-md text-sm text-on-surface">{badge.title}</h4>
              <p className="font-body-sm text-[11px] text-on-surface-variant">{badge.subtitle}</p>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}
