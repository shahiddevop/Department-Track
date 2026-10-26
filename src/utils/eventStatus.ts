import { DepartmentEvent, EventStatus } from '../types';

/**
 * Parses time strings like "09:00am", "09:00 AM", "4:30 PM", "16:30"
 */
export function parseTimeParts(timeStr?: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const str = timeStr.trim().toLowerCase();

  const isPM = str.includes('pm') || str.includes('p.m.');
  const isAM = str.includes('am') || str.includes('a.m.');

  // Match hours and minutes (e.g. "09:00", "9:30", "16:30")
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    // Single hour without minutes like "9am" or "4pm"
    const singleHourMatch = str.match(/(\d{1,2})/);
    if (!singleHourMatch) return null;
    let hours = parseInt(singleHourMatch[1], 10);
    if (isNaN(hours)) return null;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return { hours, minutes: 0 };
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Parses date strings into year, month (0-11), and day.
 */
export function parseDateParts(dateStr?: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    return {
      year: parseInt(ymdMatch[1], 10),
      month: parseInt(ymdMatch[2], 10) - 1,
      day: parseInt(ymdMatch[3], 10)
    };
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return {
      year: parseInt(dmyMatch[3], 10),
      month: parseInt(dmyMatch[2], 10) - 1,
      day: parseInt(dmyMatch[1], 10)
    };
  }

  // Fallback to JS Date constructor
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth(),
      day: parsed.getDate()
    };
  }

  return null;
}

/**
 * Returns accurate start and end Date objects for an event.
 */
export function getEventDateTimes(event: {
  startDate?: string;
  endDate?: string;
  programDate?: string;
  startTime?: string;
  endTime?: string;
}): { start: Date | null; end: Date | null } {
  const startDateStr = event.startDate || event.programDate || event.endDate;
  const endDateStr = event.endDate || event.programDate || event.startDate;

  const sParts = parseDateParts(startDateStr);
  const eParts = parseDateParts(endDateStr);

  if (!sParts && !eParts) {
    return { start: null, end: null };
  }

  const startParts = sParts || eParts!;
  const endParts = eParts || sParts!;

  const startTimeParts = parseTimeParts(event.startTime) || { hours: 0, minutes: 0 };
  const endTimeParts = parseTimeParts(event.endTime) || { hours: 23, minutes: 59 };

  const start = new Date(
    startParts.year,
    startParts.month,
    startParts.day,
    startTimeParts.hours,
    startTimeParts.minutes,
    0,
    0
  );

  const end = new Date(
    endParts.year,
    endParts.month,
    endParts.day,
    endTimeParts.hours,
    endTimeParts.minutes,
    59,
    999
  );

  return { start, end };
}

/**
 * Automatically calculates event status based on current date/time:
 * - "Upcoming" before the scheduled start time
 * - "In Progress" between the scheduled start and end times
 * - "Completed" after the scheduled end time
 * 
 * Preserves manual override if status is explicitly set to "Postponed" or "Cancelled".
 */
export function calculateEventStatus(
  event: Partial<DepartmentEvent>,
  now: Date = new Date()
): EventStatus {
  // Manual overrides: if explicitly postponed or cancelled, keep that status
  if (event.status === 'Postponed' || event.status === 'Cancelled') {
    return event.status;
  }

  const { start, end } = getEventDateTimes(event);
  if (!start || !end) {
    return event.status || 'Upcoming';
  }

  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (nowMs < startMs) {
    return 'Upcoming';
  } else if (nowMs >= startMs && nowMs <= endMs) {
    return 'In Progress';
  } else {
    return 'Completed';
  }
}

export const DEMO_EVENT_IDS = new Set([
  'event-1', 'event-2', 'event-3', 'event-4', 'event-5', 'event-6',
  'event-ep-1', 'event-mb-1', 'event-math-1', 'event-stat-1',
  'event-zoo-1', 'event-tel-1', 'event-arb-1', 'event-hin-1',
  'event-com-1', 'event-chem-1'
]);

export function isDemoEvent(event: { id?: string; title?: string }): boolean {
  if (event.id && DEMO_EVENT_IDS.has(event.id)) return true;
  if (event.title) {
    const t = event.title.toLowerCase();
    if (
      t.includes('hacknova') ||
      t.includes('mastering llm') ||
      t.includes('post-quantum cryptography') ||
      t.includes('cybersecurity & ai ethics') ||
      t.includes('scalable microservices') ||
      t.includes('field immersion visit') ||
      t.includes('semiconductor devices') ||
      t.includes('microbial fermentation') ||
      t.includes('applied linear algebra') ||
      t.includes('stochastic modeling') ||
      t.includes('faunal biodiversity') ||
      t.includes('telugu bhasha dinotsavam') ||
      t.includes('classical calligraphy') ||
      t.includes('rashtriya hindi pakhwada') ||
      t.includes('national commerce conclave') ||
      t.includes('green chemistry')
    ) {
      return true;
    }
  }
  return false;
}

export const DEMO_NOTIFICATION_IDS = new Set([
  'notif-1',
  'notif-2',
  'notif-3',
  'notif-4',
  'notif-5'
]);

export function isDemoNotification(notif?: { id?: string; title?: string } | null): boolean {
  if (!notif) return false;
  if (notif.id && DEMO_NOTIFICATION_IDS.has(notif.id)) return true;
  if (notif.title) {
    const t = notif.title.toLowerCase();
    if (
      t.includes('mid-semester syllabus completion audit') ||
      t.includes('lab-101 gpu node driver upgrade') ||
      t.includes('networks lab shifted')
    ) {
      return true;
    }
  }
  return false;
}

export const DEMO_SLOT_IDS = new Set([
  'slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5', 'slot-6', 'slot-7', 'slot-8', 'slot-9',
  'slot-10', 'slot-11', 'slot-12', 'slot-13', 'slot-14', 'slot-15', 'slot-16', 'slot-17', 'slot-18', 'slot-19',
  'slot-zoo-1', 'slot-zoo-2', 'slot-zoo-3',
  'slot-tel-1', 'slot-tel-2',
  'slot-arb-1', 'slot-arb-2',
  'slot-hin-1', 'slot-hin-2',
  'slot-com-1', 'slot-com-2', 'slot-com-3', 'slot-com-4',
  'slot-chem-1', 'slot-chem-2', 'slot-chem-3', 'slot-chem-4'
]);

export function isDemoSlot(slot?: { id?: string } | null): boolean {
  if (!slot || !slot.id) return false;
  return DEMO_SLOT_IDS.has(slot.id);
}

export const DEMO_TOPIC_LOG_IDS = new Set([
  'log-1', 'log-2', 'log-3', 'log-4', 'log-5', 'log-6', 'log-7',
  'log-com-1', 'log-chem-1', 'log-zoo-1', 'log-tel-1', 'log-arb-1', 'log-hin-1', 'log-math-1', 'log-stat-1'
]);

export function isDemoTopicLog(log?: { id?: string; topicTitle?: string } | null): boolean {
  if (!log) return false;
  if (log.id && DEMO_TOPIC_LOG_IDS.has(log.id)) return true;
  if (log.topicTitle) {
    const t = log.topicTitle.toLowerCase();
    if (
      t.includes('relational algebra') ||
      t.includes('dynamic programming - 0/1 knapsack') ||
      t.includes('process synchronization & semaphores') ||
      t.includes('tcp congestion control') ||
      t.includes('b+ tree indexing') ||
      t.includes('greedy algorithms - huffman') ||
      t.includes('virtual memory & page replacement') ||
      t.includes('amalgamation, absorption')
    ) {
      return true;
    }
  }
  return false;
}


