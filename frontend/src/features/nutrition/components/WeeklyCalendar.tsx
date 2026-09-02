interface WeeklyCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

function buildWeek(centerDateStr: string) {
  const center = new Date(centerDateStr + 'T00:00:00.000Z');
  const dayOfWeek = center.getUTCDay();
  const start = new Date(center);
  start.setUTCDate(center.getUTCDate() - dayOfWeek);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklyCalendar({ selectedDate, onSelect }: WeeklyCalendarProps) {
  const week = buildWeek(selectedDate);

  return (
    <div className="flex items-center justify-between" data-testid="weekly-calendar">
      {week.map((dateStr) => {
        const d = new Date(dateStr + 'T00:00:00.000Z');
        const isSelected = dateStr === selectedDate;
        return (
          <button
            key={dateStr}
            onClick={() => onSelect(dateStr)}
            data-testid={`calendar-day-${dateStr}`}
            className={`flex flex-col items-center rounded-full px-3 py-2 text-center transition-colors ${
              isSelected ? 'bg-on-primary text-primary' : 'text-on-primary/80 hover:bg-white/10'
            }`}
          >
            <p className="mb-1 font-label-bold text-label-bold uppercase">{WEEKDAY_LABELS[d.getUTCDay()]}</p>
            <p className="font-headline-md text-headline-md">{d.getUTCDate()}</p>
          </button>
        );
      })}
    </div>
  );
}
