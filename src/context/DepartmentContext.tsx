import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Branch,
  Room,
  TimetableSlot,
  DailyTopicLog,
  DepartmentEvent,
  RoomBooking,
  Notification,
  TabType,
  SubjectProgress
} from '../types';
import { storageService } from '../services/storageService';
import { firestoreService } from '../services/firestoreService';
import { calculateEventStatus, isDemoEvent, isDemoNotification, isDemoSlot, isDemoTopicLog } from '../utils/eventStatus';
import { syncAllRoomStatuses, isBookingActiveNow, formatTime12h } from '../utils/roomStatus';
import { useAuth } from './AuthContext';
import { INITIAL_BRANCHES } from '../services/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ConflictCheckResult {
  hasConflict: boolean;
  message?: string;
  conflictingSlot?: TimetableSlot;
}

interface DepartmentContextType {
  // Theme & Navigation
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Branches
  branches: Branch[];
  selectedBranchId: string;
  selectedBranch: Branch;
  setSelectedBranchId: (id: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;

  // Timetable
  timetable: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => ConflictCheckResult;
  updateTimetableSlot: (id: string, slot: Partial<TimetableSlot>) => ConflictCheckResult;
  deleteTimetableSlot: (id: string) => void;
  checkSlotConflict: (slot: Partial<TimetableSlot>, excludeId?: string) => ConflictCheckResult;

  // Teaching Plans & Logs
  topicLogs: DailyTopicLog[];
  addTopicLog: (log: Omit<DailyTopicLog, 'id'>) => void;
  updateTopicLog: (id: string, log: Partial<DailyTopicLog>) => void;
  deleteTopicLog: (id: string) => void;
  subjectsProgress: SubjectProgress[];
  updateSubject: (oldCode: string, updated: { subjectCode: string; subjectName: string; facultyName: string; semester: number; totalUnits?: number; totalPlannedHours?: number }) => void;
  deleteSubject: (subjectCode: string) => void;

  // Events
  events: DepartmentEvent[];
  addEvent: (event: Omit<DepartmentEvent, 'id' | 'registeredCount'>) => void;
  updateEvent: (id: string, event: Partial<DepartmentEvent>) => boolean;
  deleteEvent: (id: string) => boolean;
  isEventCreator: (event: DepartmentEvent) => boolean;
  registerEventRSVP: (eventId: string) => boolean;

  // Rooms & Bookings
  rooms: Room[];
  bookings: RoomBooking[];
  addRoomBooking: (booking: Omit<RoomBooking, 'id' | 'status' | 'timestamp'>) => boolean;
  deleteRoomBooking: (id: string) => void;
  clearAllBookings: () => void;
  updateRoomStatus: (roomId: string, status: Room['currentStatus'], occupant?: string, subject?: string, slotTime?: string) => void;

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  urgentNotifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Backup & Reset
  resetData: () => void;
  restoreData: (json: string) => boolean;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => storageService.getTheme());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Core Data States
  const [branches, setBranches] = useState<Branch[]>(() => storageService.getBranches());
  const [selectedBranchId, setSelectedBranchIdState] = useState<string>(() => {
    if (currentUser?.branchId && currentUser.branchId !== 'ALL') {
      return currentUser.branchId;
    }
    return storageService.getSelectedBranchId();
  });
  const [bookings, setBookings] = useState<RoomBooking[]>(() => storageService.getBookings());
  const [rooms, setRooms] = useState<Room[]>(() => {
    const storedRooms = storageService.getRooms();
    const storedBookings = storageService.getBookings();
    const { updatedRooms } = syncAllRoomStatuses(storedRooms, storedBookings, new Date());
    return updatedRooms;
  });
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const stored = storageService.getTimetable();
    return stored.filter(s => !isDemoSlot(s));
  });
  const [topicLogs, setTopicLogs] = useState<DailyTopicLog[]>(() => {
    const stored = storageService.getTopicLogs();
    return stored.filter(l => !isDemoTopicLog(l));
  });
  const [events, setEvents] = useState<DepartmentEvent[]>(() => {
    const stored = storageService.getEvents();
    return stored
      .filter(e => !isDemoEvent(e))
      .map(e => ({ ...e, status: calculateEventStatus(e) }));
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = storageService.getNotifications();
    return stored.filter(n => !isDemoNotification(n));
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    storageService.setTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    storageService.setBranches(branches);
  }, [branches]);

  useEffect(() => {
    storageService.setSelectedBranchId(selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    storageService.setRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    storageService.setTimetable(timetable);
  }, [timetable]);

  useEffect(() => {
    storageService.setTopicLogs(topicLogs);
  }, [topicLogs]);

  useEffect(() => {
    storageService.setEvents(events);
  }, [events]);

  // Automatically update event statuses based on current date and time
  useEffect(() => {
    const syncEventStatuses = () => {
      setEvents(prev => {
        let hasChanges = false;
        const updated = prev.map(ev => {
          const autoStatus = calculateEventStatus(ev);
          if (ev.status !== autoStatus) {
            hasChanges = true;
            return { ...ev, status: autoStatus };
          }
          return ev;
        });
        return hasChanges ? updated : prev;
      });
    };

    syncEventStatuses();
    const interval = setInterval(syncEventStatuses, 15000); // Re-check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Automatically sync room occupancy against real-time booking intervals & current clock
  useEffect(() => {
    const syncRoomStatuses = () => {
      const now = new Date();
      setRooms(prevRooms => {
        const { updatedRooms, hasChanges } = syncAllRoomStatuses(prevRooms, bookings, now);
        return hasChanges ? updatedRooms : prevRooms;
      });
    };

    syncRoomStatuses();
    const interval = setInterval(syncRoomStatuses, 5000); // Re-check every 5 seconds
    return () => clearInterval(interval);
  }, [bookings]);

  useEffect(() => {
    storageService.setBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    storageService.setNotifications(notifications);
  }, [notifications]);

  // Real-time Cloud Firestore synchronization
  useEffect(() => {
    // 1. Seed initial data if Firestore database is empty
    firestoreService.seedInitialDataIfEmpty().catch(err => {
      console.warn('[Firestore] Seed check:', err);
    });
    firestoreService.purgeDemoTimetable().catch(() => {});
    firestoreService.purgeDemoNotifications().catch(() => {});
    firestoreService.purgeDemoEvents().catch(() => {});
    firestoreService.purgeDemoTopicLogs().catch(() => {});

    // 2. Subscribe to real-time Cloud Firestore updates
    const unsubEvents = firestoreService.subscribeEvents(cloudEvents => {
      const cleanEvents = (cloudEvents || []).filter(e => !isDemoEvent(e));
      setEvents(cleanEvents.map(e => ({
        ...e,
        status: calculateEventStatus(e)
      })));
    });

    const unsubTimetable = firestoreService.subscribeTimetable(cloudSlots => {
      setTimetable((cloudSlots || []).filter(s => !isDemoSlot(s)));
    });

    const unsubLogs = firestoreService.subscribeTopicLogs(cloudLogs => {
      setTopicLogs((cloudLogs || []).filter(l => !isDemoTopicLog(l)));
    });

    const unsubBranches = firestoreService.subscribeBranches(cloudBranches => {
      const branchMap = new Map<string, Branch>();
      INITIAL_BRANCHES.forEach(b => branchMap.set(b.id, { ...b }));
      (cloudBranches || []).forEach(b => {
        const canonical = branchMap.get(b.id);
        if (canonical) {
          branchMap.set(b.id, { ...canonical, ...b });
        } else {
          branchMap.set(b.id, b);
        }
      });
      setBranches(Array.from(branchMap.values()));
    });

    const unsubRooms = firestoreService.subscribeRooms(cloudRooms => {
      setRooms(cloudRooms);
    });

    const unsubBookings = firestoreService.subscribeBookings(cloudBookings => {
      setBookings(cloudBookings);
    });

    const unsubNotifs = firestoreService.subscribeNotifications(cloudNotifs => {
      setNotifications((cloudNotifs || []).filter(n => !isDemoNotification(n)));
    });

    return () => {
      unsubEvents();
      unsubTimetable();
      unsubLogs();
      unsubBranches();
      unsubRooms();
      unsubBookings();
      unsubNotifs();
    };
  }, []);

  // Toast System Helper
  const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setSelectedBranchId = (id: string) => {
    const validId =
      id === 'branch-aids' ? 'branch-cs' :
        id === 'branch-ece' ? 'branch-ep' :
          id === 'branch-it' ? 'branch-mb' :
            id;
    setSelectedBranchIdState(validId);
    storageService.setSelectedBranchId(validId);
    const branch = branches.find(b => b.id === validId) || INITIAL_BRANCHES.find(b => b.id === validId);
    if (branch) {
      addToast(`Switched active branch to ${branch.name}`, 'info');
    }
  };

  // Whenever the authenticated user changes, synchronize active department based on user's unique ID
  useEffect(() => {
    if (currentUser?.branchId && currentUser.branchId !== 'ALL') {
      if (selectedBranchId !== currentUser.branchId) {
        setSelectedBranchIdState(currentUser.branchId);
        storageService.setSelectedBranchId(currentUser.branchId);
      }
    }
  }, [currentUser?.id, currentUser?.branchId]);

  // Query database using the logged-in user's unique ID to verify department assignment
  useEffect(() => {
    if (currentUser?.id && currentUser?.branchId && currentUser.branchId !== 'ALL') {
      firestoreService.getDepartmentForUser(currentUser.id).then(res => {
        if (res?.branchId && res.branchId !== selectedBranchId) {
          setSelectedBranchIdState(res.branchId);
          storageService.setSelectedBranchId(res.branchId);
        }
      }).catch(err => {
        console.warn('[DepartmentContext] Department verify notice:', err);
      });
    }
  }, [currentUser?.id]);

  const selectedBranch = useMemo(() => {
    const found = branches.find(b => b.id === selectedBranchId);
    if (found) return found;
    const canonical = INITIAL_BRANCHES.find(b => b.id === selectedBranchId);
    if (canonical) return canonical;
    if (currentUser?.branchId && currentUser.branchId !== 'ALL') {
      const userDept = INITIAL_BRANCHES.find(b => b.id === currentUser.branchId);
      if (userDept) return userDept;
    }
    return branches[0] || INITIAL_BRANCHES[0];
  }, [branches, selectedBranchId, currentUser?.branchId]);

  // Branch CRUD
  const addBranch = (newBranchData: Omit<Branch, 'id'>) => {
    const id = 'branch-' + Math.random().toString(36).substr(2, 9);
    const newBranch: Branch = { ...newBranchData, id };
    setBranches(prev => [...prev, newBranch]);
    setSelectedBranchIdState(id);
    firestoreService.saveBranch(newBranch);
    addToast(`New branch ${newBranch.name} created successfully!`, 'success');
  };

  const updateBranch = (id: string, updated: Partial<Branch>) => {
    const existing = branches.find(b => b.id === id);
    if (existing) {
      const merged = { ...existing, ...updated };
      setBranches(prev => prev.map(b => b.id === id ? merged : b));
      firestoreService.saveBranch(merged);
    }
    addToast('Branch details updated', 'success');
  };

  // Timetable Conflict Detection Engine
  const checkSlotConflict = (slot: Partial<TimetableSlot>, excludeId?: string): ConflictCheckResult => {
    if (!slot.day || !slot.startTime || !slot.endTime) return { hasConflict: false };

    // Convert time HH:mm to minutes for overlap calculation
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = toMin(slot.startTime);
    const newEnd = toMin(slot.endTime);

    for (const existing of timetable) {
      if (excludeId && existing.id === excludeId) continue;
      if (existing.day !== slot.day) continue;

      const exStart = toMin(existing.startTime);
      const exEnd = toMin(existing.endTime);

      // Check overlap: StartA < EndB and EndA > StartB
      const overlaps = newStart < exEnd && newEnd > exStart;
      if (!overlaps) continue;

      // 1. Room Double Booking
      if (slot.roomId && existing.roomId === slot.roomId) {
        return {
          hasConflict: true,
          message: `Room Conflict: ${existing.roomName} is already assigned to "${existing.subjectName}" (${existing.startTime} - ${existing.endTime})`,
          conflictingSlot: existing
        };
      }

      // 2. Faculty Double Booking
      if (slot.facultyName && existing.facultyName === slot.facultyName) {
        return {
          hasConflict: true,
          message: `Faculty Conflict: ${existing.facultyName} is already teaching "${existing.subjectName}" in ${existing.roomName} (${existing.startTime} - ${existing.endTime})`,
          conflictingSlot: existing
        };
      }

      // 3. Class Section Double Booking
      if (
        slot.branchId === existing.branchId &&
        slot.semester === existing.semester &&
        slot.section === existing.section
      ) {
        return {
          hasConflict: true,
          message: `Section Conflict: Sem ${existing.semester} (${existing.section}) already has "${existing.subjectName}" at this time`,
          conflictingSlot: existing
        };
      }
    }

    return { hasConflict: false };
  };

  // Timetable CRUD
  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>): ConflictCheckResult => {
    const conflict = checkSlotConflict(slotData);
    if (conflict.hasConflict) {
      addToast(conflict.message || 'Schedule conflict detected!', 'error');
      return conflict;
    }
    const id = 'slot-' + Math.random().toString(36).substr(2, 9);
    const newSlot: TimetableSlot = { ...slotData, id };
    setTimetable(prev => [...prev, newSlot]);
    firestoreService.saveTimetableSlot(newSlot);
    addToast(`Added ${newSlot.subjectCode} to ${newSlot.day} schedule`, 'success');
    return { hasConflict: false };
  };

  const updateTimetableSlot = (id: string, updated: Partial<TimetableSlot>): ConflictCheckResult => {
    const existing = timetable.find(s => s.id === id);
    if (!existing) return { hasConflict: false };

    const merged = { ...existing, ...updated };
    const conflict = checkSlotConflict(merged, id);
    if (conflict.hasConflict) {
      addToast(conflict.message || 'Schedule conflict detected!', 'error');
      return conflict;
    }
    setTimetable(prev => prev.map(s => s.id === id ? merged : s));
    firestoreService.saveTimetableSlot(merged);
    addToast('Schedule slot updated successfully', 'success');
    return { hasConflict: false };
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable(prev => prev.filter(s => s.id !== id));
    firestoreService.deleteTimetableSlot(id);
    addToast('Slot removed from timetable', 'info');
  };

  // Daily Topic Logs CRUD
  const addTopicLog = (logData: Omit<DailyTopicLog, 'id'>) => {
    const id = 'log-' + Math.random().toString(36).substr(2, 9);
    const newLog: DailyTopicLog = { ...logData, id };
    setTopicLogs(prev => [newLog, ...prev]);
    firestoreService.saveTopicLog(newLog);
    addToast(`Teaching log recorded for ${newLog.subjectCode}: ${newLog.topicTitle}`, 'success');
  };

  const updateTopicLog = (id: string, updated: Partial<DailyTopicLog>) => {
    const existing = topicLogs.find(l => l.id === id);
    if (existing) {
      const merged = { ...existing, ...updated };
      setTopicLogs(prev => prev.map(l => l.id === id ? merged : l));
      firestoreService.saveTopicLog(merged);
    }
    addToast('Teaching log updated', 'success');
  };

  const deleteTopicLog = (id: string) => {
    setTopicLogs(prev => prev.filter(l => l.id !== id));
    firestoreService.deleteTopicLog(id);
    addToast('Teaching log entry removed', 'info');
  };

  // Subject Overrides State (for custom units and planned hours)
  const [subjectOverrides, setSubjectOverrides] = useState<Record<string, { totalUnits?: number; totalPlannedHours?: number }>>(() => {
    try {
      const saved = localStorage.getItem('college_hub_subject_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateSubject = (
    oldCode: string,
    updated: { subjectCode: string; subjectName: string; facultyName: string; semester: number; totalUnits?: number; totalPlannedHours?: number }
  ) => {
    // 1. Update timetable slots
    const updatedSlots: TimetableSlot[] = [];
    setTimetable(prev => {
      return prev.map(slot => {
        if (slot.branchId === selectedBranchId && slot.subjectCode === oldCode) {
          const mod = {
            ...slot,
            subjectCode: updated.subjectCode,
            subjectName: updated.subjectName,
            facultyName: updated.facultyName,
            semester: updated.semester
          };
          updatedSlots.push(mod);
          return mod;
        }
        return slot;
      });
    });
    // Persist updated slots to Cloud Firestore
    updatedSlots.forEach(slot => {
      firestoreService.saveTimetableSlot(slot);
    });

    // 2. Update topic logs
    const updatedLogs: DailyTopicLog[] = [];
    setTopicLogs(prev => {
      return prev.map(log => {
        if (log.branchId === selectedBranchId && log.subjectCode === oldCode) {
          const mod = {
            ...log,
            subjectCode: updated.subjectCode,
            subjectName: updated.subjectName,
            facultyName: updated.facultyName,
            semester: updated.semester
          };
          updatedLogs.push(mod);
          return mod;
        }
        return log;
      });
    });
    // Persist updated logs to Cloud Firestore
    updatedLogs.forEach(log => {
      firestoreService.saveTopicLog(log);
    });

    // 3. Save overrides for custom units / planned hours
    setSubjectOverrides(prev => {
      const next = {
        ...prev,
        [updated.subjectCode]: {
          totalUnits: updated.totalUnits ?? prev[oldCode]?.totalUnits ?? 5,
          totalPlannedHours: updated.totalPlannedHours ?? prev[oldCode]?.totalPlannedHours ?? 45,
        }
      };
      if (oldCode !== updated.subjectCode && prev[oldCode]) {
        delete next[oldCode];
      }
      try {
        localStorage.setItem('college_hub_subject_overrides', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save subject overrides:', err);
      }
      return next;
    });

    addToast(`Subject "${updated.subjectCode}" updated`, 'success');
  };

  const deleteSubject = (subjectCode: string) => {
    // Collect slots and logs to delete from Cloud Firestore
    const slotsToDelete = timetable.filter(s => s.branchId === selectedBranchId && s.subjectCode === subjectCode);
    const logsToDelete = topicLogs.filter(l => l.branchId === selectedBranchId && l.subjectCode === subjectCode);

    setTimetable(prev => prev.filter(s => !(s.branchId === selectedBranchId && s.subjectCode === subjectCode)));
    setTopicLogs(prev => prev.filter(l => !(l.branchId === selectedBranchId && l.subjectCode === subjectCode)));

    // Persist deletions to Cloud Firestore
    slotsToDelete.forEach(s => firestoreService.deleteTimetableSlot(s.id));
    logsToDelete.forEach(l => firestoreService.deleteTopicLog(l.id));

    setSubjectOverrides(prev => {
      const next = { ...prev };
      delete next[subjectCode];
      try {
        localStorage.setItem('college_hub_subject_overrides', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to update subject overrides:', err);
      }
      return next;
    });
    addToast(`Subject "${subjectCode}" removed`, 'info');
  };

  // Subject Progress Calculation
  const subjectsProgress = useMemo<SubjectProgress[]>(() => {
    const subjectsMap = new Map<string, SubjectProgress>();

    // Unique subjects from timetable
    timetable
      .filter(t => t.branchId === selectedBranchId)
      .forEach(slot => {
        if (!subjectsMap.has(slot.subjectCode)) {
          const override = subjectOverrides[slot.subjectCode];
          subjectsMap.set(slot.subjectCode, {
            subjectCode: slot.subjectCode,
            subjectName: slot.subjectName,
            facultyName: slot.facultyName,
            branchId: slot.branchId,
            semester: slot.semester,
            totalUnits: override?.totalUnits ?? 5,
            totalPlannedHours: override?.totalPlannedHours ?? 45,
            completedHours: 0,
            completedUnits: 0,
            progressPercentage: 0
          });
        }
      });

    // Unique subjects from topic logs (if any not in timetable)
    topicLogs
      .filter(l => l.branchId === selectedBranchId)
      .forEach(log => {
        if (!subjectsMap.has(log.subjectCode)) {
          const override = subjectOverrides[log.subjectCode];
          subjectsMap.set(log.subjectCode, {
            subjectCode: log.subjectCode,
            subjectName: log.subjectName,
            facultyName: log.facultyName,
            branchId: log.branchId,
            semester: log.semester,
            totalUnits: override?.totalUnits ?? 5,
            totalPlannedHours: override?.totalPlannedHours ?? 45,
            completedHours: 0,
            completedUnits: 0,
            progressPercentage: 0
          });
        }

        const sub = subjectsMap.get(log.subjectCode);
        if (sub) {
          if (log.status === 'Completed') {
            sub.completedHours += log.hoursSpent || 1;
            if (log.unitNumber > sub.completedUnits) {
              sub.completedUnits = Math.min(sub.totalUnits, log.unitNumber);
            }
          }
        }
      });

    // Calculate percentage with division-by-zero guards
    return Array.from(subjectsMap.values()).map(sub => {
      const hoursPct = sub.totalPlannedHours > 0
        ? Math.min(100, Math.round((sub.completedHours / sub.totalPlannedHours) * 100))
        : 0;
      const unitsPct = sub.totalUnits > 0
        ? Math.min(100, Math.round((sub.completedUnits / sub.totalUnits) * 100))
        : 0;
      return {
        ...sub,
        progressPercentage: Math.max(hoursPct, unitsPct)
      };
    });
  }, [timetable, topicLogs, selectedBranchId, subjectOverrides]);

  // Events Creator Authorization Helper
  const isEventCreator = (event: DepartmentEvent): boolean => {
    if (!currentUser) return false;
    if (event.createdBy) {
      return event.createdBy === currentUser.id;
    }
    // Fallback for legacy events without explicit createdBy
    if (event.facultyCoordinator && currentUser.name) {
      return event.facultyCoordinator.trim().toLowerCase() === currentUser.name.trim().toLowerCase();
    }
    return false;
  };

  // Events CRUD (Creator-based authorization strictly enforced)
  const addEvent = (eventData: Omit<DepartmentEvent, 'id' | 'registeredCount'>) => {
    const id = 'event-' + Math.random().toString(36).substr(2, 9);
    const autoStatus = calculateEventStatus(eventData);
    const newEvent: DepartmentEvent = {
      ...eventData,
      id,
      status: autoStatus,
      registeredCount: 0,
      createdBy: eventData.createdBy || currentUser?.id,
      creatorName: eventData.creatorName || currentUser?.name
    };
    setEvents(prev => [newEvent, ...prev]);
    firestoreService.saveEvent(newEvent, currentUser?.id);
    addToast(`New event "${newEvent.title}" published!`, 'success');
  };

  const updateEvent = (id: string, updated: Partial<DepartmentEvent>): boolean => {
    const existing = events.find(e => e.id === id);
    if (!existing) return false;

    // Strict creator verification
    if (!isEventCreator(existing)) {
      addToast(`Access Denied: Only the creator of "${existing.title}" can edit it.`, 'error');
      console.warn(`[Auth Check] User "${currentUser?.name}" (${currentUser?.id}) attempted to edit event "${existing.title}" created by ${existing.createdBy || existing.facultyCoordinator}`);
      return false;
    }

    let toSave: DepartmentEvent | null = null;
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const merged: DepartmentEvent = {
        ...e,
        ...updated,
        createdBy: e.createdBy || currentUser?.id,
        creatorName: e.creatorName || currentUser?.name
      };
      const autoStatus = calculateEventStatus(merged);
      toSave = { ...merged, status: autoStatus };
      return toSave;
    }));
    if (toSave) {
      firestoreService.saveEvent(toSave, currentUser?.id);
    }
    addToast('Event updated successfully', 'success');
    return true;
  };

  const deleteEvent = (id: string): boolean => {
    const existing = events.find(e => e.id === id);
    if (!existing) return false;

    // Strict creator verification
    if (!isEventCreator(existing)) {
      addToast(`Access Denied: Only the creator of "${existing.title}" can delete it.`, 'error');
      console.warn(`[Auth Check] User "${currentUser?.name}" (${currentUser?.id}) attempted to delete event "${existing.title}" created by ${existing.createdBy || existing.facultyCoordinator}`);
      return false;
    }

    setEvents(prev => prev.filter(e => e.id !== id));
    firestoreService.deleteEvent(id, currentUser?.id, existing.createdBy);
    addToast('Event deleted', 'info');
    return true;
  };

  const registerEventRSVP = (eventId: string): boolean => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return false;
    if (ev.registeredCount >= ev.maxSeats) {
      addToast('Event is currently at maximum capacity!', 'warning');
      return false;
    }
    const updated = { ...ev, registeredCount: ev.registeredCount + 1 };
    setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
    firestoreService.saveEvent(updated);
    addToast(`RSVP registered for "${ev.title}"!`, 'success');
    return true;
  };

  // Rooms & Bookings
  const addRoomBooking = (bookingData: Omit<RoomBooking, 'id' | 'status' | 'timestamp'>): boolean => {
    // Conflict Check: Prevent overlap with existing approved bookings
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = toMin(bookingData.startTime);
    const newEnd = toMin(bookingData.endTime);

    const conflictingBooking = bookings.find(b => {
      if (b.status !== 'Approved') return false;
      if (b.date !== bookingData.date) return false;
      if (b.roomId !== bookingData.roomId && b.roomNumber !== bookingData.roomNumber) return false;
      const exStart = toMin(b.startTime);
      const exEnd = toMin(b.endTime);
      return newStart < exEnd && newEnd > exStart;
    });

    if (conflictingBooking) {
      addToast(
        `Booking Conflict: Room ${conflictingBooking.roomNumber} is already reserved by ${conflictingBooking.bookedBy} (${conflictingBooking.startTime} - ${conflictingBooking.endTime}) for "${conflictingBooking.purpose}".`,
        'error'
      );
      return false;
    }

    const id = 'book-' + Math.random().toString(36).substr(2, 9);
    const newBooking: RoomBooking = {
      ...bookingData,
      id,
      status: 'Approved',
      timestamp: new Date().toISOString()
    };

    const now = new Date();
    const isActiveNow = isBookingActiveNow(newBooking, now);
    const formattedSlot = `${formatTime12h(newBooking.startTime)} - ${formatTime12h(newBooking.endTime)}`;

    setBookings(prev => [newBooking, ...prev]);
    firestoreService.saveBooking(newBooking);

    if (isActiveNow) {
      updateRoomStatus(bookingData.roomId, 'Occupied', bookingData.bookedBy, bookingData.purpose, formattedSlot);
      addToast(`Room ${bookingData.roomNumber} reserved and is currently In-Use (${formattedSlot})!`, 'success');
    } else {
      addToast(`Room ${bookingData.roomNumber} reserved for ${bookingData.date} (${formattedSlot})`, 'success');
    }
    return true;
  };

  const updateRoomStatus = (
    roomId: string,
    status: Room['currentStatus'],
    occupant?: string,
    subject?: string,
    slotTime?: string
  ) => {
    if (status === 'Available') {
      // If releasing room early, adjust/complete any currently overlapping booking so it doesn't immediately re-occupy
      const now = new Date();
      setBookings(prev => prev.map(b => {
        if (b.roomId === roomId && isBookingActiveNow(b, now)) {
          const nowHours = String(now.getHours()).padStart(2, '0');
          const nowMins = String(now.getMinutes()).padStart(2, '0');
          return { ...b, endTime: `${nowHours}:${nowMins}` };
        }
        return b;
      }));
    }

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          currentStatus: status,
          currentOccupant: status === 'Occupied' ? occupant : undefined,
          currentSubject: status === 'Occupied' ? subject : undefined,
          currentSlotTime: status === 'Occupied' ? slotTime : undefined
        };
      }
      return r;
    }));
  };

  const deleteRoomBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    setBookings(prev => prev.filter(b => b.id !== id));
    firestoreService.deleteBooking(id);
    if (booking) {
      addToast(`Reservation for ${booking.roomNumber} (${booking.purpose}) deleted`, 'info');
    }
  };

  const clearAllBookings = () => {
    firestoreService.clearAllBookings(bookings);
    setBookings([]);
    addToast('All room reservation records have been cleared', 'info');
  };

  // Notifications
  const addNotification = (notifData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const id = 'notif-' + Math.random().toString(36).substr(2, 9);
    const newNotif: Notification = {
      ...notifData,
      id,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    firestoreService.saveNotification(newNotif);
    addToast(`Broadcast Announcement posted: ${newNotif.title}`, 'info');
  };

  const markNotificationAsRead = (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (target) {
      firestoreService.saveNotification({ ...target, isRead: true });
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) {
        firestoreService.saveNotification({ ...n, isRead: true });
      }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('All notifications marked as read', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    firestoreService.deleteNotification(id);
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !isDemoNotification(n) && !n.isRead).length;
  }, [notifications]);

  const urgentNotifications = useMemo(() => {
    return notifications.filter(n => !isDemoNotification(n) && (n.priority === 'Urgent' || n.isUrgentBanner));
  }, [notifications]);

  // Reset & Restore
  const resetData = () => {
    storageService.resetToDefaultData();
    setBranches(storageService.getBranches());
    setSelectedBranchIdState('branch-cse');
    setRooms(storageService.getRooms());
    setTimetable(storageService.getTimetable().filter(s => !isDemoSlot(s)));
    setTopicLogs(storageService.getTopicLogs());
    setEvents(storageService.getEvents().filter(e => !isDemoEvent(e)));
    setBookings(storageService.getBookings());
    setNotifications(storageService.getNotifications().filter(n => !isDemoNotification(n)));
    addToast('Reset to default demo data successfully!', 'info');
  };

  const restoreData = (json: string): boolean => {
    const ok = storageService.restoreFullBackupJSON(json);
    if (ok) {
      setBranches(storageService.getBranches());
      setRooms(storageService.getRooms());
      setTimetable(storageService.getTimetable().filter(s => !isDemoSlot(s)));
      setTopicLogs(storageService.getTopicLogs());
      setEvents(storageService.getEvents().filter(e => !isDemoEvent(e)));
      setBookings(storageService.getBookings());
      setNotifications(storageService.getNotifications().filter(n => !isDemoNotification(n)));
      addToast('Department data restored successfully from backup JSON', 'success');
      return true;
    } else {
      addToast('Failed to restore data: invalid JSON structure', 'error');
      return false;
    }
  };

  return (
    <DepartmentContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        branches,
        selectedBranchId,
        selectedBranch,
        setSelectedBranchId,
        addBranch,
        updateBranch,
        timetable,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        checkSlotConflict,
        topicLogs,
        addTopicLog,
        updateTopicLog,
        deleteTopicLog,
        subjectsProgress,
        updateSubject,
        deleteSubject,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        isEventCreator,
        registerEventRSVP,
        rooms,
        bookings,
        addRoomBooking,
        deleteRoomBooking,
        clearAllBookings,
        updateRoomStatus,
        notifications,
        unreadNotificationCount,
        urgentNotifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        toasts,
        addToast,
        removeToast,
        resetData,
        restoreData
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = (): DepartmentContextType => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};
