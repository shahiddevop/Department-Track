import { Room, User, TimetableSlot } from '../types';
import { normalizeFacultyName, isSlotAssignedToUser } from './facultyMatching';

export interface FacultyRoomAssignment {
  room: Room;
  reason: string;
  departmentName: string;
  isDirectAssignment: boolean;
}

/**
 * Primary mapping from academic department (branchId) to its designated
 * laboratory or specialized classroom facility.
 */
export const DEPARTMENT_DEFAULT_ROOMS: Record<string, { roomId: string; roomNumber: string }> = {
  // English & Languages (Building 2, 3rd Floor)
  'branch-cse': { roomId: 'room-lab3', roomNumber: 'LAB-3' },
  // Computer Science (Building 2, 1st Floor)
  'branch-cs': { roomId: 'room-lab1', roomNumber: 'LAB-1' },
  // Physics & Electronics (Building 2, 3rd Floor)
  'branch-ep': { roomId: 'room-lab4', roomNumber: 'LAB-4' },
  // Microbiology & Biotechnology (Building 1, 1st Floor)
  'branch-mb': { roomId: 'room-zoolab-b1', roomNumber: 'ZOO-LAB' },
  // Mathematics (Building 2, 2nd Floor)
  'branch-math': { roomId: 'room-lab2', roomNumber: 'LAB-2' },
  // Statistics (Building 2, 2nd Floor)
  'branch-stat': { roomId: 'room-lab2', roomNumber: 'LAB-2' },
  // Zoology (Building 2, Ground Floor)
  'branch-zoo': { roomId: 'room-zoolab-b2', roomNumber: 'ZOO-LAB' },
  // Telugu (Building 2, 3rd Floor)
  'branch-tel': { roomId: 'room-lab3', roomNumber: 'LAB-3' },
  // Arabic (Building 2, 3rd Floor)
  'branch-arb': { roomId: 'room-lab3', roomNumber: 'LAB-3' },
  // Hindi (Building 2, 3rd Floor)
  'branch-hin': { roomId: 'room-lab3', roomNumber: 'LAB-3' },
  // Commerce (Building 1, 2nd Floor)
  'branch-com': { roomId: 'room-ecom', roomNumber: 'E-COM' },
  // Chemistry (Building 2, Ground Floor)
  'branch-chem': { roomId: 'room-chemlab', roomNumber: 'CHEM-LAB' }
};

interface ResolveRoomParams {
  currentUser: User;
  rooms: Room[];
  timetable?: TimetableSlot[];
  selectedBranchId?: string;
  selectedRoom?: Room | null;
}

/**
 * Automatically resolves and pre-selects the fixed room / laboratory for a faculty member.
 * Priorities:
 * 1. Active teaching timetable slots assigned to the faculty (preferring dedicated Labs)
 * 2. Current occupant match in the room inventory
 * 3. Faculty's department / branch designated infrastructure
 * 4. Selected room (if already in user's department or for super admin)
 * 5. Fallback first room
 */
