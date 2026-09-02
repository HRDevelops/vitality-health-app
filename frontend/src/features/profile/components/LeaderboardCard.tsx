import { Trophy } from 'lucide-react';
import { LeaderboardEntry } from '../../../types/domain';

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
}

export default function LeaderboardCard({ entries }: LeaderboardCardProps) {
  return (
    <section
      className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-card-padding shadow-soft"
      data-testid="leaderboard-card"
    >
      <div className="mb-4 flex items-center gap-2">
        <Trophy size={18} className="text-tertiary" />
        <h3 className="font-headline-md text-headline-md text-on-surface">Friends Leaderboard</h3>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            data-testid={`leaderboard-entry-${entry.id}`}
            className={`flex items-center gap-3 rounded-xl p-2 ${entry.isCurrentUser ? 'bg-primary-fixed/20' : ''}`}
          >
            <span className="w-6 text-center font-label-bold text-label-bold text-on-surface-variant">{entry.rank}</span>
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
