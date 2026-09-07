import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastContext';

export default function SessionExpiryHandler() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const handler = () => {
      showToast('Your session has expired. Please sign in again.', { duration: 5000 });
      navigate('/login', { replace: true });
    };
    window.addEventListener('vitality:session-expired', handler);
    return () => window.removeEventListener('vitality:session-expired', handler);
  }, [navigate, showToast]);

  return null;
}
