import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Branch,
  User,
  Room,
  TimetableSlot,
  DailyTopicLog,
  DepartmentEvent,
  RoomBooking,
  Notification,
  AccountStatus
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_ROOMS,
  INITIAL_TIMETABLE,
  INITIAL_TOPIC_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS
} from './mockData';
import { 
  isDemoEvent, 
  isDemoNotification, 
  isDemoSlot, 
  isDemoTopicLog,
  DEMO_SLOT_IDS, 
  DEMO_NOTIFICATION_IDS,
  DEMO_TOPIC_LOG_IDS 
} from '../utils/eventStatus';

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
      // Purge any lingering demo events and topic logs in Firestore first
      await firestoreService.purgeDemoEvents();
      await firestoreService.purgeDemoTopicLogs();

      const branchesSnap = await getDocs(collection(db, 'branches'));
      const existingBranchIds = new Set(branchesSnap.docs.map(d => d.id));
      for (const b of INITIAL_BRANCHES) {
        if (!existingBranchIds.has(b.id)) {
          await setDoc(doc(db, 'branches', b.id), sanitizeForFirestore(b));
        }
      }

      // Seed & synchronize canonical user accounts in Firestore database
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const existingUserIds = new Set(usersSnap.docs.map(d => d.id));
        for (const u of INITIAL_USERS) {
          if (!existingUserIds.has(u.id)) {
            await setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u), { merge: true });
          }
        }
      } catch (userErr) {
        console.warn('[Firestore] Users check/seed notice:', userErr);
      }

      if (branchesSnap.empty) {
        console.log('[Firestore] Seeding initial infrastructure data to Firestore...');

        // Seed Rooms
        for (const r of INITIAL_ROOMS) {
          await setDoc(doc(db, 'rooms', r.id), sanitizeForFirestore(r));
        }

        // Seed Topic Logs
        for (const log of INITIAL_TOPIC_LOGS) {
          await setDoc(doc(db, 'topic_logs', log.id), sanitizeForFirestore(log));
        }

        // Seed Bookings
        for (const booking of INITIAL_BOOKINGS) {
          await setDoc(doc(db, 'bookings', booking.id), sanitizeForFirestore(booking));
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
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as TimetableSlot))
          .filter(s => !isDemoSlot(s));
        onData(list);
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
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as DailyTopicLog))
          .filter(l => !isDemoTopicLog(l));
        onData(list);
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
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Room));
        onData(list);
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
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as Notification))
          .filter(n => !isDemoNotification(n));
        onData(list);
      },
      err => {
        console.warn('[Firestore] Notifications sync warning:', err.message);
      }
    );
  },

  subscribeUsers: (onData: (users: User[]) => void) => {
    return onSnapshot(
      collection(db, 'users'),
      snapshot => {
        const userMap = new Map<string, User>();
        snapshot.docs.forEach(d => {
          const u = { id: d.id, ...d.data() } as User;
          const key = (u.email || u.uid || d.id).toLowerCase();
          if (!userMap.has(key)) {
            userMap.set(key, u);
          } else {
            userMap.set(key, { ...userMap.get(key)!, ...u });
          }
        });
        onData(Array.from(userMap.values()));
      },
      err => {
        console.warn('[Firestore] Users sync warning:', err.message);
      }
    );
  },

  subscribeFaculty: (onData: (faculty: User[]) => void) => {
    return onSnapshot(
      collection(db, 'users'),
      snapshot => {
        const facultyMap = new Map<string, User>();
        snapshot.docs.forEach(d => {
          const u = { id: d.id, ...d.data() } as User;
          if (u.role === 'faculty') {
            const key = (u.email || u.uid || d.id).toLowerCase();
            if (!facultyMap.has(key)) {
              facultyMap.set(key, u);
            } else {
              facultyMap.set(key, { ...facultyMap.get(key)!, ...u });
            }
          }
        });
        onData(Array.from(facultyMap.values()));
      },
      err => {
        console.warn('[Firestore] Faculty sync warning:', err.message);
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
  },

  purgeDemoTimetable: async (): Promise<void> => {
    try {
      for (const id of DEMO_SLOT_IDS) {
        await deleteDoc(doc(db, 'timetable', id)).catch(() => {});
      }
      const snapshot = await getDocs(collection(db, 'timetable')).catch(() => null);
      if (snapshot && !snapshot.empty) {
        for (const d of snapshot.docs) {
          if (isDemoSlot({ id: d.id })) {
            await deleteDoc(d.ref).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('[Firestore] Failed to purge demo timetable from cloud:', err);
    }
  },

  purgeDemoNotifications: async (): Promise<void> => {
    try {
      for (const id of DEMO_NOTIFICATION_IDS) {
        await deleteDoc(doc(db, 'notifications', id)).catch(() => {});
      }
      const snapshot = await getDocs(collection(db, 'notifications')).catch(() => null);
      if (snapshot && !snapshot.empty) {
        for (const d of snapshot.docs) {
          const data = d.data() as Partial<Notification>;
          if (isDemoNotification({ id: d.id, title: data?.title })) {
            await deleteDoc(d.ref).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('[Firestore] Failed to purge demo notifications from cloud:', err);
    }
  },

  purgeDemoTopicLogs: async (): Promise<void> => {
    try {
      for (const id of DEMO_TOPIC_LOG_IDS) {
        await deleteDoc(doc(db, 'topic_logs', id)).catch(() => {});
      }
      const snapshot = await getDocs(collection(db, 'topic_logs')).catch(() => null);
      if (snapshot && !snapshot.empty) {
        for (const d of snapshot.docs) {
          const data = d.data() as Partial<DailyTopicLog>;
          if (isDemoTopicLog({ id: d.id, topicTitle: data?.topicTitle })) {
            await deleteDoc(d.ref).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('[Firestore] Failed to purge demo topic logs from cloud:', err);
    }
  },

  // ==========================================
  // USER & DEPARTMENT MAPPING FROM DATABASE
  // ==========================================
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (err) {
      console.warn('[Firestore] getUserById warning:', err);
      return null;
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const normalized = email.trim().toLowerCase();
      const q = query(collection(db, 'users'), where('email', '==', normalized));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as User;
      }
      return null;
    } catch (err) {
      console.warn('[Firestore] getUserByEmail warning:', err);
      return null;
    }
  },

  saveUser: async (user: User): Promise<void> => {
    try {
      const payload = sanitizeForFirestore(user);
      await setDoc(doc(db, 'users', user.id), payload, { merge: true });
      if (user.uid && user.uid !== user.id) {
        await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
      }
    } catch (err) {
      console.warn('[Firestore] saveUser warning:', err);
    }
  },

  updateUserStatus: async (
    userIdOrEmail: string,
    status: AccountStatus,
    approvedBy: string
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const payload: Partial<User> = {
        status,
        approvedAt: now,
        approvedBy
      };

      let updated = false;

      // 1. Direct document ID update
      const directRef = doc(db, 'users', userIdOrEmail);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        await setDoc(directRef, payload, { merge: true });
        updated = true;
        const data = directSnap.data() as User;
        if (data.uid && data.uid !== userIdOrEmail) {
          await setDoc(doc(db, 'users', data.uid), payload, { merge: true });
        }
        if (data.id && data.id !== userIdOrEmail) {
          await setDoc(doc(db, 'users', data.id), payload, { merge: true });
        }
      }

      // 2. Query and update all docs matching email
      const normalized = userIdOrEmail.trim().toLowerCase();
      if (normalized.includes('@')) {
        const qEmail = query(collection(db, 'users'), where('email', '==', normalized));
        const emailSnap = await getDocs(qEmail);
        for (const d of emailSnap.docs) {
          await setDoc(d.ref, payload, { merge: true });
          updated = true;
        }
      }

      // 3. Query and update any doc where uid equals userIdOrEmail
      const qUid = query(collection(db, 'users'), where('uid', '==', userIdOrEmail));
      const uidSnap = await getDocs(qUid);
      for (const d of uidSnap.docs) {
        await setDoc(d.ref, payload, { merge: true });
        updated = true;
      }

      return updated;
    } catch (err) {
      console.error('[Firestore] updateUserStatus error:', err);
      return false;
    }
  },

  getBranchById: async (branchId: string): Promise<Branch | null> => {
    try {
      const bDoc = await getDoc(doc(db, 'branches', branchId));
      if (bDoc.exists()) {
        return { id: bDoc.id, ...bDoc.data() } as Branch;
      }
      return null;
    } catch (err) {
      console.warn('[Firestore] getBranchById warning:', err);
      return null;
    }
  },

  getDepartmentForUser: async (userId: string): Promise<{ branchId: string; branch: Branch } | null> => {
    try {
      let user: User | null = null;
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        user = { id: userDoc.id, ...userDoc.data() } as User;
      } else {
        user = INITIAL_USERS.find(u => u.id === userId) || null;
      }
      if (!user || !user.branchId) return null;

      if (user.branchId === 'ALL') {
        return { branchId: 'ALL', branch: INITIAL_BRANCHES[0] };
      }

      const branchDoc = await getDoc(doc(db, 'branches', user.branchId));
      if (branchDoc.exists()) {
        const branch = { id: branchDoc.id, ...branchDoc.data() } as Branch;
        return { branchId: user.branchId, branch };
      }

      const canonicalBranch = INITIAL_BRANCHES.find(b => b.id === user.branchId) || INITIAL_BRANCHES[0];
      return { branchId: user.branchId, branch: canonicalBranch };
    } catch (err) {
      console.warn('[Firestore] getDepartmentForUser warning:', err);
      return null;
    }
  }
};
