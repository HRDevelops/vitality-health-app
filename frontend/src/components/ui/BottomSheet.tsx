import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface BottomSheetProps {
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}

export default function BottomSheet({ title, subtitle, onClose, children, testId }: BottomSheetProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(28,26,39,0.45)] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid={testId ?? 'bottom-sheet-overlay'}
    >
      <div
        className="w-full max-w-md rounded-t-[2rem] bg-surface-container-lowest p-container-margin pb-10 shadow-[0px_-10px_40px_rgba(84,69,207,0.2)] animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-outline-variant" />
        {title && (
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
              {subtitle && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-surface-container p-2 text-on-surface transition-transform hover:scale-95"
              data-testid="bottom-sheet-close-button"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