export const getFacultyAssignedRoom = ({
  currentUser,
  rooms,
  timetable = [],
  selectedBranchId = 'branch-cse',
  selectedRoom = null
}: ResolveRoomParams): FacultyRoomAssignment => {
  if (!rooms || rooms.length === 0) {
    return {
      room: null as unknown as Room,
      reason: 'No facilities currently configured in inventory',
      departmentName: currentUser?.branchName || 'Department',
      isDirectAssignment: false
    };
  }

  const deptId = (currentUser?.branchId && currentUser.branchId !== 'ALL')
    ? currentUser.branchId
    : selectedBranchId;
  const deptName = currentUser?.branchName || 'Department';

  // Explicitly selected room: if user clicked 'Book Slot' on any room card, dynamically honour that specific lab!
  if (selectedRoom) {
    const isDesignated = selectedRoom.branchId === deptId ||
      (DEPARTMENT_DEFAULT_ROOMS[deptId] && DEPARTMENT_DEFAULT_ROOMS[deptId].roomId === selectedRoom.id);
    return {
      room: selectedRoom,
      reason: isDesignated
        ? `Designated facility for ${deptName}: ${selectedRoom.number} (${selectedRoom.name}).`
        : `Selected facility: ${selectedRoom.number} (${selectedRoom.name}).`,
      departmentName: deptName,
      isDirectAssignment: true
    };
  }

  // 1. Check Faculty's Timetable Slots
  if (timetable && timetable.length > 0 && currentUser) {
    const userSlots = timetable.filter(s => isSlotAssignedToUser(s, currentUser));
    if (userSlots.length > 0) {
      // Prefer practical Lab slots if available, otherwise first slot
      const labSlot = userSlots.find(s => s.type === 'Lab' || (s.roomName && s.roomName.toUpperCase().includes('LAB')));
      const targetSlot = labSlot || userSlots[0];

      // Match room by slot.roomId or room number in slot.roomName
      const matchedRoom = rooms.find(r =>
        r.id === targetSlot.roomId ||
        r.number.toLowerCase() === targetSlot.roomName.split(' ')[0].toLowerCase()
      );

      if (matchedRoom) {
        return {
          room: matchedRoom,
          reason: `Auto-fixed to ${matchedRoom.number} based on ${currentUser.name}'s active teaching timetable (${targetSlot.subjectCode} - ${targetSlot.subjectName}).`,
          departmentName: deptName,
          isDirectAssignment: true
        };
      }
    }
  }

  // 2. Check Room Occupancy match
  if (currentUser?.name) {
    const normUser = normalizeFacultyName(currentUser.name);
    const occupantRoom = rooms.find(r => r.currentOccupant && normalizeFacultyName(r.currentOccupant) === normUser);
    if (occupantRoom) {
      return {
        room: occupantRoom,
        reason: `Auto-fixed to ${occupantRoom.number} (${occupantRoom.name}) as ${currentUser.name}'s designated faculty workspace/lab.`,
        departmentName: deptName,
        isDirectAssignment: true
      };
    }
  }

  // 3. Check Department Mapping (by deptId)
  if (deptId && DEPARTMENT_DEFAULT_ROOMS[deptId]) {
    const mapping = DEPARTMENT_DEFAULT_ROOMS[deptId];
    const deptRoom = rooms.find(r => r.id === mapping.roomId || r.number === mapping.roomNumber);
    if (deptRoom) {
      return {
        room: deptRoom,
        reason: `Auto-fixed to ${deptRoom.number} (${deptRoom.name}) designated for ${deptName} faculty.`,
        departmentName: deptName,
        isDirectAssignment: true
      };
    }
  }

  // 4. Check room by branchId property directly
  if (deptId) {
    const directBranchRoom = rooms.find(r => r.branchId === deptId);
    if (directBranchRoom) {
      return {
        room: directBranchRoom,
        reason: `Auto-fixed to ${directBranchRoom.number} allocated to ${deptName}.`,
        departmentName: deptName,
        isDirectAssignment: true
      };
    }
  }

  // 7. Ultimate Fallback: First room in list
  const fallbackRoom = rooms[0];
  return {
    room: fallbackRoom,
    reason: `Fixed to ${fallbackRoom.number} (${fallbackRoom.name}) for ${deptName}.`,
    departmentName: deptName,
    isDirectAssignment: false
  };
};

/**
 * Checks whether a given room belongs to or is assigned to the current user.
 */
export const isRoomAssignedToUser = (
  room: Room,
  currentUser: User,
  timetable: TimetableSlot[] = [],
  selectedBranchId: string = 'branch-cse'
): boolean => {
  if (!room || !currentUser) return false;
  if (currentUser.isSuperAdmin) return true;

  const assigned = getFacultyAssignedRoom({
    currentUser,
    rooms: [room],
    timetable,
    selectedBranchId
  });

  return assigned.room?.id === room.id;
};
