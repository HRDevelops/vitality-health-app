import { Trophy, Medal } from 'lucide-react';
import { LeaderboardEntry } from '../../../types/domain';
import { LeaderboardRange } from '../../../services/api/community';

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  range: LeaderboardRange;
  onRangeChange: (range: LeaderboardRange) => void;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={18} className="text-amber-500" data-testid="leaderboard-rank-badge-1" />;
  if (rank === 2) return <Medal size={18} className="text-slate-400" data-testid="leaderboard-rank-badge-2" />;
  if (rank === 3) return <Medal size={18} className="text-amber-700" data-testid="leaderboard-rank-badge-3" />;
  return (
    <span className="font-label-bold text-label-bold text-on-surface-variant" data-testid={`leaderboard-rank-badge-${rank}`}>
      {rank}
    </span>
  );
}

export default function LeaderboardCard({ entries, range, onRangeChange }: LeaderboardCardProps) {
  return (
    <section
      className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-card-padding shadow-soft"
      data-testid="leaderboard-card"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-tertiary" />
          <h3 className="font-headline-md text-headline-md text-on-surface">Friends Leaderboard</h3>
        </div>
        <div className="flex rounded-full bg-surface-container p-1" data-testid="leaderboard-range-toggle">
          {(['today', 'week'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              data-testid={`leaderboard-range-${r}`}
              className={`rounded-full px-3 py-1 font-label-bold text-[11px] uppercase transition-colors ${
                range === r ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {r === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            data-testid={`leaderboard-entry-${entry.id}`}
            className={`flex items-center gap-3 rounded-xl p-2 ${entry.isCurrentUser ? 'bg-primary-fixed/20' : ''}`}
          >
            <div className="flex w-6 flex-shrink-0 items-center justify-center">
              <RankBadge rank={entry.rank} />
            </div>
            <img src={entry.avatarUrl} alt={entry.name} className="h-10 w-10 rounded-full object-cover" />
            <span className="flex-1 font-body-lg text-body-lg font-semibold text-on-surface">
              {entry.isCurrentUser ? `${entry.name} (You)` : entry.name}
            </span>
            <span className="font-label-bold text-label-bold text-on-surface-variant">{entry.steps.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
