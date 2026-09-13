import { Leaf } from 'lucide-react';
import { CampusLeaderboardEntry } from '../../../types/domain';

interface LeaderboardItemRowProps {
  entry: CampusLeaderboardEntry;
}

export default function LeaderboardItemRow({ entry }: LeaderboardItemRowProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl p-3 border bg-white shadow-sm shadow-indigo-500/5 hover:shadow-md transition-shadow ${
        entry.isCurrent
          ? 'border-primary/40 bg-indigo-50/20 ring-1 ring-primary/30'
          : 'border-slate-100'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Rank Number */}
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[12px] font-bold text-slate-600 tabular-nums">
          #{entry.rank}
        </span>

        {/* Avatar or Logo */}
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
          {entry.avatarUrl || entry.logoUrl ? (
            <img
              src={entry.avatarUrl || entry.logoUrl}
              alt={entry.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary bg-primary/10">
              {entry.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold text-slate-900" title={entry.name}>
              {entry.name}
            </span>
            {entry.isCurrent && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary uppercase tracking-wider">
                You
              </span>
            )}
          </div>
          {entry.subtitle && (
            <p className="truncate text-[10px] text-slate-500">{entry.subtitle}</p>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="text-right flex-shrink-0 pl-2">
        <div className="font-label-bold text-sm text-slate-900 tabular-nums">
          {entry.totalKm.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">km</span>
        </div>
        <div className="flex items-center justify-end gap-1 text-[10px] font-medium text-emerald-700 tabular-nums">
          <Leaf size={10} className="text-emerald-600" />
          <span>{entry.totalCo2Kg.toFixed(2)} kg</span>
        </div>
      </div>
    </div>
  );
}
