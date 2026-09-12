import { useState } from 'react';
import { X, Users, Plus, Check, School, ShieldCheck } from 'lucide-react';
import {
  useUniversities,
  useTeams,
  useJoinTeam,
  useCreateTeam,
} from '../../../services/api/leaderboard';

interface JoinTeamModalProps {
  onClose: () => void;
  currentTeamName?: string;
}

export default function JoinTeamModal({ onClose, currentTeamName }: JoinTeamModalProps) {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [selectedUniId, setSelectedUniId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: universities, isLoading: loadingUnis } = useUniversities();
  const { data: teams, isLoading: loadingTeams } = useTeams(selectedUniId || undefined);

  const joinTeamMutation = useJoinTeam();
  const createTeamMutation = useCreateTeam();

  const handleJoin = async () => {
    if (!selectedTeamId) {
      setErrorMsg('Please select a team to join');
      return;
    }
    setErrorMsg(null);
    try {
      await joinTeamMutation.mutateAsync(selectedTeamId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to join team');
    }
  };

  const handleCreate = async () => {
    if (!newTeamName.trim()) {
      setErrorMsg('Team name is required');
      return;
    }
    if (!selectedUniId) {
      setErrorMsg('Please select a university');
      return;
    }
    setErrorMsg(null);
    try {
      await createTeamMutation.mutateAsync({
        name: newTeamName.trim(),
        universityId: selectedUniId,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to create team');
    }
  };

  const isSubmitting = joinTeamMutation.isPending || createTeamMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Teams</h3>
              <p className="text-[11px] text-slate-500">
                {currentTeamName ? `Current Team: ${currentTeamName}` : 'Join or create a team'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('join');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              mode === 'join' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Join Existing Team
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              mode === 'create' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
            }`}
          >
            Register New Team
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-clay/30 bg-clay/5 p-3 text-xs text-clay font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <div className="mt-4 space-y-4">
          {/* University Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <School size={13} className="text-slate-400" />
              Select University
            </label>
            <select
              value={selectedUniId}
              onChange={(e) => {
                setSelectedUniId(e.target.value);
                setSelectedTeamId('');
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose your campus --</option>
              {universities?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.shortCode})
                </option>
              ))}
            </select>
          </div>

          {mode === 'join' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Users size={13} className="text-slate-400" />
                Select Team
              </label>
              {loadingTeams ? (
                <p className="text-xs text-slate-400 py-2">Loading teams...</p>
              ) : !selectedUniId ? (
                <p className="text-xs text-slate-400 py-2">Select a university first to view teams.</p>
              ) : teams && teams.length > 0 ? (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        selectedTeamId === t.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold">{t.name}</span>
                        <p className="text-[10px] text-slate-500">
                          {t.memberCount} {t.memberCount === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                      {selectedTeamId === t.id && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2">No teams found for this campus. Be the first to create one!</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Plus size={13} className="text-slate-400" />
                Team / Club Name
              </label>
              <input
                type="text"
                placeholder="e.g. NUS Trailblazers, Velocity Cycling"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Anti-Cheat Notice */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2">
            <ShieldCheck size={15} className="text-fern flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-tight">
              Only verified walking and cycling kilometers contribute to your team score. Motorized vehicle fraud is automatically detected and rejected.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={mode === 'join' ? handleJoin : handleCreate}
            className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md transition-all active:scale-98 hover:bg-primary/95 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'join'
              ? 'Confirm & Join Team'
              : 'Create & Join Team'}
          </button>
        </div>
      </div>
    </div>
  );
}
