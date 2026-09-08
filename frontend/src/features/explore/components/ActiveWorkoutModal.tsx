import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, CheckCircle2 } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';
import { useLogWorkout } from '../../../services/api/activity';
import { useToast } from '../../../components/ui/ToastContext';
import { WorkoutDetail } from './WorkoutDetailModal';

interface ActiveWorkoutModalProps {
  workout: WorkoutDetail;
  onClose: () => void;
}

function parseSteps(steps: string[]) {
  return steps.map((s) => {
    const match = s.match(/(\d+)\s*min/i);
    const minutes = match ? parseInt(match[1], 10) : 5;
    const label = s.split('—')[0].trim();
    return { label, minutes };
  });
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function ActiveWorkoutModal({ workout, onClose }: ActiveWorkoutModalProps) {
  const parsedSteps = parseSteps(workout.steps);
  const totalMinutes = parsedSteps.reduce((sum, s) => sum + s.minutes, 0) || workout.logPayload.activeMinutes || 20;
  const totalSeconds = totalMinutes * 60;

  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logWorkout = useLogWorkout();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isRunning || finished) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setIsRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, finished]);

  const elapsed = totalSeconds - remaining;
  let cumulative = 0;
  let activeStepIndex = 0;
  for (let i = 0; i < parsedSteps.length; i++) {
    cumulative += parsedSteps[i].minutes * 60;
    activeStepIndex = i;
    if (elapsed < cumulative) break;
  }

  const percentComplete = Math.min(100, (elapsed / totalSeconds) * 100);
  const RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - percentComplete / 100);

  const handleFinish = () => {
    setIsRunning(false);
    setFinished(true);
    logWorkout.mutate(workout.logPayload, {
      onSuccess: () => {
        showToast(`${workout.title} logged! Great job.`);
        onClose();
      },
    });
  };

  const handleStop = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
  };

  return (
    <BottomSheet title={workout.title} subtitle="Active Workout" onClose={onClose} testId="active-workout-modal-overlay">
      <div className="space-y-6" data-testid="active-workout-modal">
        <div className="flex flex-col items-center rounded-3xl bg-primary p-8 text-on-primary">
          <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }} data-testid="active-workout-progress-ring">
            <svg width={220} height={220} className="-rotate-90">
              <defs>
                <linearGradient id="workoutRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#28d9f3" />
                  <stop offset="100%" stopColor="#c5b8ff" />
                </linearGradient>
              </defs>
              <circle cx={110} cy={110} r={RADIUS} stroke="rgba(255,255,255,0.2)" strokeWidth={14} fill="none" />
              <circle
                cx={110}
                cy={110}
                r={RADIUS}
                stroke="url(#workoutRingGradient)"
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <p className="font-metric-display text-5xl font-bold" data-testid="active-workout-timer">
                {formatTime(remaining)}
              </p>
              <p className="mt-1 font-body-sm text-body-sm opacity-80">remaining</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {parsedSteps.map((s, i) => (
            <div
              key={s.label}
              data-testid={`active-workout-step-${i}`}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                i === activeStepIndex && !finished
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/70 font-label-bold text-[11px] text-primary">
                {i < activeStepIndex || finished ? <CheckCircle2 size={16} /> : i + 1}
              </span>
              <span className="font-body-sm text-body-sm">
                {s.label} — {s.minutes} min
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning((r) => !r)}
            disabled={finished || remaining === 0}
            data-testid="active-workout-play-pause-button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-transform hover:scale-105 disabled:opacity-50"
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button
            onClick={handleStop}
            disabled={finished}
            data-testid="active-workout-stop-button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-on-surface shadow-sm transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Square size={20} />
          </button>
        </div>

        <button
          onClick={handleFinish}
          disabled={logWorkout.isPending || finished}
          className="w-full rounded-xl bg-primary py-4 font-headline-md text-sm text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          data-testid="active-workout-finish-button"
        >
          {logWorkout.isPending ? 'Logging...' : 'Finish Workout'}
        </button>
      </div>
    </BottomSheet>
  );
}
