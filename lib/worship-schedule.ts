export const worshipWeekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
export type WorshipWeekday = (typeof worshipWeekdays)[number];
export type WorshipColor = "blue" | "gold" | "violet" | "teal" | "rose";
export type WorshipKind = "culto" | "evento";
export type WorshipSchedule =
  | { type: "weekly"; weekdays: WorshipWeekday[] }
  | { type: "monthlyNthWeekday"; weekday: WorshipWeekday; nth: 1 | 2 | 3 | 4 | -1 }
  | { type: "monthlyDay"; day: number }
  | { type: "once"; date: string };

export type WorshipOccurrence = { startsAt: Date; endsAt: Date; status: "upcoming" | "live" };

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number };

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { year: +values.year, month: +values.month, day: +values.day, hour: +values.hour, minute: +values.minute };
}

function localDateTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = target;
  for (let i = 0; i < 4; i += 1) {
    const p = getZonedParts(new Date(candidate), timeZone);
    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    const adjustment = target - represented;
    if (!adjustment) break;
    candidate += adjustment;
  }
  return new Date(candidate);
}

function matches(schedule: WorshipSchedule, date: Date): boolean {
  const weekday = worshipWeekdays[date.getUTCDay()];
  const day = date.getUTCDate();
  switch (schedule.type) {
    case "weekly": return schedule.weekdays.includes(weekday);
    case "monthlyNthWeekday": {
      if (weekday !== schedule.weekday) return false;
      if (schedule.nth === -1) {
        const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
        return day + 7 > last;
      }
      return Math.floor((day - 1) / 7) + 1 === schedule.nth;
    }
    case "monthlyDay": return day === schedule.day;
    case "once": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(schedule.date)) return false;
      const [year, month, dateDay] = schedule.date.split("-").map(Number);
      return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && day === dateDay;
    }
  }
}

export function getNextWorshipOccurrence(
  schedule: WorshipSchedule,
  time: string,
  nowMs: number,
  timeZone: string,
  durationMinutes = 120,
  excludedLocalDates: string[] = [],
): WorshipOccurrence | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || !Number.isFinite(nowMs)) return null;
  const [hour, minute] = time.split(":").map(Number);
  const nowLocal = getZonedParts(new Date(nowMs), timeZone);
  const localToday = Date.UTC(nowLocal.year, nowLocal.month - 1, nowLocal.day);
  const durationMs = Math.max(0, durationMinutes) * 60_000;
  const searchDays = schedule.type === "once" ? 3660 : 370;

  for (let offset = 0; offset <= searchDays; offset += 1) {
    const day = new Date(localToday + offset * 86_400_000);
    if (!matches(schedule, day)) continue;
    const localDate = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`;
    if (excludedLocalDates.includes(localDate)) continue;
    const startsAt = localDateTimeToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), hour, minute, timeZone);
    const endsAt = new Date(startsAt.getTime() + durationMs);
    if (nowMs < startsAt.getTime()) return { startsAt, endsAt, status: "upcoming" };
    if (durationMs > 0 && nowMs < endsAt.getTime()) return { startsAt, endsAt, status: "live" };
  }
  return null;
}
