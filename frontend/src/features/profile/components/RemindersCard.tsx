import { useState } from 'react';
import { BellRing, Pencil } from 'lucide-react';
import { Reminder } from '../../../types/domain';
import { useToggleReminder } from '../../../services/api/reminders';
import Toggle from '../../../components/ui/Toggle';

interface RemindersCardProps {
  reminders: Reminder[];
}

const TIME_STORAGE_KEY = 'vitality_reminder_times';

function readCustomTimes(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TIME_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export default function RemindersCard({ reminders }: RemindersCardProps) {
  const toggleReminder = useToggleReminder();
  const [customTimes, setCustomTimes] = useState<Record<string, string>>(() => readCustomTimes());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleTimeChange = (id: string, value: string) => {
    if (!value) return;
    const updated = { ...customTimes, [id]: value };
    setCustomTimes(updated);
    localStorage.setItem(TIME_STORAGE_KEY, JSON.stringify(updated));
  };

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
        {reminders.map((reminder) => {
          const displayTime = customTimes[reminder.id] ?? reminder.time;
          const isEditing = editingId === reminder.id;
          return (
            <div key={reminder.id} data-testid={`reminder-${reminder.id}`} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-body-lg text-body-lg font-semibold text-on-surface">{reminder.title}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{reminder.subtitle} •</p>
                  {isEditing ? (
                    <input
                      type="time"
                      autoFocus
                      defaultValue={displayTime}
                      onBlur={(e) => {
                        handleTimeChange(reminder.id, e.target.value);
                        setEditingId(null);
                      }}
                      onChange={(e) => handleTimeChange(reminder.id, e.target.value)}
                      data-testid={`reminder-time-input-${reminder.id}`}
                      className="rounded-md border border-outline-variant/30 bg-surface px-2 py-0.5 font-body-sm text-body-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingId(reminder.id)}
                      data-testid={`reminder-time-edit-${reminder.id}`}
                      className="flex items-center gap-1 font-body-sm text-body-sm text-primary transition-opacity hover:opacity-80"
                    >
                      {displayTime}
                      <Pencil size={11} />
                    </button>
                  )}
                </div>
              </div>
              <Toggle
                checked={reminder.enabled}
                onChange={(enabled) => toggleReminder.mutate({ id: reminder.id, enabled })}
                testId={`reminder-toggle-${reminder.id}`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
