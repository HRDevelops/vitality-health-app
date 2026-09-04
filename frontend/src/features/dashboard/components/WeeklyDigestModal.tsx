import { X, Footprints, Trophy, Flame, Moon, Sparkles, HeartPulse, Share2, Twitter } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useWeeklyDigest } from '../../../services/api/dashboard';
import { useToast } from '../../../components/ui/ToastContext';
import { WeeklyDigest } from '../../../types/domain';

interface WeeklyDigestModalProps {
  onClose: () => void;
}

function formatRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const s = new Date(`${start}T00:00:00.000Z`).toLocaleDateString('en-US', opts);
  const e = new Date(`${end}T00:00:00.000Z`).toLocaleDateString('en-US', opts);
  return `${s} – ${e}`;
}

function buildShareText(data: WeeklyDigest) {
  return [
    `🏆 Grace's Weekly Digest (${formatRange(data.startDate, data.endDate)})`,
    `👣 ${data.totalSteps.toLocaleString()} total steps`,
    `🔥 Best day: ${data.bestStepDay.steps.toLocaleString()} steps (${data.bestStepDay.label})`,
    `🍎 ${data.totalCaloriesConsumed.toLocaleString()} kcal · ${data.macroAdherencePercent}% macro adherence`,
    `🌙 ${data.mindfulnessMinutes} mindfulness minutes`,
    '',
    'Tracked with Vitality 💜',
  ].join('\n');
}

function buildTweetText(data: WeeklyDigest) {
  return `Crushed ${data.totalSteps.toLocaleString()} steps and ${data.podcastSessionsCompleted} mindfulness sessions this week on #VitalityApp! 🏃‍♀️✨`;
}

export default function WeeklyDigestModal({ onClose }: WeeklyDigestModalProps) {
  const { data, isLoading } = useWeeklyDigest();
  const { showToast } = useToast();

  const handleShare = async () => {
    if (!data) return;
    const text = buildShareText(data);
    if (navigator.share) {
      try {
        await navigator.share({ title: "Grace's Weekly Digest", text });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Weekly digest copied to clipboard!');
    } catch {
      showToast('Unable to share right now.');
    }
  };

  const handleShareX = () => {
    if (!data) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildTweetText(data))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <BottomSheet onClose={onClose} testId="weekly-digest-modal-overlay">
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#6d60e9] to-secondary-container p-6 text-on-primary shadow-glow"
        data-testid="weekly-digest-modal"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          data-testid="weekly-digest-close-button"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="mb-6 pr-10">
          <p className="font-label-bold text-[10px] uppercase tracking-wide text-primary-fixed">Weekly Digest</p>
          <h2 className="font-headline-lg text-headline-lg">Grace&apos;s Weekly Stats</h2>
          {data && (
            <p className="mt-1 font-body-sm text-body-sm text-primary-fixed" data-testid="weekly-digest-date-range">
              {formatRange(data.startDate, data.endDate)}
            </p>
          )}
        </div>

        {isLoading && <p className="font-body-sm text-body-sm text-primary-fixed">Loading your week...</p>}

        {data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4" data-testid="weekly-digest-total-steps">
                <Footprints size={18} className="mb-2" />
                <p className="font-metric-display text-metric-display">{data.totalSteps.toLocaleString()}</p>
                <p className="font-body-sm text-[11px] text-primary-fixed">Total Steps</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4" data-testid="weekly-digest-best-day">
                <Trophy size={18} className="mb-2" />
                <p className="font-metric-display text-metric-display">{data.bestStepDay.steps.toLocaleString()}</p>
                <p className="font-body-sm text-[11px] text-primary-fixed">Best Day ({data.bestStepDay.label})</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4" data-testid="weekly-digest-calories">
                <Flame size={18} className="mb-2" />
                <p className="font-metric-display text-metric-display">{data.totalCaloriesConsumed.toLocaleString()}</p>
                <p className="font-body-sm text-[11px] text-primary-fixed">Calories · {data.macroAdherencePercent}% Macro Adherence</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4" data-testid="weekly-digest-mindfulness">
                <Moon size={18} className="mb-2" />
                <p className="font-metric-display text-metric-display">{data.mindfulnessMinutes}</p>
                <p className="font-body-sm text-[11px] text-primary-fixed">Mindfulness Minutes</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={16} />
                <h3 className="font-headline-md text-sm">Milestones This Week</h3>
              </div>
              <ul className="space-y-1.5" data-testid="weekly-digest-milestones">
                {data.milestones.map((m, i) => (
                  <li key={i} className="font-body-sm text-body-sm text-primary-fixed" data-testid={`weekly-digest-milestone-${i}`}>
                    • {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-white/15 pt-4 text-primary-fixed">
              <HeartPulse size={14} />
              <span className="font-label-bold text-[11px] uppercase tracking-wide">Tracked with Vitality</span>
            </div>

            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white/20 py-3 font-label-bold text-label-bold text-on-primary transition-colors hover:bg-white/30"
              data-testid="weekly-digest-share-button"
            >
              <Share2 size={16} />
              Share Digest
            </button>
            <button
              onClick={handleShareX}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-black/25 py-3 font-label-bold text-label-bold text-on-primary transition-colors hover:bg-black/35"
              data-testid="weekly-digest-share-x-button"
            >
              <Twitter size={16} />
              Share on X
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
