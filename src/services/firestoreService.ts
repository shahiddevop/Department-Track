import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Branch,
  Room,
  TimetableSlot,
  DailyTopicLog,
  DepartmentEvent,
  RoomBooking,
  Notification
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_ROOMS,
  INITIAL_TIMETABLE,
  INITIAL_TOPIC_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS
} from './mockData';
import { isDemoEvent } from '../utils/eventStatus';

// Helper to remove any undefined fields before writing to Firestore
function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

export const firestoreService = {
  // ==========================================
  // PURGE DEMO EVENTS FROM CLOUD FIRESTORE
  // ==========================================
  purgeDemoEvents: async (): Promise<void> => {
    try {
      const eventsSnap = await getDocs(collection(db, 'events'));
      const batch = writeBatch(db);
      let count = 0;
      for (const d of eventsSnap.docs) {
        const data = d.data();
        if (isDemoEvent({ id: d.id, title: data.title })) {
          batch.delete(doc(db, 'events', d.id));
          count++;
        }
      }
      if (count > 0) {
        await batch.commit();
        console.log(`[Firestore] Purged ${count} demo events from cloud.`);
      }
    } catch (err) {
      console.warn('[Firestore] Could not purge demo events from cloud:', err);
    }
  },

  // ==========================================
  // SEED INITIAL DATA (if Firestore is empty)
  // ==========================================
  seedInitialDataIfEmpty: async (): Promise<boolean> => {
    try {
      // Purge any lingering demo events in Firestore first
      await firestoreService.purgeDemoEvents();

      const branchesSnap = await getDocs(collection(db, 'branches'));
      const existingBranchIds = new Set(branchesSnap.docs.map(d => d.id));
      for (const b of INITIAL_BRANCHES) {
        if (!existingBranchIds.has(b.id)) {
          await setDoc(doc(db, 'branches', b.id), sanitizeForFirestore(b));
        }
      }

      if (branchesSnap.empty) {
        console.log('[Firestore] Seeding initial infrastructure data to Firestore...');

        // Seed Rooms
        for (const r of INITIAL_ROOMS) {
          await setDoc(doc(db, 'rooms', r.id), sanitizeForFirestore(r));
        }

        // Seed Timetable
        for (const slot of INITIAL_TIMETABLE) {
          await setDoc(doc(db, 'timetable', slot.id), sanitizeForFirestore(slot));
        }

        // Seed Topic Logs
        for (const log of INITIAL_TOPIC_LOGS) {
          await setDoc(doc(db, 'topic_logs', log.id), sanitizeForFirestore(log));
        }

        // Seed Bookings
        for (const booking of INITIAL_BOOKINGS) {
          await setDoc(doc(db, 'bookings', booking.id), sanitizeForFirestore(booking));
        }

        // Seed Notifications
        for (const notif of INITIAL_NOTIFICATIONS) {
          await setDoc(doc(db, 'notifications', notif.id), sanitizeForFirestore(notif));
        }

        console.log('[Firestore] Initial infrastructure seeding complete!');
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Firestore] Note: Could not seed data (check Firestore Security Rules in Firebase Console):', err);
      return false;
    }
  },

  // ==========================================
  // REAL-TIME SUBSCRIBERS
  // ==========================================
  subscribeEvents: (onData: (events: DepartmentEvent[]) => void) => {
    return onSnapshot(
      collection(db, 'events'),
      snapshot => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as DepartmentEvent))
          .filter(e => !isDemoEvent(e));
        onData(list);
      },
      err => {
        console.warn('[Firestore] Events sync warning (falling back to local cache):', err.message);
      }
    );
  },

  subscribeTimetable: (onData: (slots: TimetableSlot[]) => void) => {
    return onSnapshot(
      collection(db, 'timetable'),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TimetableSlot));
          onData(list);
        }
      },
      err => {
        console.warn('[Firestore] Timetable sync warning:', err.message);
      }
    );
  },

  subscribeTopicLogs: (onData: (logs: DailyTopicLog[]) => void) => {
    return onSnapshot(
      collection(db, 'topic_logs'),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DailyTopicLog));
          onData(list);
        }
      },
      err => {
        console.warn('[Firestore] Topic logs sync warning:', err.message);
      }
    );
  },

  subscribeBranches: (onData: (branches: Branch[]) => void) => {
    return onSnapshot(
      collection(db, 'branches'),
      snapshot => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Branch));
        const branchMap = new Map<string, Branch>();
        INITIAL_BRANCHES.forEach(b => branchMap.set(b.id, { ...b }));
        list.forEach(b => {
          const canonical = branchMap.get(b.id);
          if (canonical) {
            branchMap.set(b.id, { ...canonical, ...b });
          } else {
            branchMap.set(b.id, b);
          }
        });
        onData(Array.from(branchMap.values()));
      },
      err => {
        console.warn('[Firestore] Branches sync warning:', err.message);
      }
    );
  },

  subscribeRooms: (onData: (rooms: Room[]) => void) => {
    return onSnapshot(
      collection(db, 'rooms'),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Room));
          onData(list);
        }
      },
      err => {
        console.warn('[Firestore] Rooms sync warning:', err.message);
      }
    );
  },

  subscribeBookings: (onData: (bookings: RoomBooking[]) => void) => {
    return onSnapshot(
      collection(db, 'bookings'),
      snapshot => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RoomBooking));
        onData(list);
      },
      err => {
        console.warn('[Firestore] Bookings sync warning:', err.message);
      }
    );
  },

  subscribeNotifications: (onData: (notifications: Notification[]) => void) => {
    return onSnapshot(
      collection(db, 'notifications'),
      snapshot => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
          onData(list);
        }
      },
      err => {
        console.warn('[Firestore] Notifications sync warning:', err.message);
      }
    );
  },

  // ==========================================
  // MUTATION HELPERS (CRUD TO FIRESTORE)
  // ==========================================

  // Events (with creator authorization enforcement)
  saveEvent: async (event: DepartmentEvent, requestingUserId?: string): Promise<boolean> => {
    try {
      if (requestingUserId && event.createdBy && event.createdBy !== requestingUserId) {
        console.warn(`[Firestore Authorization] Denied: User ${requestingUserId} is not the creator of event ${event.id}`);
        return false;
      }
      await setDoc(doc(db, 'events', event.id), sanitizeForFirestore(event));
      return true;
    } catch (err) {
      console.warn('[Firestore] Failed to save event to cloud:', err);
      return false;
    }
  },

  deleteEvent: async (id: string, requestingUserId?: string, eventCreatorId?: string): Promise<boolean> => {
    try {
      if (requestingUserId && eventCreatorId && eventCreatorId !== requestingUserId) {
        console.warn(`[Firestore Authorization] Denied: User ${requestingUserId} cannot delete event created by ${eventCreatorId}`);
        return false;
      }
      await deleteDoc(doc(db, 'events', id));
      return true;
    } catch (err) {
      console.warn('[Firestore] Failed to delete event from cloud:', err);
      return false;
    }
  },

  // Timetable
  saveTimetableSlot: async (slot: TimetableSlot): Promise<void> => {
    try {
      await setDoc(doc(db, 'timetable', slot.id), sanitizeForFirestore(slot));
    } catch (err) {
      console.warn('[Firestore] Failed to save timetable slot to cloud:', err);
    }
  },

  deleteTimetableSlot: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'timetable', id));
    } catch (err) {
      console.warn('[Firestore] Failed to delete timetable slot from cloud:', err);
    }
  },

  // Topic Logs
  saveTopicLog: async (log: DailyTopicLog): Promise<void> => {
    try {
      await setDoc(doc(db, 'topic_logs', log.id), sanitizeForFirestore(log));
    } catch (err) {
      console.warn('[Firestore] Failed to save topic log to cloud:', err);
    }
  },

  deleteTopicLog: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'topic_logs', id));
    } catch (err) {
      console.warn('[Firestore] Failed to delete topic log from cloud:', err);
    }
  },

  // Branches
  saveBranch: async (branch: Branch): Promise<void> => {
    try {
      await setDoc(doc(db, 'branches', branch.id), sanitizeForFirestore(branch));
    } catch (err) {
      console.warn('[Firestore] Failed to save branch to cloud:', err);
    }
  },

  // Rooms & Bookings
  saveRoom: async (room: Room): Promise<void> => {
    try {
      await setDoc(doc(db, 'rooms', room.id), sanitizeForFirestore(room));
    } catch (err) {
      console.warn('[Firestore] Failed to save room to cloud:', err);
    }
  },

  saveBooking: async (booking: RoomBooking): Promise<void> => {
    try {
      await setDoc(doc(db, 'bookings', booking.id), sanitizeForFirestore(booking));
    } catch (err) {
      console.warn('[Firestore] Failed to save booking to cloud:', err);
    }
  },

  deleteBooking: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      console.warn('[Firestore] Failed to delete booking from cloud:', err);
    }
  },

  clearAllBookings: async (bookings: RoomBooking[]): Promise<void> => {
    try {
      const batch = writeBatch(db);
      bookings.forEach(b => {
        batch.delete(doc(db, 'bookings', b.id));
      });
      await batch.commit();
    } catch (err) {
      console.warn('[Firestore] Failed to clear bookings from cloud:', err);
    }
  },

  // Notifications
  saveNotification: async (notif: Notification): Promise<void> => {
    try {
      await setDoc(doc(db, 'notifications', notif.id), sanitizeForFirestore(notif));
    } catch (err) {
      console.warn('[Firestore] Failed to save notification to cloud:', err);
    }
  },

  deleteNotification: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.warn('[Firestore] Failed to delete notification from cloud:', err);
    }
  }
};
