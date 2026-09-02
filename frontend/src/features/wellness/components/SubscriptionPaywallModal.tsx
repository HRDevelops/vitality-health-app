import { Lock, Sparkles, X } from 'lucide-react';

interface SubscriptionPaywallModalProps {
  onClose: () => void;
}

export default function SubscriptionPaywallModal({ onClose }: SubscriptionPaywallModalProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(28,26,39,0.55)] p-container-margin backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid="paywall-modal-overlay"
    >
      <div
        className="relative w-full max-w-sm rounded-[2rem] bg-surface-container-lowest p-8 text-center shadow-[0px_20px_50px_rgba(84,69,207,0.35)] animate-fade-slide-up"
        onClick={(e) => e.stopPropagation()}
        data-testid="paywall-modal"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-surface-container p-2 text-on-surface transition-transform hover:scale-95"
          data-testid="paywall-modal-close-button"
        >
          <X size={16} />
        </button>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary-container shadow-glow">
          <Lock size={26} className="text-white" />
        </div>
        <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">Unlock with Premium</h2>
        <p className="mb-6 font-body-sm text-body-sm text-on-surface-variant">
          This track is exclusive to Vitality Premium members. Upgrade to unlock every meditation and sleep story.
        </p>
        <div className="mb-6 space-y-2 text-left">
          {['Unlimited premium tracks', 'Offline downloads', 'New releases every week'].map((f) => (
            <div key={f} className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
              <Sparkles size={14} className="text-primary" />
              {f}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-full bg-primary py-4 font-label-bold text-label-bold text-on-primary shadow-glow transition-transform hover:scale-[1.02]"
          data-testid="paywall-upgrade-button"
        >
          Go Premium
        </button>
      </div>
    </div>
  );
}
