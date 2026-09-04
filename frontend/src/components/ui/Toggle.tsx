interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  testId?: string;
}

export default function Toggle({ checked, onChange, testId }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      data-testid={testId}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out ${
        checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
