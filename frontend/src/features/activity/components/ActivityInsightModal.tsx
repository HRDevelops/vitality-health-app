import { Flame, MapPin, Clock, TrendingUp } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { ActivityDaily, ActivityTrends } from '../../../types/domain';

interface ActivityInsightModalProps {
  daily: ActivityDaily;
  trends?: ActivityTrends;
  onClose: () => void;
}

export default function ActivityInsightModal({ daily, trends, onClose }: ActivityInsightModalProps) {
  return (
    <BottomSheet title="Activity Insight" subtitle="Your detailed breakdown for today" onClose={onClose} testId="activity-insight-modal-overlay">
      <div className="space-y-5" data-testid="activity-insight-modal">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-container p-4">
            <div className="mb-2 flex items-center gap-2 text-secondary">
              <Flame size={16} />
              <span className="font-label-bold text-label-bold">Calories</span>
            </div>
            <p className="font-metric-display text-metric-display text-on-surface">{daily.caloriesBurned} kcal</p>
          </div>
          <div className="rounded-2xl bg-surface-container p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <MapPin size={16} />
              <span className="font-label-bold text-label-bold">Distance</span>
            </div>
            <p className="font-metric-display text-metric-display text-on-surface">{daily.distanceKm} km</p>
          </div>
          <div className="rounded-2xl bg-surface-container p-4">
            <div className="mb-2 flex items-center gap-2 text-on-secondary-fixed-variant">
              <Clock size={16} />
              <span className="font-label-bold text-label-bold">Active time</span>
            </div>
            <p className="font-metric-display text-metric-display text-on-surface">{daily.activeMinutes} min</p>
          </div>
          <div className="rounded-2xl bg-surface-container p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <TrendingUp size={16} />
              <span className="font-label-bold text-label-bold">Goal progress</span>
            </div>
            <p className="font-metric-display text-metric-display text-on-surface">{daily.progressPercent}%</p>
          </div>
        </div>
        {trends && (
          <div className="rounded-2xl bg-surface-container p-4">
            <p className="mb-2 font-body-sm text-body-sm text-on-surface-variant">
              You averaged <span className="font-semibold text-on-surface">{trends.avgSteps.toLocaleString()}</span> steps over the last{' '}
              {trends.points.length} days, totalling {trends.totalSteps.toLocaleString()} steps.
            </p>
          </div>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          You&apos;re at {daily.steps.toLocaleString()} of {daily.goalSteps.toLocaleString()} steps today. Keep moving to close the gap before
          the day ends.
        </p>
      </div>
    </BottomSheet>
  );
}
