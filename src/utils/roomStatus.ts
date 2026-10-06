import { Room, RoomBooking } from '../types';

/**
 * Formats a 24-hour time string ("HH:MM") to 12-hour AM/PM format ("hh:mm AM/PM").
 * e.g. "10:15" -> "10:15 AM", "14:00" -> "02:00 PM"
 */
export const formatTime12h = (time24: string): string => {
  if (!time24) return '';
  const trimmed = time24.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let h = parseInt(parts[0], 10);
  const m = parts[1].padStart(2, '0').slice(0, 2);
  if (isNaN(h)) return trimmed;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

/**
 * Safely parses a booking date ("YYYY-MM-DD" or ISO) and times ("HH:MM") into local Date objects.
 */
export const parseBookingInterval = (
  dateStr: string,
  startTime: string,
  endTime: string
): { start: Date; end: Date } | null => {
  if (!dateStr || !startTime || !endTime) return null;

  // Clean dateStr to handle ISO strings like "2026-10-05T00:00:00.000Z"
  const cleanDateStr = dateStr.trim().split('T')[0];
  const dateParts = cleanDateStr.includes('/') ? cleanDateStr.split('/') : cleanDateStr.split('-');
  if (dateParts.length !== 3) return null;
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // 0-indexed month
  const day = parseInt(dateParts[2], 10);

  const startParts = startTime.trim().split(':');
  const endParts = endTime.trim().split(':');
  if (startParts.length < 2 || endParts.length < 2) return null;

  const startH = parseInt(startParts[0], 10);
  const startM = parseInt(startParts[1], 10);
  const endH = parseInt(endParts[0], 10);
  const endM = parseInt(endParts[1], 10);

  if (
    isNaN(year) || isNaN(month) || isNaN(day) ||
    isNaN(startH) || isNaN(startM) ||
    isNaN(endH) || isNaN(endM)
  ) {
    return null;
  }

  const start = new Date(year, month, day, startH, startM, 0, 0);
  const end = new Date(year, month, day, endH, endM, 0, 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null;
  }

  return { start, end };
};

/**
 * Checks if a booking's date and time interval overlaps with the given time (defaults to system now).
 * A booking is active when now >= start && now < end.
 */
export const isBookingActiveNow = (booking: RoomBooking, now: Date = new Date()): boolean => {
  if (!booking || booking.status !== 'Approved') return false;
  const interval = parseBookingInterval(booking.date, booking.startTime, booking.endTime);
  if (!interval) return false;

  const nowMs = now.getTime();
  const startMs = interval.start.getTime();
  const endMs = interval.end.getTime();

  return nowMs >= startMs && nowMs < endMs;
};

/**
 * Returns the currently active approved booking for a specific room, if one exists.
 * Matches by room id or room number.
 */
export const getActiveBookingForRoom = (
  room: { id: string; number?: string },
  bookings: RoomBooking[],
  now: Date = new Date()
): RoomBooking | undefined => {
  if (!room || !room.id || !bookings || bookings.length === 0) return undefined;
  return bookings.find(b => 
    (b.roomId === room.id || (room.number && b.roomNumber && b.roomNumber === room.number)) &&
    isBookingActiveNow(b, now)
  );
};

/**
 * Synchronizes a single room's status based on real-time booking intervals:
 * - If an approved booking interval overlaps with current system time: marks as 'Occupied'
 * - If no booking overlaps with current system time: reverts 'Occupied' rooms back to 'Available'
 * - Preserves 'Under Maintenance' rooms unless explicitly occupied by an active booking
 */
export const syncSingleRoomStatus = (
  room: Room,
  bookings: RoomBooking[],
  now: Date = new Date()
): Room => {
  const activeBooking = getActiveBookingForRoom(room, bookings, now);

  if (activeBooking) {
    const formattedSlot = `${formatTime12h(activeBooking.startTime)} - ${formatTime12h(activeBooking.endTime)}`;
    // Only update if there is a meaningful state difference
    if (
      room.currentStatus === 'Occupied' &&
      room.currentOccupant === activeBooking.bookedBy &&
      room.currentSubject === activeBooking.purpose &&
      room.currentSlotTime === formattedSlot
    ) {
      return room;
    }

    return {
      ...room,
      currentStatus: 'Occupied',
      currentOccupant: activeBooking.bookedBy,
      currentSubject: activeBooking.purpose,
      currentSlotTime: formattedSlot
    };
  }

  // Preserve 'Under Maintenance' status when no active booking is running
  if (room.currentStatus === 'Under Maintenance') {
    return room;
  }

  // No active booking is currently overlapping
  // If the room was 'Occupied', revert it to 'Available'
  if (room.currentStatus === 'Occupied') {
    return {
      ...room,
      currentStatus: 'Available',
      currentOccupant: undefined,
      currentSubject: undefined,
      currentSlotTime: undefined
    };
  }

  // Clean up any lingering occupant, subject, or slot details on Available rooms
  if (room.currentStatus === 'Available' && (room.currentOccupant || room.currentSubject || room.currentSlotTime)) {
    return {
      ...room,
      currentOccupant: undefined,
      currentSubject: undefined,
      currentSlotTime: undefined
    };
  }

  return room;
};

/**
 * Synchronizes all rooms against current bookings and system time.
 * Returns the updated rooms array and whether any room underwent a status change.
 */
export const syncAllRoomStatuses = (
  rooms: Room[],
  bookings: RoomBooking[],
  now: Date = new Date()
): { updatedRooms: Room[]; hasChanges: boolean } => {
  let hasChanges = false;

  const updatedRooms = rooms.map(room => {
    const synced = syncSingleRoomStatus(room, bookings, now);
    if (synced !== room) {
      hasChanges = true;
      return synced;
    }
    return room;
  });

  return { updatedRooms, hasChanges };
};
