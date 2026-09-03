import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { triggerCelebration } from '../../../lib/celebration';
import { useToast } from '../../../components/ui/ToastContext';

export default function WeeklyRecapBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { showToast } = useToast();
  if (dismissed) return null;

  const handleCelebrate = () => {
    triggerCelebration();
    showToast('🎉 New personal best! Keep up the momentum, Grace!');
  };

  return (
    <section
      onClick={handleCelebrate}
      className="relative mb-section-gap cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary-container p-card-padding text-on-primary shadow-glow transition-transform active:scale-[0.99]"
      data-testid="dashboard-weekly-recap-banner"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        data-testid="dashboard-weekly-recap-dismiss"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
          <Sparkles size={18} />
        </div>
        <p className="font-body-sm text-body-sm leading-relaxed">
          <span className="font-headline-md text-sm">Weekly Milestone:</span> You hit 99% of your step goal yesterday! Top fuel: Quinoa Power
          Bowl.
        </p>
      </div>
    </section>
  );
}
