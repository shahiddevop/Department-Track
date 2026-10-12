import { TimetableSlot, User } from '../types';

/**
 * Normalizes a faculty name by stripping titles (Dr., Prof., etc.),
 * punctuation, extra spaces, and converting to lowercase.
 */
export const normalizeFacultyName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?|er\.?|hod|dean)\s+/gi, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Determines whether a timetable slot belongs to a specific user account.
 * Supports:
 * - Direct ID match (slot.facultyId === user.id)
 * - Exact case-insensitive match ('raisa tahseen' === 'Raisa Tahseen')
 * - Normalized title-stripped match ('Dr. Vikram Verma' === 'vikram verma')
 * - Substring match for full names
 * - Email prefix match (e.g. raisa.tahseen, vikram.verma)
 */
export const isSlotAssignedToUser = (slot: TimetableSlot, user: User): boolean => {
  if (!slot || !user) return false;

  // 1. Direct ID match
  if (slot.facultyId && user.id && slot.facultyId === user.id) {
    return true;
  }

  const slotFacultyName = (slot.facultyName || '').trim();
  const userName = (user.name || '').trim();

  // 2. Exact case-insensitive match
  if (slotFacultyName && userName && slotFacultyName.toLowerCase() === userName.toLowerCase()) {
    return true;
  }

  // 3. Normalized title-stripped comparison
  const normSlot = normalizeFacultyName(slotFacultyName);
  const normUser = normalizeFacultyName(userName);

  if (normSlot && normUser) {
    if (normSlot === normUser) {
      return true;
    }
    // Substring inclusion when both are sufficiently distinct
    if (normSlot.length >= 4 && normUser.length >= 4) {
      if (normSlot.includes(normUser) || normUser.includes(normSlot)) {
        return true;
      }
    }
  }

  // 4. Email prefix match (e.g. raisa.tahseen from raisa.tahseen@college.edu)
  if (user.email && normSlot) {
    const emailPrefix = user.email.split('@')[0].toLowerCase().replace(/[._-]/g, ' ').trim();
    if (emailPrefix && (normSlot === emailPrefix || normSlot.includes(emailPrefix) || emailPrefix.includes(normSlot))) {
      return true;
    }
  }

  return false;
};

/**
 * Determines if a user's timetable should be strictly account-specific.
 * - Dr. P.Shahnaz (HOD/Admin): STRICTLY account-specific
 * - Faculty members (Dr. Vikram Verma, Prof. Ananya Roy, etc.): STRICTLY account-specific
 * - Other teaching HODs: STRICTLY account-specific
 * - Principal / Vice Principal / Super Admin (Dr. K. Shantha, Dr. C.V Satyanarayana): Can view all timetables or filter by faculty
 * - Student CR: Views class timetable for their batch/section
 */
export const isAccountSpecificUser = (user: User): boolean => {
  if (!user) return false;
  // Super Admin (College Principal & Vice Principal) is exempted to oversee all departmental schedules
  if (user.isSuperAdmin) return false;
  // Students view student batch schedules
  if (user.role === 'student') return false;
  // Dr. P.Shahnaz (HOD/Admin)
  if (user.name.toLowerCase().includes('shahnaz') || user.name.toLowerCase().includes('raisa') || (user.email && (user.email.toLowerCase().includes('shahnaz') || user.email.toLowerCase().includes('raisa'))) || user.id === 'user-1') {
    return true;
  }
  // All faculty members
  if (user.role === 'faculty') return true;
  // Department HODs
  if (user.role === 'admin') return true;

  return false;
};

/**
 * Determines whether a DailyTopicLog entry belongs to a specific user.
 * Uses the same normalized name-matching strategy as isSlotAssignedToUser,
 * adapted for topic logs which only carry a facultyName (no facultyId).
 */
export const isLogAssignedToUser = (log: { facultyName: string }, user: User): boolean => {
  if (!log || !user) return false;

  const logFaculty = (log.facultyName || '').trim();
  const userName = (user.name || '').trim();

  // 1. Exact case-insensitive match
  if (logFaculty && userName && logFaculty.toLowerCase() === userName.toLowerCase()) {
    return true;
  }

  // 2. Normalized title-stripped comparison
  const normLog = normalizeFacultyName(logFaculty);
  const normUser = normalizeFacultyName(userName);

  if (normLog && normUser) {
    if (normLog === normUser) return true;
    // Substring inclusion for sufficiently distinct names
    if (normLog.length >= 4 && normUser.length >= 4) {
      if (normLog.includes(normUser) || normUser.includes(normLog)) {
        return true;
      }
    }
  }

  // 3. Email prefix match (e.g. ananya.roy from ananya.roy@sjdc.edu)
  if (user.email && normLog) {
    const emailPrefix = user.email.split('@')[0].toLowerCase().replace(/[._-]/g, ' ').trim();
    if (emailPrefix && (normLog === emailPrefix || normLog.includes(emailPrefix) || emailPrefix.includes(normLog))) {
      return true;
    }
  }

  return false;
};
