import { IntensityZone } from '../../../types/domain';

interface WorkoutIntensityChartProps {
  zones: IntensityZone[];
  totalWorkouts: number;
}

export default function WorkoutIntensityChart({ zones, totalWorkouts }: WorkoutIntensityChartProps) {
  const hasData = zones.some((z) => z.minutes > 0);

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-card-padding shadow-soft"
      data-testid="workout-intensity-chart"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-headline-md text-headline-md text-on-surface">Exertion Zones</h3>
        <span className="font-body-sm text-body-sm text-outline">Last 7 days · {totalWorkouts} workouts</span>
      </div>

      {!hasData ? (
        <p className="py-4 text-center font-body-sm text-body-sm text-outline" data-testid="workout-intensity-empty-state">
          Log a workout this week to see your exertion breakdown.
        </p>
      ) : (
        <>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-variant" data-testid="workout-intensity-bar">
            {zones.map(
              (z) =>
                z.percent > 0 && (
                  <div
                    key={z.zone}
                    style={{ width: `${z.percent}%`, backgroundColor: z.color }}
                    className="h-full transition-all"
                    data-testid={`workout-intensity-segment-${z.zone}`}
                    title={`${z.label}: ${z.minutes} min`}
                  />
                )
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {zones.map((z) => (
              <div key={z.zone} className="flex items-center gap-2" data-testid={`workout-intensity-legend-${z.zone}`}>
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: z.color }} />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {z.label} <span className="font-semibold text-on-surface">{z.minutes}m</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
