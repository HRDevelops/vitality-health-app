import { Sparkles } from 'lucide-react';
import { useUserProfile } from '../../services/api/user';
import { useSetDemoMode } from '../../services/api/onboarding';
import { useToast } from '../../components/ui/ToastContext';

export default function DemoModeToggle() {
  const { data: user } = useUserProfile();
  const setDemoMutation = useSetDemoMode();
  const { showToast } = useToast();

  const isDemo = Boolean(user?.isDemo);

  const handleToggle = async () => {
    const nextState = !isDemo;
    try {
      await setDemoMutation.mutateAsync(nextState);
      showToast(
        nextState
          ? 'Demo Sandbox Mode enabled. Sample clinical data active.'
          : 'Demo Sandbox Mode disabled. Live profile restored.'
      );
    } catch {
      showToast('Failed to toggle demo mode.');
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
          <Sparkles size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Demo Sandbox Mode</h4>
          <p className="text-[10px] text-slate-500">
            {isDemo ? 'Running simulated clinical data' : 'Running live telemetry'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={setDemoMutation.isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDemo ? 'bg-primary' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDemo ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
