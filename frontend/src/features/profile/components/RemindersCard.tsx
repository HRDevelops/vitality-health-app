import { BellRing } from 'lucide-react';
import { Reminder } from '../../../types/domain';
import { useToggleReminder } from '../../../services/api/reminders';
import Toggle from '../../../components/ui/Toggle';

interface RemindersCardProps {
  reminders: Reminder[];
}

export default function RemindersCard({ reminders }: RemindersCardProps) {
  const toggleReminder = useToggleReminder();

  return (
    <section
      className="rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-card-padding shadow-soft"
      data-testid="reminders-card"
    >
      <div className="mb-4 flex items-center gap-2">
        <BellRing size={18} className="text-primary" />
        <h3 className="font-headline-md text-headline-md text-on-surface">Reminders</h3>
      </div>
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div key={reminder.id} data-testid={`reminder-${reminder.id}`} className="flex items-center justify-between">
            <div>
              <p className="font-body-lg text-body-lg font-semibold text-on-surface">{reminder.title}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {reminder.subtitle} • {reminder.time}
              </p>
            </div>
            <Toggle
              checked={reminder.enabled}
              onChange={(enabled) => toggleReminder.mutate({ id: reminder.id, enabled })}
              testId={`reminder-toggle-${reminder.id}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
