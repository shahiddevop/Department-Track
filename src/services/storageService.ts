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

const STORAGE_KEYS = {
  BRANCHES: 'acadpulse_branches_v3',
  CURRENT_USER: 'acadpulse_user_v3',
  SELECTED_BRANCH: 'acadpulse_selected_branch_v3',
  ROOMS: 'acadpulse_rooms_v2',
  TIMETABLE: 'acadpulse_timetable_v2',
  TOPIC_LOGS: 'acadpulse_topic_logs_v2',
  EVENTS: 'acadpulse_events_v2',
  BOOKINGS: 'acadpulse_bookings_v2',
  NOTIFICATIONS: 'acadpulse_notifications_v2',
  THEME: 'acadpulse_theme_v2'
};

export const storageService = {
  // Branches
  getBranches: (): Branch[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRANCHES) || localStorage.getItem('acadpulse_branches_v2');
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
        return INITIAL_BRANCHES;
      }
      const parsed: Branch[] = JSON.parse(data);
      let updated = false;

      parsed.forEach(b => {
        // English department
        if (b.id === 'branch-cse' || b.code === 'ENG' || (b.name && b.name.toLowerCase().includes('english'))) {
          b.id = 'branch-cse';
          b.code = 'ENG';
          b.name = 'English';
          b.description = 'Premier department specializing in English Language, Literature, Linguistics, and Business Communication.';
          b.totalFaculty = 12;
          b.hodName = 'Dr. P.Shahnaz';
          b.hodEmail = 'p.shahnaz@gmail.com';
          b.color = '#6366f1';
          updated = true;
        }

        // Replace Artificial Intelligence / CS -> Department of Computer Science
        if (b.id === 'branch-aids' || b.id === 'branch-cs' || b.code === 'CS' || b.code === 'AI & DS' || (b.name && (b.name.toLowerCase().includes('computer science') || b.name.includes('Artificial Intelligence')))) {
          b.id = 'branch-cs';
          b.code = 'CS';
          b.name = 'Department of Computer Science';
          b.description = 'Premier department of Computer Science offering cutting-edge education in Software Engineering, Algorithms, Operating Systems, Cloud Computing, and AI.';
          b.hodName = 'S. Latha Rani';
          b.hodEmail = 's.latharani@gmail.com';
          b.color = '#8b5cf6';
          b.totalFaculty = 22;
          b.totalStudents = 420;
          b.establishedYear = 2001;
          updated = true;
        }

        // Replace Electronics & Communication / EP -> Physics & Electronics
        if (b.id === 'branch-ece' || b.id === 'branch-ep' || b.code === 'ECE' || b.code === 'EP' || (b.name && (b.name.toLowerCase().includes('physics') || b.name.toLowerCase().includes('electronics')))) {
          b.id = 'branch-ep';
          b.code = 'EP';
          b.name = 'Physics & Electronics';
          b.description = 'Interdisciplinary program integrating Solid State Devices, Quantum Physics, Optics, Circuit Design, and Applied Electronics.';
          b.hodName = 'Dr. K.S.R Chandra Sekhar';
          b.hodEmail = 'ksr.chandrasekhar@gmail.com';
          b.color = '#ec4899';
          b.totalFaculty = 20;
          b.totalStudents = 360;
          b.establishedYear = 2002;
          updated = true;
        }

        // Replace Information Technology / MB -> Microbiology & Biotechnology
        if (b.id === 'branch-it' || b.id === 'branch-mb' || b.code === 'IT' || b.code === 'MB & BT' || (b.name && (b.name.toLowerCase().includes('microbiology') || b.name.toLowerCase().includes('biotechnology')))) {
          b.id = 'branch-mb';
          b.code = 'MB & BT';
          b.name = 'Microbiology & Biotechnology';
          b.description = 'Advanced research and education in Microbial Genomics, Applied Biotechnology, Immunology, and Bioprocess Engineering.';
          b.hodName = 'H.N Prasanna';
          b.hodEmail = 'hn.prasanna@gmail.com';
          b.color = '#06b6d4';
          b.totalFaculty = 16;
          b.totalStudents = 300;
          b.establishedYear = 2008;
          updated = true;
        }

        // Mathematics
        if (b.id === 'branch-math' || b.code === 'MATH' || (b.name && b.name.toLowerCase().includes('mathematics'))) {
          b.id = 'branch-math';
          b.code = 'MATH';
          b.name = 'Department of Mathematics';
          b.hodName = 'Dr. T. Mohan Reddy';
          b.hodEmail = 't.mohanreddy@gmail.com';
          updated = true;
        }

        // Statistics
        if (b.id === 'branch-stat' || b.code === 'STAT' || (b.name && b.name.toLowerCase().includes('statistics'))) {
          b.id = 'branch-stat';
          b.code = 'STAT';
          b.name = 'Department of Statistics';
          b.hodName = 'I. Kalyani';
          b.hodEmail = 'i.kalyani@gmail.com';
          updated = true;
        }

        // Zoology
        if (b.id === 'branch-zoo' || b.code === 'ZOO' || (b.name && b.name.toLowerCase().includes('zoology'))) {
          b.id = 'branch-zoo';
          b.code = 'ZOO';
          b.name = 'Department of Zoology';
          b.hodName = 'Dr. C.S. Sreenivas Rao';
          b.hodEmail = 'cs.sreenivasrao@gmail.com';
          updated = true;
        }

        // Telugu
        if (b.id === 'branch-tel' || b.code === 'TEL' || (b.name && b.name.toLowerCase().includes('telugu'))) {
          b.id = 'branch-tel';
          b.code = 'TEL';
          b.name = 'Department of Telugu';
          b.hodName = 'N.Y. Swamy';
          b.hodEmail = 'ny.swamy@gmail.com';
          updated = true;
        }

        // Arabic
        if (b.id === 'branch-arb' || b.code === 'ARB' || (b.name && b.name.toLowerCase().includes('arabic'))) {
          b.id = 'branch-arb';
          b.code = 'ARB';
          b.name = 'Department of Arabic';
          b.hodName = 'TS MD Moin';
          b.hodEmail = 'ts.mdmoin@gmail.com';
          updated = true;
        }

        // Hindi
        if (b.id === 'branch-hin' || b.code === 'HIN' || (b.name && b.name.toLowerCase().includes('hindi'))) {
          b.id = 'branch-hin';
          b.code = 'HIN';
          b.name = 'Department of Hindi';
          b.hodName = 'SK Mastan Vali';
          b.hodEmail = 'sk.mastanvali@gmail.com';
          updated = true;
        }

        // Commerce
        if (b.id === 'branch-com' || b.code === 'COM' || (b.name && b.name.toLowerCase().includes('commerce'))) {
          b.id = 'branch-com';
          b.code = 'COM';
          b.name = 'Department of Commerce';
          b.hodName = 'M. Arjun';
          b.hodEmail = 'm.arjun@gmail.com';
          updated = true;
        }

        // Chemistry
        if (b.id === 'branch-chem' || b.code === 'CHEM' || (b.name && b.name.toLowerCase().includes('chemistry'))) {
          b.id = 'branch-chem';
          b.code = 'CHEM';
          b.name = 'Department of Chemistry';
          b.hodName = 'K. Vasavi';
          b.hodEmail = 'k.vasavi@gmail.com';
          updated = true;
        }

        if (b.hodEmail && b.hodEmail.includes('@college.edu')) {
          b.hodEmail = b.hodEmail.replace('@college.edu', '@gmail.com');
          updated = true;
        }
      });

      // Deduplicate by ID
      const uniqueBranches: Branch[] = [];
      const seenIds = new Set<string>();
      for (const b of parsed) {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          uniqueBranches.push(b);
        } else {
          updated = true;
        }
      }

      // Add Department of Mathematics if missing
      if (!uniqueBranches.some(b => b.id === 'branch-math' || b.name === 'Department of Mathematics' || b.code === 'MATH')) {
        const mathBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-math');
        if (mathBranch) {
          uniqueBranches.push(mathBranch);
          updated = true;
        }
      }

      // Add Department of Statistics if missing
      if (!uniqueBranches.some(b => b.id === 'branch-stat' || b.name === 'Department of Statistics' || b.code === 'STAT')) {
        const statBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-stat');
        if (statBranch) {
          uniqueBranches.push(statBranch);
          updated = true;
        }
      }

      // Add Department of Zoology if missing
      if (!uniqueBranches.some(b => b.id === 'branch-zoo' || b.name.includes('Zoology') || b.code === 'ZOO')) {
        const zooBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-zoo');
        if (zooBranch) {
          uniqueBranches.push(zooBranch);
          updated = true;
        }
      }

      // Add Department of Telugu if missing
      if (!uniqueBranches.some(b => b.id === 'branch-tel' || b.name.includes('Telugu') || b.code === 'TEL')) {
        const telBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-tel');
        if (telBranch) {
          uniqueBranches.push(telBranch);
          updated = true;
        }
      }

      // Add Department of Arabic if missing
      if (!uniqueBranches.some(b => b.id === 'branch-arb' || b.name.includes('Arabic') || b.code === 'ARB')) {
        const arbBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-arb');
        if (arbBranch) {
          uniqueBranches.push(arbBranch);
          updated = true;
        }
      }

      // Add Department of Hindi if missing
      if (!uniqueBranches.some(b => b.id === 'branch-hin' || b.name.includes('Hindi') || b.code === 'HIN')) {
        const hinBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-hin');
        if (hinBranch) {
          uniqueBranches.push(hinBranch);
          updated = true;
        }
      }

      // Add Department of Commerce if missing
      if (!uniqueBranches.some(b => b.id === 'branch-com' || b.name.includes('Commerce') || b.code === 'COM')) {
        const comBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-com');
        if (comBranch) {
          uniqueBranches.push(comBranch);
          updated = true;
        }
      }

      // Add Department of Chemistry if missing
      if (!uniqueBranches.some(b => b.id === 'branch-chem' || b.name.includes('Chemistry') || b.code === 'CHEM')) {
        const chemBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-chem');
        if (chemBranch) {
          uniqueBranches.push(chemBranch);
          updated = true;
        }
      }

      if (updated || !localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(uniqueBranches));
        localStorage.setItem('acadpulse_branches_v2', JSON.stringify(uniqueBranches));
      }
      return uniqueBranches;
    } catch {
      return INITIAL_BRANCHES;
    }
  },
  setBranches: (branches: Branch[]): void => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    localStorage.setItem('acadpulse_branches_v2', JSON.stringify(branches));
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
        parsed.email = 'p.shahnaz@gmail.com';
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
        parsed.email = 's.latharani@gmail.com';
        parsed.branchId = 'branch-cs';
        parsed.branchName = 'Department of Computer Science';
        updated = true;
      }

      // Physics & Electronics HOD
      if (parsed.id === 'user-hod-ece' || parsed.id === 'user-hod-ep' || (parsed.name && parsed.name.includes('Ramanathan')) || (parsed.branchName && parsed.branchName.includes('Electronics & Communication'))) {
        parsed.id = 'user-hod-ep';
        parsed.name = 'Dr. K.S.R Chandra Sekhar';
        parsed.email = 'ksr.chandrasekhar@gmail.com';
        parsed.branchId = 'branch-ep';
        parsed.branchName = 'Physics & Electronics';
        updated = true;
      }

      // Microbiology & Biotechnology HOD
      if (parsed.id === 'user-hod-it' || parsed.id === 'user-hod-mb' || (parsed.name && parsed.name.includes('Mahapatra')) || (parsed.branchName && parsed.branchName.includes('Information Technology'))) {
        parsed.id = 'user-hod-mb';
        parsed.name = 'H.N Prasanna';
        parsed.email = 'hn.prasanna@gmail.com';
        parsed.branchId = 'branch-mb';
        parsed.branchName = 'Microbiology & Biotechnology';
        updated = true;
      }

      // Mathematics HOD
      if (parsed.id === 'user-hod-math' || (parsed.name && parsed.name.includes('Anuradha'))) {
        parsed.name = 'Dr. T. Mohan Reddy';
        parsed.email = 't.mohanreddy@gmail.com';
        parsed.branchName = 'Department of Mathematics';
        updated = true;
      }

      // Statistics HOD
      if (parsed.id === 'user-hod-stat' || (parsed.name && parsed.name.includes('Sengupta'))) {
        parsed.name = 'I. Kalyani';
        parsed.email = 'i.kalyani@gmail.com';
        parsed.branchName = 'Department of Statistics';
        updated = true;
      }

      // Zoology HOD
      if (parsed.id === 'user-hod-zoo' || (parsed.name && parsed.name.includes('Ramesh Chandra'))) {
        parsed.name = 'Dr. C.S. Sreenivas Rao';
        parsed.email = 'cs.sreenivasrao@gmail.com';
        parsed.branchName = 'Department of Zoology';
        updated = true;
      }

      // Telugu HOD
      if (parsed.id === 'user-hod-tel' || (parsed.name && parsed.name.includes('Srinivas Rao') && !parsed.name.includes('C.S.'))) {
        parsed.name = 'N.Y. Swamy';
        parsed.email = 'ny.swamy@gmail.com';
        parsed.branchName = 'Department of Telugu';
        updated = true;
      }

      // Arabic HOD
      if (parsed.id === 'user-hod-arb' || (parsed.name && parsed.name.includes('Mansoor'))) {
        parsed.name = 'TS MD Moin';
        parsed.email = 'ts.mdmoin@gmail.com';
        parsed.branchName = 'Department of Arabic';
        updated = true;
      }

      // Hindi HOD
      if (parsed.id === 'user-hod-hin' || (parsed.name && parsed.name.includes('Meenakshi'))) {
        parsed.name = 'SK Mastan Vali';
        parsed.email = 'sk.mastanvali@gmail.com';
        parsed.branchName = 'Department of Hindi';
        updated = true;
      }

      // Commerce HOD
      if (parsed.id === 'user-hod-com') {
        parsed.name = 'M. Arjun';
        parsed.email = 'm.arjun@gmail.com';
        parsed.branchName = 'Department of Commerce';
        updated = true;
      }

      // Chemistry HOD
      if (parsed.id === 'user-hod-chem') {
        parsed.name = 'K. Vasavi';
        parsed.email = 'k.vasavi@gmail.com';
        parsed.branchName = 'Department of Chemistry';
        updated = true;
      }
      if (parsed.email && parsed.email.includes('@college.edu')) {
        parsed.email = parsed.email.replace('@college.edu', '@gmail.com');
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
      if (parsed.avatar) {
        parsed.avatar = '';
        updated = true;
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
      if (!data) return INITIAL_TIMETABLE;
      const parsed: TimetableSlot[] = JSON.parse(data);
      let updated = false;

      // Consolidate faculty migrations into a clean dictionary mapping
      const facultyMap: Record<string, string> = {
        'Raisa Tahseen': 'Dr. P.Shahnaz',
        'Dr. Rajesh Sharma': 'Dr. P.Shahnaz',
        'Dr. Ramesh Chandra': 'Dr. C.S. Sreenivas Rao',
        'Dr. K. Srinivas Rao': 'N.Y. Swamy',
        'Dr. Tariq Al-Mansoor': 'TS MD Moin',
        'Dr. Meenakshi Pandey': 'SK Mastan Vali'
      };

      parsed.forEach(s => {
        if (facultyMap[s.facultyName]) {
          s.facultyName = facultyMap[s.facultyName];
          updated = true;
        } else if (s.facultyId === 'user-1' && s.branchId === 'branch-cse') {
          s.facultyName = 'Dr. P.Shahnaz';
          updated = true;
        }
      });

      const newBranchIds = ['branch-zoo', 'branch-tel', 'branch-arb', 'branch-hin', 'branch-com', 'branch-chem'];
      const missingBranchSlots = INITIAL_TIMETABLE.filter(s => newBranchIds.includes(s.branchId) && !parsed.some(existing => existing.id === s.id));
      if (missingBranchSlots.length > 0) {
        const merged = [...parsed, ...missingBranchSlots];
        localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(merged));
        return merged;
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_TIMETABLE;
    }
  },
  setTimetable: (slots: TimetableSlot[]): void => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(slots));
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
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) return INITIAL_EVENTS;
      const parsed: DepartmentEvent[] = JSON.parse(data);
      let updated = false;

      const coordinatorMap: Record<string, string> = {
        'Raisa Tahseen': 'Dr. P.Shahnaz',
        'Dr. Ramesh Chandra': 'Dr. C.S. Sreenivas Rao',
        'Dr. K. Srinivas Rao': 'N.Y. Swamy',
        'Dr. Tariq Al-Mansoor': 'TS MD Moin',
        'Dr. Meenakshi Pandey': 'SK Mastan Vali'
      };

      parsed.forEach(e => {
        if (coordinatorMap[e.facultyCoordinator]) {
          e.facultyCoordinator = coordinatorMap[e.facultyCoordinator];
          updated = true;
        }
        if (e.studentCoordinator === undefined) {
          const matchInitial = INITIAL_EVENTS.find(init => init.id === e.id);
          e.studentCoordinator = matchInitial?.studentCoordinator || '';
          updated = true;
        }
      });

      const newBranchIds = ['branch-zoo', 'branch-tel', 'branch-arb', 'branch-hin', 'branch-com', 'branch-chem'];
      const missingBranchEvents = INITIAL_EVENTS.filter(e => newBranchIds.includes(e.branchId) && !parsed.some(existing => existing.id === e.id));
      if (missingBranchEvents.length > 0) {
        const merged = [...parsed, ...missingBranchEvents];
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(merged));
        return merged;
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_EVENTS;
    }
  },
  setEvents: (events: DepartmentEvent[]): void => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
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
      if (!data) return INITIAL_NOTIFICATIONS;
      const parsed: Notification[] = JSON.parse(data);
      let updated = false;
      parsed.forEach(n => {
        if (n.author && n.author.includes('Raisa Tahseen')) {
          n.author = 'Dr. P.Shahnaz (HOD - English)';
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_NOTIFICATIONS;
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
