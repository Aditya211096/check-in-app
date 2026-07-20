/**
 * Timezone-Safe Date Utilities for Hospitality Operations.
 * Solves date-shifting bugs where parsing "YYYY-MM-DD" shifts dates by +/- 1 day in local timezones.
 */

/**
 * Parses a "YYYY-MM-DD" string into a local Date object set to 00:00:00 local time.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Formats a Date object or date string safely into readable string format without timezone shifting.
 */
export function formatLocalDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  return new Intl.DateTimeFormat("en-IN", options).format(d);
}

/**
 * Returns today's date in "YYYY-MM-DD" string format based on local wall-clock time.
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns tomorrow's date in "YYYY-MM-DD" string format based on local wall-clock time.
 */
export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates exact integer night count between check-in and check-out dates.
 * Always returns an integer >= 0.
 */
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  if (!checkIn || !checkOut) return 0;
  const dIn = typeof checkIn === "string" ? parseLocalDate(checkIn) : checkIn;
  const dOut = typeof checkOut === "string" ? parseLocalDate(checkOut) : checkOut;
  const diffMs = dOut.getTime() - dIn.getTime();
  return Math.max(0, Math.round(diffMs / 86400000));
}

/**
 * Validates check-in and check-out dates.
 */
export function validateDateRange(checkIn: string, checkOut: string): { isValid: boolean; nights: number; error?: string } {
  if (!checkIn || !checkOut) {
    return { isValid: false, nights: 0, error: "Please select both check-in and check-out dates." };
  }
  const nights = calculateNights(checkIn, checkOut);
  if (nights <= 0) {
    return { isValid: false, nights: 0, error: "Check-out date must be at least 1 night after check-in date." };
  }
  return { isValid: true, nights };
}

/**
 * Formats elapsed time in minutes into human readable duration (e.g. "8m ago" or "2h 15m ago").
 */
export function formatMinutesAgo(createdAtIso: string): string {
  if (!createdAtIso) return "Just now";
  const created = new Date(createdAtIso).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((now - created) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}h ${mins}m ago`;
}
