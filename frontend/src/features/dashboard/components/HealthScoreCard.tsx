interface HealthScoreCardProps {
  score: number;
  note: string;
  onReadMore: () => void;
}

export default function HealthScoreCard({ score, note, onReadMore }: HealthScoreCardProps) {
  return (
    <section className="mb-section-gap" data-testid="health-score-card">
      <div className="flex items-center gap-container-margin rounded-[24px] bg-surface-container-lowest p-card-padding shadow-soft">
        <div
          className="flex h-20 w-20 flex-shrink-0 rotate-[-5deg] items-center justify-center rounded-[20px] bg-primary-container font-metric-display text-metric-display text-on-primary-container shadow-md"
          data-testid="health-score-value"
        >
          {score}
        </div>
        <div className="flex-1">
          <h2 className="mb-1 font-headline-md text-headline-md text-on-surface">Health Score</h2>
          <p className="mb-2 font-body-sm text-body-sm text-on-surface-variant">{note}</p>
          <button onClick={onReadMore} className="font-label-bold text-label-bold text-primary hover:underline" data-testid="health-score-read-more">
            Read more
          </button>
        </div>
      </div>
    </section>
  );
}
