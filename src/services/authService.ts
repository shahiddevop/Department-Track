/**
 * Authentication Service
 * Manages user credentials, login/logout, registration, and password updates.
 * Uses localStorage for credential persistence (testing/demo mode).
 */

import { User, UserRole, AccountStatus } from '../types';
import { INITIAL_USERS, INITIAL_BRANCHES } from './mockData';
import { firestoreService } from './firestoreService';
import { storageService } from './storageService';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

// ─── Storage Keys ───────────────────────────────────────────────
const AUTH_KEYS = {
  CREDENTIALS: 'adt_user_credentials_v1',
  SESSION: 'adt_active_session_v1',
  REGISTERED_FACULTY: 'adt_registered_faculty_v1',
};

// ─── Verified Provisioned Identities in Firebase Authentication ──
export const PROVISIONED_FIREBASE_IDENTITIES: Record<string, { uid: string; name: string; email: string; department: string; role: 'admin' }> = {
  'p.shahnaz@sjdc.edu': {
    uid: 'h0wmMvBzlReg9aAUNj2Q6yB1tkI2',
    name: 'Dr. P.Shahnaz',
    email: 'p.shahnaz@sjdc.edu',
    department: 'English',
    role: 'admin'
  },
  's.latharani@sjdc.edu': {
    uid: 'dukSYEWWynNidaUyZTtjngApTyT2',
    name: 'S. Latha Rani',
    email: 's.latharani@sjdc.edu',
    department: 'Department of Computer Science',
    role: 'admin'
  },
  'ksr.chandrasekhar@sjdc.edu': {
    uid: '5hX1jYReqxPCZaGhQ6ei4rkR2uW2',
    name: 'Dr. K.S.R Chandra Sekhar',
    email: 'ksr.chandrasekhar@sjdc.edu',
    department: 'Physics & Electronics',
    role: 'admin'
  },
  'hn.prasanna@sjdc.edu': {
    uid: 'FwpYXuYdDhRBwIzIzTDIwGtCNo92',
    name: 'H.N Prasanna',
    email: 'hn.prasanna@sjdc.edu',
    department: 'Microbiology & Biotechnology',
    role: 'admin'
  },
  't.mohanreddy@sjdc.edu': {
    uid: 'eVYY69YWcHVkrxT3Ez3Vz4wU7dy1',
    name: 'Dr. T. Mohan Reddy',
    email: 't.mohanreddy@sjdc.edu',
    department: 'Department of Mathematics',
    role: 'admin'
  },
  'i.kalyani@sjdc.edu': {
    uid: 'HClnHr7HqIRh4WaqbhsSwk67j5j1',
    name: 'I. Kalyani',
    email: 'i.kalyani@sjdc.edu',
    department: 'Department of Statistics',
    role: 'admin'
  },
  'cs.sreenivasrao@sjdc.edu': {
    uid: '0E2md4mSUdb5kvH1i9wkl16Qeqa2',
    name: 'Dr. C.S. Sreenivas Rao',
    email: 'cs.sreenivasrao@sjdc.edu',
    department: 'Department of Zoology',
    role: 'admin'
  },
  'ny.swamy@sjdc.edu': {
    uid: 'QDYirbHRq1Z3vsDraDF6JrBtqgu2',
    name: 'N.Y. Swamy',
    email: 'ny.swamy@sjdc.edu',
    department: 'Department of Telugu',
    role: 'admin'
  },
  'ts.mdmoin@sjdc.edu': {
    uid: 'F7Zk02TyIZQIVPQcgII4q8Ek8x03',
    name: 'TS MD Moin',
    email: 'ts.mdmoin@sjdc.edu',
    department: 'Department of Arabic',
    role: 'admin'
  },
  'sk.mastanvali@sjdc.edu': {
    uid: 'haTgQcj9oxZxVXhZYqTmTs4kC9L2',
    name: 'SK Mastan Vali',
    email: 'sk.mastanvali@sjdc.edu',
    department: 'Department of Hindi',
    role: 'admin'
  },
  'm.arjun@sjdc.edu': {
    uid: 'Lsvv4RIr24TrVWr1OL2K90Q6TNE3',
    name: 'M. Arjun',
    email: 'm.arjun@sjdc.edu',
    department: 'Department of Commerce',
    role: 'admin'
  },
  'k.vasavi@sjdc.edu': {
    uid: 'kEqYz99L1kWGJr23diqg5KzTHj83',
    name: 'K. Vasavi',
    email: 'k.vasavi@sjdc.edu',
    department: 'Department of Chemistry',
    role: 'admin'
  },
  'k.shantha.principal@sjdc.edu': {
    uid: 'hsJJqijUXdTKqXNri6KmqYv5J862',
    name: 'Dr. K. Shantha',
    email: 'k.shantha.principal@sjdc.edu',
    department: 'All Academic Departments',
    role: 'admin'
  },
  'cv.satyanarayana.vp@sjdc.edu': {
    uid: 'VfB1QYITqsPuqHvsLOdKCMHuPw02',
    name: 'Dr. C.V Satyanarayana',
    email: 'cv.satyanarayana.vp@sjdc.edu',
    department: 'All Academic Departments',
    role: 'admin'
  }
};

