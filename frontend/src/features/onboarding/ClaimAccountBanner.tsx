import { useState } from 'react';
import { UserCheck, ShieldAlert, X, Lock, Mail, User } from 'lucide-react';
import { useClaimGuestAccount } from '../../services/api/onboarding';
import { useToast } from '../../components/ui/ToastContext';

export default function ClaimAccountBanner() {
  const { showToast } = useToast();
  const claimMutation = useClaimGuestAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await claimMutation.mutateAsync({ name, email, password });
      showToast('Account claimed successfully! All records have been preserved.');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to claim account.');
    }
  };

  return (
    <>
      <div
        className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 shadow-2xs"
        data-testid="claim-account-banner"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shrink-0 mt-0.5 shadow-xs">
              <UserCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                You are using a Guest Session
              </h4>
              <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                Save your clinical metrics, DASH scans, and movement history permanently.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-primary/95 transition-all"
          >
            Save Records
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                <h3 className="text-base font-bold text-slate-900">Claim Your Health Records</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClaim} className="mt-4 space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your credentials to upgrade from a guest session. All existing blood pressure, glucose, and movement history will stay securely attached to your profile.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Tan"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={claimMutation.isPending}
                className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-primary/95 disabled:opacity-50 mt-2"
              >
                {claimMutation.isPending ? 'Claiming Account...' : 'Permanently Save Records'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
