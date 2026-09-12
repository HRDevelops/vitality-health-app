import { Home, HeartPulse, Footprints, Trophy, HeartHandshake } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home, testId: 'nav-home' },
  { to: '/health', label: 'Health', icon: HeartPulse, testId: 'nav-health' },
  { to: '/move', label: 'Move', icon: Footprints, testId: 'nav-move' },
  { to: '/teams', label: 'Teams', icon: Trophy, testId: 'nav-teams' },
  { to: '/care-circle', label: 'Circle', icon: HeartHandshake, testId: 'nav-care-circle' },
];

function NavItem({ to, label, icon: Icon, testId }: (typeof navItems)[number]) {
  return (
    <NavLink
      to={to}
      data-testid={testId}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-transform duration-200 ${
          isActive ? 'scale-105 text-primary font-bold' : 'text-slate-400 hover:text-slate-600'
        }`
      }
    >
      <Icon size={20} />
      <span className="text-[10px] tracking-tight">{label}</span>
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-16 w-full max-w-md items-center justify-around rounded-t-[24px] bg-white px-2 shadow-[0px_-4px_20px_rgba(84,69,207,0.08)] border-t border-slate-100"
      data-testid="bottom-nav"
    >
      {navItems.map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}
