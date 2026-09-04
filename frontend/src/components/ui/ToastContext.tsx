import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  action?: ToastAction;
  duration?: number;
}

interface ToastState {
  message: string;
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    setToast({ message, action: options?.action });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), options?.duration ?? 2200);
  }, []);

  const handleActionClick = () => {
    toast?.action?.onClick();
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`fixed bottom-28 left-1/2 z-[55] flex -translate-x-1/2 items-center gap-3 rounded-full bg-inverse-surface px-6 py-3 font-label-bold text-label-bold text-inverse-on-surface shadow-lg transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
        }`}
        data-testid="app-toast"
      >
        <span>{toast?.message}</span>
        {toast?.action && (
          <button
            onClick={handleActionClick}
            className="flex-shrink-0 whitespace-nowrap rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors hover:bg-white/30"
            data-testid="app-toast-action-button"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
