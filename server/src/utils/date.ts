export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysString(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function lastNDates(n: number, endDate: string): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(addDaysString(endDate, -i));
  }
  return dates;
}

export function weekdayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
}
