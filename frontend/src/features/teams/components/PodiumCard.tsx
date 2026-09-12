import { Trophy, Medal, Award, Leaf } from 'lucide-react';
import { CampusLeaderboardEntry } from '../../../types/domain';

interface PodiumCardProps {
  entries: CampusLeaderboardEntry[];
  tier: 'INDIVIDUAL' | 'TEAMS' | 'UNIVERSITIES';
}

export default function PodiumCard({ entries, tier }: PodiumCardProps) {
  if (!entries || entries.length === 0) return null;

  const first = entries[0];
  const second = entries.length > 1 ? entries[1] : null;
  const third = entries.length > 2 ? entries[2] : null;

  const renderPodiumItem = (
    entry: CampusLeaderboardEntry | null,
    place: 1 | 2 | 3,
    heightClass: string,
    orderClass: string
  ) => {
    if (!entry) {
      return (
        <div className={`min-w-0 w-full flex flex-col items-center justify-end ${orderClass}`}>
          <div className="h-24 w-full rounded-2xl border border-dashed border-slate-200 bg-white/40" />
        </div>
      );
    }

    const isFirst = place === 1;
    const isSecond = place === 2;

    const rankBadgeColor = isFirst
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : isSecond
      ? 'bg-slate-100 text-slate-700 border-slate-300'
      : 'bg-orange-100 text-orange-800 border-orange-300';

    const avatarSize = isFirst ? 'w-14 h-14' : 'w-11 h-11';
    const avatarRing = isFirst
      ? 'ring-3 ring-amber-400 shadow-md'
      : isSecond
      ? 'ring-2 ring-slate-300 shadow-sm'
      : 'ring-2 ring-orange-300 shadow-sm';

    return (
      <div className={`min-w-0 w-full flex flex-col items-center justify-end ${orderClass}`}>
        {/* Avatar / Badge */}
        <div className="relative mb-2 flex flex-col items-center">
          {isFirst && (
            <div className="absolute -top-4 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm">
              <Trophy size={11} />
            </div>
          )}
          <div className={`relative ${avatarSize} overflow-hidden rounded-full bg-surface-container ${avatarRing}`}>
            {entry.avatarUrl || entry.logoUrl ? (
              <img
                src={entry.avatarUrl || entry.logoUrl}
                alt={entry.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                {entry.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span
            className={`absolute -bottom-1.5 flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-black ${rankBadgeColor}`}
          >
            {place}
          </span>
        </div>

        {/* Pillar Card */}
        <div
          className={`min-w-0 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 text-center shadow-xs flex flex-col justify-between ${heightClass} ${
            entry.isCurrent ? 'ring-2 ring-primary bg-primary/[0.02]' : ''
          }`}
        >
          <div className="w-full overflow-hidden">
            <p
              className="text-xs font-semibold text-center line-clamp-2 break-words leading-tight px-0.5 text-slate-800"
              title={entry.name}
            >
              {entry.name}
            </p>
            <p className="truncate text-[10px] font-medium text-slate-500 mt-0.5">
              {entry.subtitle || (tier === 'UNIVERSITIES' ? 'Campus' : 'Student')}
            </p>
          </div>

          <div className="mt-1 pt-1 border-t border-slate-100/80 w-full">
            <div className="text-xs font-bold text-primary tabular-nums">
              {entry.totalKm.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">km</span>
            </div>
            <div className="flex items-center justify-center gap-0.5 text-[10px] text-emerald-700 font-medium tabular-nums truncate">
              <Leaf size={9} className="text-emerald-600 shrink-0" />
              <span>{entry.totalCo2Kg.toFixed(2)} kg</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="my-3 grid grid-cols-3 items-end gap-1.5 w-full max-w-full overflow-hidden px-0.5">
      {/* 2nd Place (Left - order-1) */}
      {renderPodiumItem(second, 2, 'h-36', 'order-1')}
      {/* 1st Place (Center - Tallest - order-2) */}
      {renderPodiumItem(first, 1, 'h-44', 'order-2')}
      {/* 3rd Place (Right - order-3) */}
      {renderPodiumItem(third, 3, 'h-32', 'order-3')}
    </div>
  );
}
