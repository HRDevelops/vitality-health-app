import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  testId?: string;
}

export default function TopBar({ title, showBack = false, leftSlot, rightSlot, testId }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-30 flex w-full items-center justify-between bg-background px-container-margin py-4"
      data-testid={testId ?? 'top-bar'}
    >
      <div className="flex items-center gap-element-gap">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container"
            data-testid="top-bar-back-button"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        {leftSlot}
        {title && <h1 className="font-headline-md text-headline-md text-on-surface">{title}</h1>}
      </div>
      {rightSlot}
    </header>
  );
}
