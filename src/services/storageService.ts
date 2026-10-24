import {
  Branch,
  User,
  Room,
  TimetableSlot,
  DailyTopicLog,
  DepartmentEvent,
  RoomBooking,
  Notification
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_ROOMS,
  INITIAL_TIMETABLE,
  INITIAL_TOPIC_LOGS,
  INITIAL_EVENTS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS
} from './mockData';
import { isDemoEvent, isDemoNotification, isDemoSlot } from '../utils/eventStatus';

const STORAGE_KEYS = {
  BRANCHES: 'acadpulse_branches_v3',
  CURRENT_USER: 'acadpulse_user_v3',
  SELECTED_BRANCH: 'acadpulse_selected_branch_v3',
  ROOMS: 'acadpulse_rooms_v2',
  TIMETABLE: 'acadpulse_timetable_v2',
  TOPIC_LOGS: 'acadpulse_topic_logs_v2',
  EVENTS: 'adt_events_clean_v1',
  BOOKINGS: 'acadpulse_bookings_v2',
  NOTIFICATIONS: 'acadpulse_notifications_v2',
  THEME: 'acadpulse_theme_v2'
};

export const storageService = {
  // Branches
  getBranches: (): Branch[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRANCHES) || localStorage.getItem('acadpulse_branches_v3') || localStorage.getItem('acadpulse_branches_v2');
      let parsed: Branch[] = [];
      if (data) {
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = [];
        }
      }

      // Initialize with ALL 12 core institutional departments from INITIAL_BRANCHES
      const branchMap = new Map<string, Branch>();
      INITIAL_BRANCHES.forEach(b => {
        branchMap.set(b.id, { ...b });
      });

      // Overlay any user-edited metadata while ensuring all 12 departments remain present
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach(b => {
          if (b && b.id) {
            const canonical = branchMap.get(b.id);
            if (canonical) {
              const merged = { ...canonical, ...b };
              if (merged.hodEmail && (merged.hodEmail.includes('@gmail.com') || merged.hodEmail.includes('@college.edu'))) {
                merged.hodEmail = merged.hodEmail.replace('@gmail.com', '@sjdc.edu').replace('@college.edu', '@sjdc.edu');
              }
              branchMap.set(b.id, merged);
            } else {
              if (b.hodEmail && (b.hodEmail.includes('@gmail.com') || b.hodEmail.includes('@college.edu'))) {
                b.hodEmail = b.hodEmail.replace('@gmail.com', '@sjdc.edu').replace('@college.edu', '@sjdc.edu');
              }
              branchMap.set(b.id, b);
            }
          }
        });
      }

      const allBranches = Array.from(branchMap.values());
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(allBranches));
      return allBranches;
    } catch {
      return INITIAL_BRANCHES;
    }
  },
  setBranches: (branches: Branch[]): void => {
    // Preserve all canonical institutional departments
    const branchMap = new Map<string, Branch>();
    INITIAL_BRANCHES.forEach(b => branchMap.set(b.id, { ...b }));
    if (Array.isArray(branches)) {
      branches.forEach(b => {
        if (b && b.id) {
          const canonical = branchMap.get(b.id);
          if (canonical) {
            branchMap.set(b.id, { ...canonical, ...b });
          } else {
            branchMap.set(b.id, b);
          }
        }
      });
    }
    const cleanBranches = Array.from(branchMap.values());
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(cleanBranches));
  },

  // Current User
  getCurrentUser: (): User => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem('acadpulse_user_v2');
      if (!data) return INITIAL_USERS[0];
      const parsed: User = JSON.parse(data);
      let updated = false;

      // English HOD initial migration from legacy mock names
      if ((parsed.name && (parsed.name.includes('Raisa') || parsed.name.includes('Rajesh') || parsed.name.includes('Sharma'))) && parsed.branchId === 'branch-cse') {
        parsed.name = 'Dr. P.Shahnaz';
        parsed.email = 'p.shahnaz@sjdc.edu';
        parsed.branchName = 'English';
        updated = true;
      }
      if (parsed.branchId === 'branch-cse' && (parsed.branchName === 'Computer Science & Engineering' || !parsed.branchName)) {
        parsed.branchName = 'English';
        updated = true;
      }

      // Computer Science HOD
      if (parsed.id === 'user-hod-aids' || parsed.id === 'user-hod-cs' || (parsed.name && parsed.name.includes('Sundaram')) || (parsed.branchName && parsed.branchName.includes('Artificial Intelligence'))) {
        parsed.id = 'user-hod-cs';
        parsed.name = 'S. Latha Rani';
        parsed.email = 's.latharani@sjdc.edu';
        parsed.branchId = 'branch-cs';
        parsed.branchName = 'Department of Computer Science';
        updated = true;
      }

      // Physics & Electronics HOD
      if (parsed.id === 'user-hod-ece' || parsed.id === 'user-hod-ep' || (parsed.name && parsed.name.includes('Ramanathan')) || (parsed.branchName && parsed.branchName.includes('Electronics & Communication'))) {
        parsed.id = 'user-hod-ep';
        parsed.name = 'Dr. K.S.R Chandra Sekhar';
        parsed.email = 'ksr.chandrasekhar@sjdc.edu';
        parsed.branchId = 'branch-ep';
        parsed.branchName = 'Physics & Electronics';
        updated = true;
      }

      // Microbiology & Biotechnology HOD
      if (parsed.id === 'user-hod-it' || parsed.id === 'user-hod-mb' || (parsed.name && parsed.name.includes('Mahapatra')) || (parsed.branchName && parsed.branchName.includes('Information Technology'))) {
        parsed.id = 'user-hod-mb';
        parsed.name = 'H.N Prasanna';
        parsed.email = 'hn.prasanna@sjdc.edu';
        parsed.branchId = 'branch-mb';
        parsed.branchName = 'Microbiology & Biotechnology';
        updated = true;
      }

      // Mathematics HOD
      if (parsed.id === 'user-hod-math' || (parsed.name && parsed.name.includes('Anuradha'))) {
        parsed.name = 'Dr. T. Mohan Reddy';
        parsed.email = 't.mohanreddy@sjdc.edu';
        parsed.branchName = 'Department of Mathematics';
        updated = true;
      }

      // Statistics HOD
      if (parsed.id === 'user-hod-stat' || (parsed.name && parsed.name.includes('Sengupta'))) {
        parsed.name = 'I. Kalyani';
        parsed.email = 'i.kalyani@sjdc.edu';
        parsed.branchName = 'Department of Statistics';
        updated = true;
      }

      // Zoology HOD
      if (parsed.id === 'user-hod-zoo' || (parsed.name && parsed.name.includes('Ramesh Chandra'))) {
        parsed.name = 'Dr. C.S. Sreenivas Rao';
        parsed.email = 'cs.sreenivasrao@sjdc.edu';
        parsed.branchName = 'Department of Zoology';
        updated = true;
      }

      // Telugu HOD
      if (parsed.id === 'user-hod-tel' || (parsed.name && parsed.name.includes('Srinivas Rao') && !parsed.name.includes('C.S.'))) {
        parsed.name = 'N.Y. Swamy';
        parsed.email = 'ny.swamy@sjdc.edu';
        parsed.branchName = 'Department of Telugu';
        updated = true;
      }

      // Arabic HOD
      if (parsed.id === 'user-hod-arb' || (parsed.name && parsed.name.includes('Mansoor'))) {
        parsed.name = 'TS MD Moin';
        parsed.email = 'ts.mdmoin@sjdc.edu';
        parsed.branchName = 'Department of Arabic';
        updated = true;
      }

      // Hindi HOD
      if (parsed.id === 'user-hod-hin' || (parsed.name && parsed.name.includes('Meenakshi'))) {
        parsed.name = 'SK Mastan Vali';
        parsed.email = 'sk.mastanvali@sjdc.edu';
        parsed.branchName = 'Department of Hindi';
        updated = true;
      }

      // Commerce HOD
      if (parsed.id === 'user-hod-com') {
        parsed.name = 'M. Arjun';
        parsed.email = 'm.arjun@sjdc.edu';
        parsed.branchName = 'Department of Commerce';
        updated = true;
      }

      // Chemistry HOD
      if (parsed.id === 'user-hod-chem') {
        parsed.name = 'K. Vasavi';
        parsed.email = 'k.vasavi@sjdc.edu';
        parsed.branchName = 'Department of Chemistry';
        updated = true;
      }
      if (parsed.email && (parsed.email.includes('@college.edu') || parsed.email.includes('@gmail.com'))) {
        parsed.email = parsed.email.replace('@college.edu', '@sjdc.edu').replace('@gmail.com', '@sjdc.edu');
        updated = true;
      }
      if (!parsed.qualification) {
        const match = INITIAL_USERS.find(u => u.id === parsed.id || u.name === parsed.name);
        parsed.qualification = match?.qualification || 'M.A., M.Phil., Ph.D.';
        updated = true;
      }
      if (parsed.officeLocation === undefined) {
        parsed.officeLocation = 'Faculty Block A, Cabin 204';
        updated = true;
      }
      if (parsed.bio === undefined) {
        parsed.bio = 'Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.';
        updated = true;
      }
      if (parsed.phone) {
        delete parsed.phone;
        updated = true;
      }
      if (parsed.id === 'user-dean' || parsed.name === 'Dr. Alistair Vance') {
        const principal = INITIAL_USERS.find(u => u.id === 'user-principal') || INITIAL_USERS[0];
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(principal));
        return principal;
      }
      if (parsed.role === 'student' || parsed.id === 'user-5') {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
        return INITIAL_USERS[0];
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_USERS[0];
    }
  },
  setCurrentUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Clear user session & department cache on logout
  clearUserSession: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCH);
      localStorage.removeItem('acadpulse_user_v2');
      localStorage.removeItem('acadpulse_selected_branch_v2');
      localStorage.removeItem('adt_active_session_v1');
    } catch (e) {
      console.warn('Could not clear user session:', e);
    }
  },

  // Selected Branch ID
  getSelectedBranchId: (): string => {
    try {
      let id = localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH) || localStorage.getItem('acadpulse_selected_branch_v2');
      if (!id) return 'branch-cse';
      if (id === 'branch-aids') id = 'branch-cs';
      if (id === 'branch-ece') id = 'branch-ep';
      if (id === 'branch-it') id = 'branch-mb';
      localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH, id);
      return id;
    } catch {
      return 'branch-cse';
    }
  },
  setSelectedBranchId: (branchId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH, branchId);
  },

  // Rooms
  getRooms: (): Room[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (!data) return INITIAL_ROOMS;
      const parsed: Room[] = JSON.parse(data);

      // Check if stored rooms contain legacy codes or titles
      const hasOldRooms = parsed.some(r =>
        r.number === 'LH-301' ||
        r.number === 'LH-302' ||
        r.id === 'room-lh301' ||
        r.id === 'room-lh302' ||
        (r.name && (r.name.includes('Alan Turing') || r.name.includes('Ada Lovelace') || r.name.includes('Full-Stack')))
      );
      if (hasOldRooms || parsed.length !== INITIAL_ROOMS.length) {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
        return INITIAL_ROOMS;
      }

      // Ensure Lab 4 is Computer Lab and Chemistry, Zoology, and Botany labs are Life Science
      let typesUpdated = false;
      parsed.forEach(r => {
        if (r.id === 'room-lab4' && r.type !== 'Computer Lab') {
          r.type = 'Computer Lab';
          typesUpdated = true;
        }
        if ((r.id === 'room-chemlab' || r.id === 'room-zoolab-b2' || r.id === 'room-zoolab-b1' || r.id === 'room-botlab') && r.type !== 'Life Science') {
          r.type = 'Life Science';
          typesUpdated = true;
        }
      });
      if (typesUpdated) {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(parsed));
      }

      return parsed;
    } catch {
      return INITIAL_ROOMS;
    }
  },
  setRooms: (rooms: Room[]): void => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  },

  // Timetable
  getTimetable: (): TimetableSlot[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      if (!data) return [];
      const parsed: TimetableSlot[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      const cleaned = parsed.filter(s => !isDemoSlot(s));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },
  setTimetable: (slots: TimetableSlot[]): void => {
    const clean = (slots || []).filter(s => !isDemoSlot(s));
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(clean));
  },

  // Topic Logs
  getTopicLogs: (): DailyTopicLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPIC_LOGS);
      if (!data) return INITIAL_TOPIC_LOGS;
      const parsed: DailyTopicLog[] = JSON.parse(data);
      let updated = false;

      parsed.forEach(l => {
        if (l.facultyName === 'Raisa Tahseen' || (l.branchId === 'branch-cse' && l.subjectCode === 'CS503')) {
          l.facultyName = 'Dr. P.Shahnaz';
          updated = true;
        }
      });

      const newBranchIds = ['branch-com', 'branch-chem'];
      const missingBranchLogs = INITIAL_TOPIC_LOGS.filter(l => newBranchIds.includes(l.branchId) && !parsed.some(existing => existing.id === l.id));
      if (missingBranchLogs.length > 0) {
        const merged = [...parsed, ...missingBranchLogs];
        localStorage.setItem(STORAGE_KEYS.TOPIC_LOGS, JSON.stringify(merged));
        return merged;
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.TOPIC_LOGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_TOPIC_LOGS;
    }
  },
  setTopicLogs: (logs: DailyTopicLog[]): void => {
    localStorage.setItem(STORAGE_KEYS.TOPIC_LOGS, JSON.stringify(logs));
  },

  // Events
  getEvents: (): DepartmentEvent[] => {
    try {
      // Purge any obsolete cached demo data keys
      localStorage.removeItem('acadpulse_events_v2');
      localStorage.removeItem('acadpulse_events');
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) return [];
      const parsed: DepartmentEvent[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      // Strictly exclude any leftover mock/demo events
      return parsed.filter(e => !isDemoEvent(e));
    } catch {
      return [];
    }
  },
  setEvents: (events: DepartmentEvent[]): void => {
    const clean = (events || []).filter(e => !isDemoEvent(e));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(clean));
  },

  // Bookings
  getBookings: (): RoomBooking[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (!data) return INITIAL_BOOKINGS;
      const parsed: RoomBooking[] = JSON.parse(data);
      let updated = false;
      parsed.forEach(b => {
        if (b.bookedBy === 'Raisa Tahseen') {
          b.bookedBy = 'Dr. P.Shahnaz';
          updated = true;
        }
        if (b.roomId === 'room-lab101' || b.roomNumber === 'LAB-101') {
          b.roomId = 'room-lab1';
          b.roomNumber = 'LAB-1';
          updated = true;
        }
        if (b.roomId === 'room-sh401' || b.roomNumber === 'SH-401' || b.roomId === 'room-aud1' || b.roomNumber === 'AUD-01') {
          b.roomId = 'room-sh';
          b.roomNumber = 'SEMINAR';
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_BOOKINGS;
    }
  },
  setBookings: (bookings: RoomBooking[]): void => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  // Notifications
  getNotifications: (): Notification[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) return [];
      const parsed: Notification[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      const cleaned = parsed.filter(n => !isDemoNotification(n));
      let updated = cleaned.length !== parsed.length;
      cleaned.forEach(n => {
        if (n.author && n.author.includes('Raisa Tahseen')) {
          n.author = 'Dr. P.Shahnaz (HOD - English)';
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },
  setNotifications: (notifications: Notification[]): void => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  // Theme
  getTheme: (): 'dark' | 'light' => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME);
      return data === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  },
  setTheme: (theme: 'dark' | 'light'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Full Department Backup Export (JSON)
  exportFullBackupJSON: () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      branches: storageService.getBranches(),
      rooms: storageService.getRooms(),
      timetable: storageService.getTimetable(),
      topicLogs: storageService.getTopicLogs(),
      events: storageService.getEvents(),
      bookings: storageService.getBookings(),
      notifications: storageService.getNotifications()
    };
    return JSON.stringify(backup, null, 2);
  },

  // Full Department Restore from JSON
  restoreFullBackupJSON: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.branches) storageService.setBranches(parsed.branches);
      if (parsed.rooms) storageService.setRooms(parsed.rooms);
      if (parsed.timetable) storageService.setTimetable(parsed.timetable);
      if (parsed.topicLogs) storageService.setTopicLogs(parsed.topicLogs);
      if (parsed.events) storageService.setEvents(parsed.events);
      if (parsed.bookings) storageService.setBookings(parsed.bookings);
      if (parsed.notifications) storageService.setNotifications(parsed.notifications);
      return true;
    } catch (err) {
      console.error('Failed to parse backup JSON', err);
      return false;
    }
  },

  // Reset to Default Mock Data
  resetToDefaultData: (): void => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH, 'branch-cse');
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(INITIAL_TIMETABLE));
    localStorage.setItem(STORAGE_KEYS.TOPIC_LOGS, JSON.stringify(INITIAL_TOPIC_LOGS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
};
