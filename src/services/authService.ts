/**
 * Authentication Service
 * Manages user credentials, login/logout, registration, and password updates.
 * Uses localStorage for credential persistence (testing/demo mode).
 */

import { User, UserRole, AccountStatus } from '../types';
import { INITIAL_USERS, INITIAL_BRANCHES } from './mockData';

// ─── Storage Keys ───────────────────────────────────────────────
const AUTH_KEYS = {
  CREDENTIALS: 'adt_user_credentials_v1',
  SESSION: 'adt_active_session_v1',
  REGISTERED_FACULTY: 'adt_registered_faculty_v1',
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
  }));

// ─── Service ────────────────────────────────────────────────────
export const authService = {

  /** Initialize default credentials if not present */
  initializeCredentials(): void {
    const existing = localStorage.getItem(AUTH_KEYS.CREDENTIALS);
    if (!existing) {
      localStorage.setItem(AUTH_KEYS.CREDENTIALS, JSON.stringify(HOD_ADMIN_ACCOUNTS));
    } else {
      // Ensure any new HOD accounts are merged in and mustChangePassword is false
      try {
        const stored: UserCredential[] = JSON.parse(existing);
        let updated = false;

        // Ensure all accounts are migrated to @sjdc.edu and mustChangePassword is false
        stored.forEach(c => {
          if (c.email && c.email.includes('@gmail.com')) {
            c.email = c.email.replace('@gmail.com', '@sjdc.edu');
            updated = true;
          }
          if (c.mustChangePassword) {
            c.mustChangePassword = false;
            updated = true;
          }
          // Default pre-existing accounts to APPROVED if no status is recorded
          if (!c.status) {
            c.status = 'APPROVED';
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

  /** Login with email and password */
  login(email: string, password: string, role: 'admin' | 'faculty'): LoginResult {
    this.initializeCredentials();
    const creds = this.getCredentials();
    let normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.includes('@gmail.com')) {
      normalizedEmail = normalizedEmail.replace('@gmail.com', '@sjdc.edu');
    }

    const credential = creds.find(
      c => (c.email.toLowerCase() === normalizedEmail || c.userId.toLowerCase() === normalizedEmail) && c.role === role
    );

    if (!credential) {
      // For admin, check if the email exists but role doesn't match
      const anyMatch = creds.find(c => c.email.toLowerCase() === normalizedEmail || c.userId.toLowerCase() === normalizedEmail);
      if (anyMatch && anyMatch.role !== role) {
        return { success: false, error: `This account is registered as ${anyMatch.role === 'admin' ? 'HOD/Admin' : 'Faculty'}. Please switch to the correct tab.` };
      }
      return { success: false, error: role === 'admin' ? 'No HOD/Admin account found with this email/ID.' : 'No faculty account found. Please register first.' };
    }

    if (credential.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Find the matching User object
    let user: User | undefined;

    if (role === 'admin') {
      user = INITIAL_USERS.find(u => u.email.toLowerCase() === normalizedEmail || u.id.toLowerCase() === normalizedEmail || u.id === credential.userId);
    } else {
      // Faculty – check registered faculty list
      const registeredFaculty = this.getRegisteredFaculty();
      user = registeredFaculty.find(f => f.email.toLowerCase() === normalizedEmail || f.id.toLowerCase() === normalizedEmail);
      if (!user) {
        user = INITIAL_USERS.find(u => (u.email.toLowerCase() === normalizedEmail || u.id.toLowerCase() === normalizedEmail) && u.role === 'faculty');
      }
    }

    if (!user) {
      return { success: false, error: 'User profile not found. Contact administrator.' };
    }

    // Status verification gate for faculty accounts
    if (role === 'faculty') {
      const currentStatus = user.status || credential.status;
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

    // Save session
    this.saveSession(user);

    return {
      success: true,
      user,
      status: (user.status || credential.status || 'APPROVED') as AccountStatus,
      mustChangePassword: false,
    };
  },

  /** Register a new faculty member with status: "PENDING_VERIFICATION" */
  registerFaculty(registration: FacultyRegistration): LoginResult {
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

    // Check if email already exists
    if (creds.find(c => c.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this institutional email already exists.' };
    }

    // Find the branch
    const branch = INITIAL_BRANCHES.find(b => b.id === registration.branchId);
    if (!branch) {
      return { success: false, error: 'Invalid department selected.' };
    }

    // Create user ID
    const facultyId = `faculty-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Create user object with status: "PENDING_VERIFICATION"
    const newUser: User = {
      id: facultyId,
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
    };

    // Create credential with status: "PENDING_VERIFICATION"
    const newCred: UserCredential = {
      userId: facultyId,
      email: registration.email.trim(),
      password: registration.password,
      role: 'faculty',
      name: registration.name.trim(),
      mustChangePassword: false,
      status: 'PENDING_VERIFICATION',
      branchId: registration.branchId,
    };

    // Save credential
    creds.push(newCred);
    this.saveCredentials(creds);

    // Save to registered faculty list
    const faculty = this.getRegisteredFaculty();
    faculty.push(newUser);
    this.saveRegisteredFaculty(faculty);

    // Notice: We deliberately DO NOT save session here.
    // The faculty cannot log in until approved by the Department HOD.
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
