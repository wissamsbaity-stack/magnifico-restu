import type { Branch } from "@/types/branch";
import type { OpeningHour } from "@/lib/supabase/types";

/** Opens Google Maps — uses the branch's custom link when set, else a search. */
export function getBranchMapsUrl(branch: Branch): string {
  const custom = branch.googleMapsUrl?.trim();
  if (custom) return custom;
  const query = encodeURIComponent(branch.address || branch.name);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Embeddable Google Maps iframe URL built from the branch address. */
export function getBranchMapsEmbedUrl(branch: Branch): string {
  const query = encodeURIComponent(branch.address || branch.name);
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

const DAY_ALIASES: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function dayIndex(token: string): number | null {
  const key = token.trim().toLowerCase();
  return key in DAY_ALIASES ? DAY_ALIASES[key] : null;
}

/** Best-effort match of a "days" label ("Daily", "Mon-Fri", "Sat, Sun") to a weekday. */
function daysMatch(daysLabel: string, weekday: number): boolean {
  const label = daysLabel.trim().toLowerCase();
  if (!label) return true;
  if (/(daily|every ?day|all ?days|7\/7)/.test(label)) return true;
  if (label.includes("weekend")) return weekday === 0 || weekday === 6;
  if (label.includes("weekday")) return weekday >= 1 && weekday <= 5;

  // Range like "Mon - Fri"
  const range = label.split(/[-–—]/);
  if (range.length === 2) {
    const start = dayIndex(range[0]);
    const end = dayIndex(range[1]);
    if (start !== null && end !== null) {
      if (start <= end) return weekday >= start && weekday <= end;
      return weekday >= start || weekday <= end; // wraps the week
    }
  }

  // Comma / slash separated list
  return label
    .split(/[,/&]| and /)
    .map((t) => dayIndex(t))
    .some((d) => d !== null && d === weekday);
}

function parseTimeToMinutes(raw: string): number | null {
  const m = raw.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = m[2] ? Number(m[2]) : 0;
  const meridiem = m[3]?.toLowerCase();
  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export interface OpenStatus {
  open: boolean;
  /** True when we could not parse hours confidently. */
  unknown: boolean;
}

/** Determine whether a branch is currently open from its opening_hours. */
export function getBranchOpenStatus(
  hours: OpeningHour[],
  now: Date = new Date()
): OpenStatus {
  if (!hours || hours.length === 0) return { open: false, unknown: true };

  const weekday = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  let parsedAny = false;

  for (const slot of hours) {
    if (!slot?.time) continue;
    if (!daysMatch(slot.days ?? "", weekday)) continue;

    const parts = slot.time.split(/[-–—]|to/i);
    if (parts.length < 2) continue;

    const start = parseTimeToMinutes(parts[0]);
    const end = parseTimeToMinutes(parts[1]);
    if (start === null || end === null) continue;
    parsedAny = true;

    if (end <= start) {
      // Overnight (e.g. 5:30 PM - 1:00 AM)
      if (minutesNow >= start || minutesNow < end) return { open: true, unknown: false };
    } else if (minutesNow >= start && minutesNow < end) {
      return { open: true, unknown: false };
    }
  }

  return { open: false, unknown: !parsedAny };
}
