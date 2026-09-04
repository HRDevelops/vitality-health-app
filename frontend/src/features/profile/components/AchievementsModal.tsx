import { useEffect, useMemo } from 'react';
import { Trophy, Droplet, Headphones, Flame, PieChart, Moon } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useDashboardMetrics } from '../../../services/api/dashboard';
import { useActivityTrends } from '../../../services/api/activity';
import { useUserProfile } from '../../../services/api/user';
import { useNutritionLogs } from '../../../services/api/nutrition';
import { useToast } from '../../../components/ui/ToastContext';
import { triggerCelebration } from '../../../lib/celebration';

type BadgeStatus = 'unlocked' | 'in-progress' | 'locked';

interface AchievementsModalProps {
  onClose: () => void;
}

const STATUS_STYLES: Record<BadgeStatus, { pill: string; iconWrap: string; label: string }> = {
  unlocked: { pill: 'bg-primary text-on-primary', iconWrap: 'bg-primary text-on-primary', label: 'Unlocked' },
  'in-progress': { pill: 'bg-secondary-fixed text-on-secondary-fixed-variant', iconWrap: 'bg-secondary-fixed/60 text-on-secondary-fixed-variant', label: 'In Progress' },
  locked: { pill: 'bg-surface-variant text-outline', iconWrap: 'bg-surface-variant text-outline', label: 'Locked' },
};

const UNLOCKED_BADGES_STORAGE_KEY = 'vitality_unlocked_badges';
const STREAK_BADGE_IDS = ['mindful-streak', '7-day-streak'];

export default function AchievementsModal({ onClose }: AchievementsModalProps) {
  const { data: metrics } = useDashboardMetrics();
  const { data: trends } = useActivityTrends('week');
  const { data: user } = useUserProfile();
  const { data: nutrition } = useNutritionLogs();
  const { showToast } = useToast();

  const steps = metrics?.steps ?? 0;
  const stepsGoal = metrics?.stepsGoal ?? 10000;
  const waterMl = metrics?.waterMl ?? 0;
  const waterGoalMl = metrics?.waterGoalMl ?? 2000;
  const daysLogged = trends ? trends.points.filter((p) => p.steps > 0).length : 0;
  const totalDays = trends?.points.length ?? 7;
  const podcastSessions = user?.podcastSessionsCompleted ?? 0;
  const podcastStreak = user?.podcastStreakCount ?? 0;
  const macro = nutrition?.macroBreakdown;
  const macroRatio = macro ? Math.min(macro.carbs.percent, macro.protein.percent, macro.fat.percent) / 100 : 0;
  const PODCAST_GOAL = 3;
  const STREAK_GOAL = 3;

  const statusFor = (ratio: number): BadgeStatus => (ratio >= 0.95 ? 'unlocked' : ratio > 0 ? 'in-progress' : 'locked');

  const badges = useMemo<{ id: string; title: string; subtitle: string; status: BadgeStatus; icon: typeof Trophy }[]>(
    () => [
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
        subtitle: `${Math.min(podcastSessions, PODCAST_GOAL)}/${PODCAST_GOAL} podcast sessions completed`,
        status: statusFor(podcastSessions / PODCAST_GOAL),
        icon: Headphones,
      },
      {
        id: 'mindful-streak',
        title: 'Mindful Streak',
        subtitle: `3-Day Zen Streak — ${Math.min(podcastStreak, STREAK_GOAL)}/${STREAK_GOAL} days in a row`,
        status: statusFor(podcastStreak / STREAK_GOAL),
        icon: Moon,
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
        subtitle: macro
          ? `Carbs ${Math.min(100, Math.round(macro.carbs.percent))}% · Protein ${Math.min(100, Math.round(macro.protein.percent))}% · Fat ${Math.min(100, Math.round(macro.fat.percent))}% of daily targets`
          : 'Log balanced carbs, protein and fat today to unlock',
        status: statusFor(macroRatio),
        icon: PieChart,
      },
    ],
    [steps, stepsGoal, waterMl, waterGoalMl, podcastSessions, podcastStreak, daysLogged, totalDays, macro, macroRatio]
  );

  useEffect(() => {
    if (!metrics || !trends || !user || !nutrition) return;
    const unlockedNow = badges.filter((b) => b.status === 'unlocked').map((b) => b.id);
    const prevRaw = localStorage.getItem(UNLOCKED_BADGES_STORAGE_KEY);
    const prev: string[] = prevRaw ? JSON.parse(prevRaw) : [];
    const newlyUnlocked = unlockedNow.filter((id) => !prev.includes(id));
    const streaksEnabled = localStorage.getItem('vitality_notif_streaks') !== 'false';
    const notifiable = newlyUnlocked.filter((id) => streaksEnabled || !STREAK_BADGE_IDS.includes(id));
    if (notifiable.length > 0) {
      triggerCelebration();
      showToast('🎉 Milestone Unlocked!');
    }
    localStorage.setItem(UNLOCKED_BADGES_STORAGE_KEY, JSON.stringify(unlockedNow));
  }, [badges, metrics, trends, user, nutrition]);

  return (
    <BottomSheet title="Achievements" subtitle="Your milestones so far" onClose={onClose} testId="achievements-modal-overlay">
      <div className="grid grid-cols-2 gap-3" data-testid="achievements-modal">
        {badges.map((badge) => {
          const Icon = badge.id === 'mindful-streak' && badge.status === 'unlocked' ? Flame : badge.icon;
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
