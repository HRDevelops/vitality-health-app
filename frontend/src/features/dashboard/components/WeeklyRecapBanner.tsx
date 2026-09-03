import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function WeeklyRecapBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <section
      className="relative mb-section-gap overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary-container p-card-padding text-on-primary shadow-glow"
      data-testid="dashboard-weekly-recap-banner"
    >
      <button
        onClick={() => setDismissed(true)}
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
