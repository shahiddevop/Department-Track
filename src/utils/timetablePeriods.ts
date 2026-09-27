import { TimetableSlot } from '../types';

export interface TimetablePeriod {
  id: string;
  periodNumber?: number; // 1, 2, undefined (break), 3, 4, 5, 6
  name: string;
  shortName: string;
  timing: string;
  defaultStartTime: string;
  defaultEndTime: string;
  isBreak: boolean;
}

export const TIMETABLE_PERIODS: TimetablePeriod[] = [
  {
    id: 'period-1',
    periodNumber: 1,
    name: 'Period 1',
    shortName: 'P1',
    timing: '08:25 - 09:15',
    defaultStartTime: '08:25',
    defaultEndTime: '09:15',
    isBreak: false
  },
  {
    id: 'period-2',
    periodNumber: 2,
    name: 'Period 2',
    shortName: 'P2',
    timing: '09:15 - 10:05',
    defaultStartTime: '09:15',
    defaultEndTime: '10:05',
    isBreak: false
  },
  {
    id: 'period-break',
    name: 'Break Interval',
    shortName: 'Break',
    timing: '10:05 - 10:25',
    defaultStartTime: '10:05',
    defaultEndTime: '10:25',
    isBreak: true
  },
  {
    id: 'period-3',
    periodNumber: 3,
    name: 'Period 3',
    shortName: 'P3',
    timing: '10:25 - 11:15',
    defaultStartTime: '10:25',
    defaultEndTime: '11:15',
    isBreak: false
  },
  {
    id: 'period-4',
    periodNumber: 4,
    name: 'Period 4',
    shortName: 'P4',
    timing: '11:15 - 12:05',
    defaultStartTime: '11:15',
    defaultEndTime: '12:05',
    isBreak: false
  },
  {
    id: 'period-5',
    periodNumber: 5,
    name: 'Period 5',
    shortName: 'P5',
    timing: '12:05 - 12:55',
    defaultStartTime: '12:05',
    defaultEndTime: '12:55',
    isBreak: false
  },
  {
    id: 'period-6',
    periodNumber: 6,
    name: 'Period 6',
    shortName: 'P6',
    timing: '12:55 - 01:45',
    defaultStartTime: '12:55',
    defaultEndTime: '13:45',
    isBreak: false
  }
];

export const CLASS_PERIODS = TIMETABLE_PERIODS.filter(p => !p.isBreak);

/**
 * Maps a timetable slot to one of the 6 class periods (1 to 6).
 */
export const getSlotPeriod = (slot: TimetableSlot): number => {
  if (slot.period && slot.period >= 1 && slot.period <= 6) {
    return slot.period;
  }

  // Parse time
  const timeStr = (slot.startTime || '').trim().toLowerCase();
  const isPM = timeStr.includes('pm') || timeStr.includes('p.m.');
  const cleanTime = timeStr.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = cleanTime.split(':');
  let hour = parseInt(hStr || '8', 10);
  const min = parseInt(mStr || '0', 10);

  // In college schedules, 1, 2, 3, 4 without AM/PM are afternoon 13, 14, 15, 16
  if (isPM && hour < 12) hour += 12;
  if (!isPM && hour >= 1 && hour <= 6) hour += 12; // 01:00 is 13:00

  const totalMinutes = hour * 60 + min;

  // New period ranges:
  // P1: 08:25 - 09:15 (starts up to 09:14)
  // P2: 09:15 - 10:05 (starts 09:15 up to 10:14)
  // Break: 10:05 - 10:25
  // P3: 10:25 - 11:15 (starts 10:15 up to 11:14)
  // P4: 11:15 - 12:05 (starts 11:15 up to 12:04)
  // P5: 12:05 - 12:55 (starts 12:05 up to 12:54)
  // P6: 12:55 - 13:45 / 01:45 PM (starts 12:55 onwards)

  if (totalMinutes < 9 * 60 + 15) return 1;          // Before 09:15 -> Period 1
  if (totalMinutes < 10 * 60 + 15) return 2;         // 09:15 to 10:14 -> Period 2
  if (totalMinutes < 11 * 60 + 15) return 3;         // 10:15 to 11:14 -> Period 3
  if (totalMinutes < 12 * 60 + 5) return 4;          // 11:15 to 12:04 -> Period 4
  if (totalMinutes < 12 * 60 + 55) return 5;         // 12:05 to 12:54 -> Period 5
  return 6;                                          // 12:55 onwards -> Period 6
};
