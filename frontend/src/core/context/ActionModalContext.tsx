import { createContext, useContext, useState, ReactNode } from 'react';

interface ActionModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ActionModalContext = createContext<ActionModalContextValue | null>(null);

export function ActionModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ActionModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </ActionModalContext.Provider>
  );
}

export function useActionModal() {
  const ctx = useContext(ActionModalContext);
  if (!ctx) throw new Error('useActionModal must be used within ActionModalProvider');
  return ctx;
}
