import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import MiniPlayer from './MiniPlayer';
import ReminderNudge from './ReminderNudge';
import { ActionModalProvider, useActionModal } from '../context/ActionModalContext';
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
import AddActionModal from '../../features/actions/AddActionModal';

function ShellContent() {
  const { isOpen, close } = useActionModal();
  const location = useLocation();
  const hideMiniPlayer = location.pathname === '/wellness/podcast';

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-background pb-20 shadow-2xl" data-testid="app-shell">
      <Outlet />
      {!hideMiniPlayer && <MiniPlayer />}
      <BottomNav />
      {isOpen && <AddActionModal onClose={close} />}
      <ReminderNudge />
    </div>
  );
}

export default function AppLayout() {
  return (
    <AudioPlayerProvider>
      <ActionModalProvider>
        <ShellContent />
      </ActionModalProvider>
    </AudioPlayerProvider>
  );
}
