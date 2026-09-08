import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastContext';

const NUDGE_KEY_PREFIX = 'vitality_weekly_digest_nudged_';
const FORCE_KEY = 'vitality_force_weekly_nudge';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function WeeklyDigestNudge() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    const enabled = localStorage.getItem('vitality_notif_weekly_digest') !== 'false';
    if (!enabled) return;

    const today = todayKey();
    const isSunday = new Date().getDay() === 0;
    const forced = localStorage.getItem(FORCE_KEY) === 'true';
    if (!isSunday && !forced) return;
    if (localStorage.getItem(`${NUDGE_KEY_PREFIX}${today}`)) return;

    const timer = setTimeout(() => {
      firedRef.current = true;
      localStorage.setItem(`${NUDGE_KEY_PREFIX}${today}`, '1');
      showToast('Your Weekly Digest is ready! Tap to view your wins.', {
        duration: 7000,
        action: { label: 'View', onClick: () => navigate('/dashboard', { state: { openWeeklyDigest: true } }) },
      });
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate, showToast]);

  return null;
}
