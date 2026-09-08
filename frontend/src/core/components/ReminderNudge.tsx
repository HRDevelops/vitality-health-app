import { useEffect, useRef } from 'react';
import { useReminders } from '../../services/api/reminders';
import { useToast } from '../../components/ui/ToastContext';

const NUDGE_STORAGE_PREFIX = 'vitality_reminder_nudged_';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReminderNudge() {
  const { data: reminders } = useReminders();
  const { showToast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!reminders) return;

    const check = () => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const today = todayKey();

      const due = reminders.find((r) => {
        if (!r.enabled) return false;
        if (localStorage.getItem(`${NUDGE_STORAGE_PREFIX}${r.id}_${today}`)) return false;
        const [h, m] = r.time.split(':').map(Number);
        return h * 60 + m <= nowMinutes;
      });

      if (due) {
        localStorage.setItem(`${NUDGE_STORAGE_PREFIX}${due.id}_${today}`, '1');
        showToast(`⏰ ${due.title} — ${due.subtitle}`, {
          duration: 6000,
          action: { label: 'Got it', onClick: () => {} },
        });
      }
    };

    const initialDelay = setTimeout(check, 4000);
    intervalRef.current = setInterval(check, 60000);
    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reminders, showToast]);

  return null;
}
