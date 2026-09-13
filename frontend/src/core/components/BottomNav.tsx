import { Home, Compass, Plus, Footprints, User, LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useActionModal } from '../context/ActionModalContext';

interface NavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  testId: string;
}

function NavItem({ to, label, icon: Icon, testId }: NavItemProps) {
  const location = useLocation();
  const isHome = to === '/dashboard';
  const isActive = isHome
    ? location.pathname === '/dashboard' || location.pathname === '/'
    : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      data-testid={testId}
      className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${
        isActive ? 'text-primary font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] tracking-tight">{label}</span>
    </NavLink>
  );
}

export default function BottomNav() {
  const { open } = useActionModal();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-16 w-full max-w-md items-center justify-between rounded-t-[24px] bg-white px-2 shadow-[0px_-4px_20px_rgba(84,69,207,0.08)] border-t border-slate-100"
      data-testid="bottom-nav"
    >
      {/* 1. Home */}
      <NavItem to="/dashboard" label="Home" icon={Home} testId="nav-home" />

      {/* 2. Explore */}
      <NavItem to="/explore" label="Explore" icon={Compass} testId="nav-explore" />

      {/* 3. Center FAB [+] */}
      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={open}
          data-testid="nav-center-fab"
          aria-label="Add Action"
          className="relative -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:bg-primary/95 focus:outline-none"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      {/* 4. Move */}
      <NavItem to="/move" label="Move" icon={Footprints} testId="nav-move" />

      {/* 5. Profile */}
      <NavItem to="/profile" label="Profile" icon={User} testId="nav-profile" />
    </nav>
  );
}

