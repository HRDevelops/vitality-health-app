import confetti from 'canvas-confetti';

const CELEBRATION_COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981'];

export function triggerCelebration() {
  const durationMs = 2000;
  const end = Date.now() + durationMs;

  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: CELEBRATION_COLORS });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: CELEBRATION_COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
