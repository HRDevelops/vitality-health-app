import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { ActionModalProvider, useActionModal } from '../context/ActionModalContext';
import AddActionModal from '../../features/actions/AddActionModal';
import { ToastProvider } from '../../components/ui/ToastContext';

function ShellContent() {
  const { isOpen, close } = useActionModal();
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-background pb-20 shadow-2xl" data-testid="app-shell">
      <Outlet />
      <BottomNav />
      {isOpen && <AddActionModal onClose={close} />}
    </div>
  );
}

export default function AppLayout() {
  return (
    <ToastProvider>
      <ActionModalProvider>
        <ShellContent />
      </ActionModalProvider>
    </ToastProvider>
  );
}
