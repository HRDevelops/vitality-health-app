import { useState } from 'react';
import {
  Trophy,
  Users,
  GraduationCap,
  Calendar,
  Sparkles,
  Plus,
  Leaf,
  ShieldAlert,
} from 'lucide-react';
import {
  LeaderboardTier,
  LeaderboardTimeframe,
  CampusLeaderboardEntry,
} from '../../types/domain';
import {
  useIndividualLeaderboard,
  useTeamLeaderboard,
  useUniversityLeaderboard,
} from '../../services/api/leaderboard';
import PodiumCard from './components/PodiumCard';
import LeaderboardItemRow from './components/LeaderboardItemRow';
import JoinTeamModal from './components/JoinTeamModal';

export default function TeamsView() {
  const [tier, setTier] = useState<LeaderboardTier>('INDIVIDUAL');
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all_time');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Queries for each tier
  const individualQuery = useIndividualLeaderboard(timeframe);
  const teamQuery = useTeamLeaderboard(timeframe);
  const universityQuery = useUniversityLeaderboard(timeframe);

  const activeQuery =
    tier === 'INDIVIDUAL'
      ? individualQuery
      : tier === 'TEAMS'
      ? teamQuery
      : universityQuery;

  const entries: CampusLeaderboardEntry[] = activeQuery.data?.entries || [];
  const currentUserEntry = individualQuery.data?.currentUserEntry;
  const currentTeamEntry = teamQuery.data?.currentTeamEntry;
  const currentUniversityEntry = universityQuery.data?.currentUniversityEntry;

  const activeCurrentPlacement =
    tier === 'INDIVIDUAL'
      ? currentUserEntry
      : tier === 'TEAMS'
      ? currentTeamEntry
      : currentUniversityEntry;

  const topThree = entries.slice(0, 3);
  const remainingEntries = entries.length > 3 ? entries.slice(3) : [];

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-[#fcf8ff] pb-36 px-4 pt-5" data-testid="teams-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Trophy size={13} />
            3-Tier Campus League
          </span>
          <h1 className="font-heading text-xl font-black text-slate-900">Leaderboard</h1>
        </div>

        <button
          onClick={() => setIsTeamModalOpen(true)}
          className="flex items-center gap-1 rounded-xl border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm hover:bg-primary/5 transition-all"
        >
          <Users size={14} />
          <span>My Team</span>
        </button>
      </div>

      {/* 3-Tier Segmented Switcher */}
      <div className="mt-4 flex rounded-2xl bg-slate-200/70 p-1">
        <button
          type="button"
          onClick={() => setTier('INDIVIDUAL')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            tier === 'INDIVIDUAL'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={13} />
          <span>Individual</span>
        </button>
        <button
          type="button"
          onClick={() => setTier('TEAMS')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            tier === 'TEAMS'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy size={13} />
          <span>Teams</span>
        </button>
        <button
          type="button"
          onClick={() => setTier('UNIVERSITIES')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
            tier === 'UNIVERSITIES'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap size={13} />
          <span>Campus</span>
        </button>
      </div>

      {/* Timeframe Toggle */}
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-slate-500">
          Ranked by verified Move km & CO2
        </span>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
              timeframe === 'weekly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('all_time')}
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
              timeframe === 'all_time' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Loading State */}
      {activeQuery.isLoading ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-xs font-medium text-slate-500">Calculating verified standings...</p>
        </div>
      ) : entries.length === 0 ? (
        /* Empty State */
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <Trophy size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Move Activities Yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            Log your first walkathon or cycling workout in the Move tab to claim your rank on the campus leaderboard.
          </p>
        </div>
      ) : (
        /* Content with Podium and Ranked List */
        <div className="mt-2 space-y-4 w-full max-w-full overflow-hidden">
          {/* Top 3 Podium */}
          <div className="w-full max-w-full overflow-hidden">
            <PodiumCard entries={topThree} tier={tier} />
          </div>

          {/* Ranked List (Remaining Entries or All if less than 3) */}
          {remainingEntries.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                Contenders #{4} - #{entries.length}
              </h4>
              {remainingEntries.map((entry) => (
                <LeaderboardItemRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          {/* If there are 1, 2, or 3 entries, also show them as list items for accessibility */}
          {entries.length <= 3 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                All Standings
              </h4>
              {entries.map((entry) => (
                <LeaderboardItemRow key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          {/* Anti-Cheat Disclaimer Banner */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-3.5 shadow-2xs flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Anti-Cheat Enforcement:</strong> Activities exceeding human thresholds (&gt;12.0 km/h for walking, &gt;45.0 km/h for cycling) are automatically flagged as motorized fraud and excluded from all campus rankings.
            </p>
          </div>
        </div>
      )}

      {/* "My Rank" Persistent Sticky Bottom Card */}
      <div className="fixed bottom-[88px] left-0 right-0 z-30 mx-auto w-full max-w-md px-3 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-indigo-500/5 rounded-2xl px-3.5 py-2.5 flex items-center justify-between">
          {activeCurrentPlacement ? (
            <>
              <div className="flex items-center min-w-0 flex-1 mr-2">
                <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                  #{activeCurrentPlacement.rank}
                </div>
                <div className="min-w-0 flex-1 ml-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="line-clamp-1 text-xs font-bold text-slate-800">
                      {tier === 'INDIVIDUAL'
                        ? 'Your Standing'
                        : activeCurrentPlacement.name}
                    </span>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary shrink-0">
                      {tier === 'INDIVIDUAL' ? 'You' : tier === 'TEAMS' ? 'Your Team' : 'Campus'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    {activeCurrentPlacement.subtitle || 'Active Contender'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-primary tabular-nums">
                  {activeCurrentPlacement.totalKm.toFixed(1)} km
                </div>
                <div className="text-[10px] text-slate-500 tabular-nums">
                  {activeCurrentPlacement.totalCo2Kg.toFixed(2)} kg CO2
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0 flex-1 mr-2">
                <p className="line-clamp-1 text-xs font-bold text-slate-800">
                  {tier === 'TEAMS' ? 'Not in a team yet' : 'No campus affiliated'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">Join a team to compete</p>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/95 transition-all shrink-0"
              >
                <Plus size={13} />
                <span>Join Team</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Join/Create Team Modal */}
      {isTeamModalOpen && (
        <JoinTeamModal
          onClose={() => setIsTeamModalOpen(false)}
          currentTeamName={currentTeamEntry?.name}
        />
      )}
    </div>
  );
}