// ─── Types ──────────────────────────────────────────────────────
export interface UserCredential {
  userId: string;
  email: string;
  password: string;
  role: 'admin' | 'faculty';
  name: string;
  mustChangePassword: boolean;
  status?: AccountStatus;
  branchId?: string;
  uid?: string;
}

export interface FacultyRegistration {
  name: string;
  email: string;
  password: string;
  branchId: string;
  phone?: string;
  designation?: string;
  qualification?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  mustChangePassword?: boolean;
  error?: string;
  status?: AccountStatus;
}

// ─── Default HOD/Admin Password ─────────────────────────────────
const DEFAULT_HOD_PASSWORD = 'Admin@123';

// ─── Pre-configured HOD/Admin Accounts ──────────────────────────
const HOD_ADMIN_ACCOUNTS: UserCredential[] = INITIAL_USERS
  .filter(u => u.role === 'admin')
  .map(u => ({
    userId: u.id,
    email: u.email,
    password: DEFAULT_HOD_PASSWORD,
    role: 'admin' as const,
    name: u.name,
    mustChangePassword: false,
    status: 'APPROVED' as const,
    branchId: u.branchId,
    uid: PROVISIONED_FIREBASE_IDENTITIES[u.email.toLowerCase()]?.uid,
  }));

// ─── Service ────────────────────────────────────────────────────
export const authService = {

  /** Initialize default credentials if not present */
  initializeCredentials(): void {
    const existing = localStorage.getItem(AUTH_KEYS.CREDENTIALS);
    if (!existing) {
      localStorage.setItem(AUTH_KEYS.CREDENTIALS, JSON.stringify(HOD_ADMIN_ACCOUNTS));
    } else {
      try {
        const stored: UserCredential[] = JSON.parse(existing);
        let updated = false;

        stored.forEach(c => {
          if (c.email && c.email.includes('@gmail.com')) {
            c.email = c.email.replace('@gmail.com', '@sjdc.edu');
            updated = true;
          }
          if (c.mustChangePassword) {
            c.mustChangePassword = false;
            updated = true;
          }
          if (!c.status) {
            c.status = 'APPROVED';
            updated = true;
          }
          if (!c.uid && PROVISIONED_FIREBASE_IDENTITIES[c.email.toLowerCase()]) {
            c.uid = PROVISIONED_FIREBASE_IDENTITIES[c.email.toLowerCase()].uid;
            updated = true;
          }
        });

        const storedEmails = new Set(stored.map(c => c.email.toLowerCase()));
        HOD_ADMIN_ACCOUNTS.forEach(hod => {
          if (!storedEmails.has(hod.email.toLowerCase())) {
            stored.push(hod);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(AUTH_KEYS.CREDENTIALS, JSON.stringify(stored));
        }
      } catch {
        localStorage.setItem(AUTH_KEYS.CREDENTIALS, JSON.stringify(HOD_ADMIN_ACCOUNTS));
      }
    }
  },

  /** Get all stored credentials */
  getCredentials(): UserCredential[] {
    try {
      const data = localStorage.getItem(AUTH_KEYS.CREDENTIALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** Save credentials */
  saveCredentials(creds: UserCredential[]): void {
    localStorage.setItem(AUTH_KEYS.CREDENTIALS, JSON.stringify(creds));
  },

  /**
   * Fetch all accounts that have legitimate, provisioned identities in Firebase Authentication & Firestore.
   * Only verified accounts are displayed in the Quick Select list.
   */
  async getProvisionedAccounts(): Promise<User[]> {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: User[] = [];
      const seenEmails = new Set<string>();

      usersSnap.forEach(d => {
        const data = d.data() as User;
        const email = (data.email || '').toLowerCase().trim();
        const identity = PROVISIONED_FIREBASE_IDENTITIES[email];
        // Ensure only accounts with verified provisioned status and valid institutional identities are included
        if (email && identity && !seenEmails.has(email) && data.role === 'admin') {
          seenEmails.add(email);
          list.push({
            ...data,
            id: data.id || `user-${identity.uid}`,
            uid: data.uid || identity.uid,
            name: data.name || identity.name,
            email: email,
            branchName: data.branchName || identity.department,
            role: 'admin',
            isProvisioned: true,
            status: 'APPROVED'
          });
        }
      });

      if (list.length > 0) {
        // Return sorted by initial order in INITIAL_USERS
        const orderMap = new Map(INITIAL_USERS.map((u, i) => [u.email.toLowerCase(), i]));
        list.sort((a, b) => (orderMap.get(a.email.toLowerCase()) ?? 999) - (orderMap.get(b.email.toLowerCase()) ?? 999));
        return list;
      }
    } catch (err) {
      console.warn('[authService] Could not fetch provisioned accounts from Firestore, falling back to verified roster:', err);
    }

    // Fallback verified roster from INITIAL_USERS
    return INITIAL_USERS
      .filter(u => !!PROVISIONED_FIREBASE_IDENTITIES[u.email.toLowerCase()])
      .map(u => ({
        ...u,
        uid: PROVISIONED_FIREBASE_IDENTITIES[u.email.toLowerCase()].uid,
        isProvisioned: true,
        status: 'APPROVED' as const
      }));
  },

  /** Login with email and password using Firebase Authentication with Cloud Firestore profile resolution */
  async login(email: string, password: string, role: 'admin' | 'faculty'): Promise<LoginResult> {
    this.initializeCredentials();
    let normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.includes('@gmail.com')) {
      normalizedEmail = normalizedEmail.replace('@gmail.com', '@sjdc.edu');
    }

    let firebaseAuthSuccess = false;
    let firebaseUser: any = null;

    // 1. Attempt authentication with Firebase Authentication
    try {
      const userCred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      firebaseUser = userCred.user;
      firebaseAuthSuccess = true;
    } catch (authErr: any) {
      console.warn('[authService] Firebase Auth sign-in message:', authErr?.code);
      if (authErr?.code === 'auth/wrong-password' || authErr?.code === 'auth/invalid-credential') {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      if (authErr?.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many unsuccessful attempts. Access temporarily locked. Please try again later.' };
      }
      if (authErr?.code === 'auth/user-not-found') {
        return {
          success: false,
          error: role === 'admin'
            ? 'No provisioned HOD/Admin account found with this email in Firebase.'
            : 'No faculty account found with this email. Please register first.'
        };
      }
      // If offline or client connectivity issue, continue to fallback
    }

    // 2. Fetch the user profile from Cloud Firestore
    let user: User | null = null;
    if (firebaseUser?.uid) {
      try {
        user = await firestoreService.getUserById(firebaseUser.uid);
      } catch (err) {
        console.warn('[authService] Firestore fetch by UID warning:', err);
      }
    }

    // Search local credentials or mock data if not yet retrieved by UID
    const creds = this.getCredentials();
    const localCred = creds.find(
      c => (c.email.toLowerCase() === normalizedEmail || c.userId.toLowerCase() === normalizedEmail)
    );

    if (!user && localCred) {
      try {
        user = await firestoreService.getUserById(localCred.userId);
      } catch {}
    }

    // Fallback: check INITIAL_USERS or registered faculty
    if (!user) {
      if (role === 'admin') {
        user = INITIAL_USERS.find(u => u.email.toLowerCase() === normalizedEmail || u.id === localCred?.userId) || null;
      } else {
        const registeredFaculty = this.getRegisteredFaculty();
        user = registeredFaculty.find(f => f.email.toLowerCase() === normalizedEmail || f.id === localCred?.userId) || null;
      }
    }

    // 3. Fallback verification if offline / Firebase client unavailable
    if (!firebaseAuthSuccess) {
      if (!localCred) {
        return {
          success: false,
          error: role === 'admin'
            ? 'No HOD/Admin account found with this email/ID.'
            : 'No faculty account found. Please register first.'
        };
      }
      if (localCred.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    }

    if (!user) {
      return { success: false, error: 'User profile not found. Contact administrator.' };
    }

    // 4. Role validation
    if (role === 'admin' && user.role !== 'admin') {
      return { success: false, error: 'This account is registered as Faculty. Please switch to the Faculty tab.' };
    }
    if (role === 'faculty' && user.role !== 'faculty') {
      return { success: false, error: 'This account is registered as HOD/Admin. Please switch to the HOD/Admin tab.' };
    }

    // Attach verified Firebase UID & status
    if (firebaseUser?.uid) {
      user.uid = firebaseUser.uid;
      user.isProvisioned = true;
    } else if (PROVISIONED_FIREBASE_IDENTITIES[normalizedEmail]) {
      user.uid = PROVISIONED_FIREBASE_IDENTITIES[normalizedEmail].uid;
      user.isProvisioned = true;
    }

    // 5. Confirm department mapping from database
    if (user.branchId && user.branchId !== 'ALL') {
      try {
        const branch = await firestoreService.getBranchById(user.branchId);
        if (branch) {
          user.branchName = branch.name;
        }
      } catch {
        // fallback to existing branchName
      }
    }

    // 6. Status verification gate for faculty accounts
    if (role === 'faculty') {
      const currentStatus = user.status || localCred?.status;
      if (currentStatus === 'PENDING_VERIFICATION') {
        const deptName = user.branchName || 'your department';
        return {
          success: false,
          status: 'PENDING_VERIFICATION',
          error: `Your account is pending verification by the Department HOD (${deptName}). You cannot log in until your profile is approved.`
        };
      }
      if (currentStatus === 'REJECTED') {
        return {
          success: false,
          status: 'REJECTED',
          error: 'Your registration request was rejected by the Department HOD. Please contact department administration.'
        };
      }
    }

    // 7. Clear stale session and persist fresh state
    storageService.clearUserSession();
    storageService.setCurrentUser(user);
    if (user.branchId && user.branchId !== 'ALL') {
      storageService.setSelectedBranchId(user.branchId);
    }
    this.saveSession(user);

    return {
      success: true,
      user,
      status: (user.status || localCred?.status || 'APPROVED') as AccountStatus,
      mustChangePassword: false,
    };
  },

  /** Register a new faculty member with institutional email and status: "PENDING_VERIFICATION" */
  async registerFaculty(registration: FacultyRegistration): Promise<LoginResult> {
    this.initializeCredentials();
    const creds = this.getCredentials();
    const normalizedEmail = registration.email.trim().toLowerCase();

    // Institutional email validation: strictly @sjdc.edu
    if (!normalizedEmail.endsWith('@sjdc.edu')) {
      return {
        success: false,
        error: 'Only institutional email addresses ending with @sjdc.edu are permitted for faculty registration.'
      };
    }

    // Check if email already exists locally
    if (creds.find(c => c.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this institutional email already exists.' };
    }

    const branch = INITIAL_BRANCHES.find(b => b.id === registration.branchId);
    if (!branch) {
      return { success: false, error: 'Invalid department selected.' };
    }

    let facultyUid = `faculty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, normalizedEmail, registration.password);
      facultyUid = userCred.user.uid;
      await updateProfile(userCred.user, { displayName: registration.name.trim() });
    } catch (authErr: any) {
      console.warn('[authService] Firebase Auth create user note:', authErr?.code);
      if (authErr?.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this institutional email is already registered in Firebase.' };
      }
    }

    const newUser: User = {
      id: facultyUid,
      uid: facultyUid,
      name: registration.name.trim(),
      email: registration.email.trim(),
      role: 'faculty',
      designation: registration.designation || 'Assistant Professor',
      qualification: registration.qualification || '',
      branchId: registration.branchId,
      branchName: branch.name,
      avatar: '',
      phone: registration.phone || '',
      status: 'PENDING_VERIFICATION',
      registeredAt: new Date().toISOString(),
      isProvisioned: true
    };

    const newCred: UserCredential = {
      userId: facultyUid,
      uid: facultyUid,
      email: registration.email.trim(),
      password: registration.password,
      role: 'faculty',
      name: registration.name.trim(),
      mustChangePassword: false,
      status: 'PENDING_VERIFICATION',
      branchId: registration.branchId,
    };

    creds.push(newCred);
    this.saveCredentials(creds);

    const faculty = this.getRegisteredFaculty();
    faculty.push(newUser);
    this.saveRegisteredFaculty(faculty);

    // Save to Firestore database under UID and facultyId
    firestoreService.saveUser(newUser).catch(() => {});

    return {
      success: true,
      user: newUser,
      status: 'PENDING_VERIFICATION'
    };
  },

  /** Update user password */
  updatePassword(emailOrUserId: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    this.initializeCredentials();
    const creds = this.getCredentials();
    const normalized = emailOrUserId.trim().toLowerCase();
    const credIndex = creds.findIndex(
      c => c.email.toLowerCase() === normalized || c.userId.toLowerCase() === normalized
    );

    if (credIndex === -1) {
      return { success: false, error: 'Account not found.' };
    }

    if (creds[credIndex].password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    creds[credIndex].password = newPassword;
    creds[credIndex].mustChangePassword = false;
    this.saveCredentials(creds);

    return { success: true };
  },

  /**
   * Securely re-authenticates an attempt to switch to a specific target HOD account.
   * Enforces strict role-based access control by verifying that the entered identifier
   * (email or User ID) and password match the target HOD's configured credentials.
   */
  verifyHODCredentials(
    targetUser: User,
    enteredIdentifier: string,
    enteredPassword: string
  ): { success: boolean; error?: string; credential?: UserCredential } {
    this.initializeCredentials();
    const creds = this.getCredentials();
    const idNormalized = enteredIdentifier.trim().toLowerCase();
    const pass = enteredPassword.trim();

    if (!idNormalized) {
      return { success: false, error: 'Please enter the HOD User ID or Email.' };
    }
    if (!pass) {
      return { success: false, error: 'Please enter the HOD password.' };
    }

    // Find credential configured for this target HOD in the credential store
    const targetCred = creds.find(
      c =>
        c.userId === targetUser.id ||
        (targetUser.email && c.email.toLowerCase() === targetUser.email.toLowerCase())
    );

    if (!targetCred) {
      return {
        success: false,
        error: `Target account for ${targetUser.name} is not registered in the system credentials.`
      };
    }

    // Enforce matching of identifier to target HOD
    const matchesTargetIdentifier =
      targetCred.email.toLowerCase() === idNormalized ||
      targetCred.userId.toLowerCase() === idNormalized ||
      (targetUser.email && targetUser.email.toLowerCase() === idNormalized) ||
      targetUser.id.toLowerCase() === idNormalized;

    if (!matchesTargetIdentifier) {
      return {
        success: false,
        error: `Access Denied: Entered User ID/Email does not match ${targetUser.name}'s account (${targetUser.email || targetUser.id}).`
      };
    }

    // Verify password against stored credential
    if (targetCred.password !== pass) {
      return {
        success: false,
        error: 'Authentication Failed: Incorrect password entered for this HOD account.'
      };
    }

    return { success: true, credential: targetCred };
  },

  /** Session management */
  saveSession(user: User): void {
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify({
      user,
      loginTime: new Date().toISOString(),
    }));
  },

  getSession(): { user: User; loginTime: string } | null {
    try {
      const data = localStorage.getItem(AUTH_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(AUTH_KEYS.SESSION);
    signOut(auth).catch(() => {});
  },

  isLoggedIn(): boolean {
    return this.getSession() !== null;
  },

  /** Registered faculty list management */
  getRegisteredFaculty(): User[] {
    try {
      const data = localStorage.getItem(AUTH_KEYS.REGISTERED_FACULTY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRegisteredFaculty(faculty: User[]): void {
    localStorage.setItem(AUTH_KEYS.REGISTERED_FACULTY, JSON.stringify(faculty));
  },

  /** Get faculty pending verification (optionally filtered by department) */
  getPendingFaculty(branchId?: string): User[] {
    const list = this.getRegisteredFaculty();
    return list.filter(f => {
      const isPending = f.status === 'PENDING_VERIFICATION';
      return branchId ? isPending && f.branchId === branchId : isPending;
    });
  },

  /** Get approved faculty (optionally filtered by department) */
  getApprovedFaculty(branchId?: string): User[] {
    const list = this.getRegisteredFaculty();
    return list.filter(f => {
      const isApproved = f.status === 'APPROVED' || (!f.status && f.role === 'faculty');
      return branchId ? isApproved && f.branchId === branchId : isApproved;
    });
  },

  /** Approve a pending faculty member profile */
  approveFaculty(facultyId: string, approvedBy: string): { success: boolean; user?: User; error?: string } {
    const facultyList = this.getRegisteredFaculty();
    const index = facultyList.findIndex(f => f.id === facultyId);
    if (index === -1) {
      return { success: false, error: 'Faculty account not found.' };
    }

    const updatedUser: User = {
      ...facultyList[index],
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approvedBy
    };
    facultyList[index] = updatedUser;
    this.saveRegisteredFaculty(facultyList);

    // Sync to Firestore database
    firestoreService.saveUser(updatedUser).catch(() => {});

    // Update corresponding credential
    const creds = this.getCredentials();
    const credIndex = creds.findIndex(c => c.userId === facultyId || c.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (credIndex !== -1) {
      creds[credIndex].status = 'APPROVED';
      this.saveCredentials(creds);
    }

    // Broadcast update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adt_faculty_updated', { detail: updatedUser }));
    }

    return { success: true, user: updatedUser };
  },

  /** Reject a pending faculty registration */
  rejectFaculty(facultyId: string, rejectedBy: string): { success: boolean; user?: User; error?: string } {
    const facultyList = this.getRegisteredFaculty();
    const index = facultyList.findIndex(f => f.id === facultyId);
    if (index === -1) {
      return { success: false, error: 'Faculty account not found.' };
    }

    const updatedUser: User = {
      ...facultyList[index],
      status: 'REJECTED',
      approvedAt: new Date().toISOString(),
      approvedBy: rejectedBy
    };
    facultyList[index] = updatedUser;
    this.saveRegisteredFaculty(facultyList);

    // Sync to Firestore database
    firestoreService.saveUser(updatedUser).catch(() => {});

    // Update corresponding credential
    const creds = this.getCredentials();
    const credIndex = creds.findIndex(c => c.userId === facultyId || c.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (credIndex !== -1) {
      creds[credIndex].status = 'REJECTED';
      this.saveCredentials(creds);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adt_faculty_updated', { detail: updatedUser }));
    }

    return { success: true, user: updatedUser };
  }
};
