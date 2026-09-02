import { Home, Compass, Activity, User, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useActionModal } from '../context/ActionModalContext';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: Home, testId: 'nav-home' },
  { to: '/explore', label: 'Explore', icon: Compass, testId: 'nav-explore' },
];

const tabsRight = [
  { to: '/activity', label: 'Activity', icon: Activity, testId: 'nav-activity' },
  { to: '/profile', label: 'Profile', icon: User, testId: 'nav-profile' },
];

function NavItem({ to, label, icon: Icon, testId }: (typeof tabs)[number]) {
  return (
    <NavLink
      to={to}
      data-testid={testId}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-transform duration-200 ${
          isActive ? 'scale-110 text-primary' : 'text-outline hover:text-primary-container'
        }`
      }
    >
      <Icon size={22} />
      <span className="font-label-bold text-[10px] tracking-wide">{label}</span>
    </NavLink>
  );
}

export default function BottomNav() {
  const { open } = useActionModal();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-20 w-full max-w-md items-center justify-around rounded-t-[24px] bg-surface-container-lowest px-2 shadow-[0px_-4px_20px_rgba(115,103,240,0.08)]"
      data-testid="bottom-nav"
    >
      <div className="flex flex-1 items-center justify-around">
        {tabs.map((t) => (
          <NavItem key={t.to} {...t} />
        ))}
      </div>
      <div className="relative -top-6 flex-shrink-0">
        <button
          onClick={open}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-glow transition-transform active:scale-90"
          data-testid="fab-add-button"
          aria-label="Quick add"
        >
          <Plus size={28} />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-around">
        {tabsRight.map((t) => (
          <NavItem key={t.to} {...t} />
        ))}
      </div>
    </nav>
  );
}
