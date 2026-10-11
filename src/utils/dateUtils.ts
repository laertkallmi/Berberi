export const ALBANIAN_MONTHS = [
  'Janar',
  'Shkurt',
  'Mars',
  'Prill',
  'Maj',
  'Qershor',
  'Korrik',
  'Gusht',
  'Shtator',
  'Tetor',
  'Nëntor',
  'Dhjetor',
];

export const ALBANIAN_DAYS = [
  'E Diel',
  'E Hënë',
  'E Martë',
  'E Mërkurë',
  'E Enjte',
  'E Premte',
  'E Shtunë',
];

export const ALBANIAN_DAYS_SHORT = ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'];

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's ISO date string
 */
export function getTodayDateStr(): string {
  return toISODate(new Date());
}

/**
 * Parses YYYY-MM-DD to local Date object
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formats date into readable Albanian string (e.g., "E Shtunë, 10 Tetor 2026")
 */
export function formatAlbanianDate(dateStr: string, includeYear = true): string {
  const d = parseISODate(dateStr);
  const dayName = ALBANIAN_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = ALBANIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();

  return includeYear
    ? `${dayName}, ${dayNum} ${monthName} ${year}`
    : `${dayName}, ${dayNum} ${monthName}`;
}

/**
 * Short Albanian format (e.g., "10 Tetor")
 */
export function formatAlbanianShort(dateStr: string): string {
  const d = parseISODate(dateStr);
  const dayNum = d.getDate();
  const monthName = ALBANIAN_MONTHS[d.getMonth()];
  return `${dayNum} ${monthName}`;
}

/**
 * Checks if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateStr();
}

/**
 * Adds N days to a date string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Generates an array of upcoming dates starting from a given date
 */
export function getUpcomingDates(startDateStr: string, count = 14): { dateStr: string; dayName: string; dayNum: number; monthName: string; isWeekend: boolean }[] {
  const results = [];
  for (let i = 0; i < count; i++) {
    const dStr = addDays(startDateStr, i);
    const d = parseISODate(dStr);
    const dayIndex = d.getDay();
    results.push({
      dateStr: dStr,
      dayName: ALBANIAN_DAYS_SHORT[dayIndex],
      dayNum: d.getDate(),
      monthName: ALBANIAN_MONTHS[d.getMonth()],
      isWeekend: dayIndex === 0 || dayIndex === 6,
    });
  }
  return results;
}

/**
 * Converts "HH:mm" to minutes from start of day
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
}

/**
 * Converts minutes from start of day to "HH:mm"
 */
export function minutesToTime(totalMins: number): string {
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Generates all possible time slots for a day
 */
export function generateTimeSlots(
  startHour: string,
  endHour: string,
  intervalMinutes: number,
  breakStart?: string,
  breakEnd?: string
): string[] {
  const slots: string[] = [];
  const startMins = timeToMinutes(startHour);
  const endMins = timeToMinutes(endHour);

  const breakStartMins = breakStart ? timeToMinutes(breakStart) : null;
  const breakEndMins = breakEnd ? timeToMinutes(breakEnd) : null;

  let current = startMins;
  while (current + intervalMinutes <= endMins) {
    // If inside lunch break, skip
    if (
      breakStartMins !== null &&
      breakEndMins !== null &&
      current >= breakStartMins &&
      current < breakEndMins
    ) {
      current = breakEndMins;
      continue;
    }

    slots.push(minutesToTime(current));
    current += intervalMinutes;
  }

  return slots;
}

/**
 * Creates unique booking code (e.g., REZ-9482)
 */
export function generateBookingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `REZ-${num}`;
}
