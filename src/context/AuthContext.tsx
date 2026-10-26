import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, Branch } from '../types';
import { INITIAL_USERS } from '../services/mockData';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { firestoreService } from '../services/firestoreService';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  canEditTimetable: boolean;
  canLogTopics: boolean;
  canCreateEvents: boolean;
  canBookRooms: boolean;
  canPostAnnouncements: boolean;
  canManageDepartment: boolean;
  isSuperAdmin: boolean;
  canAddBranch: boolean;
  canEditBranchDetails: (branchId: string, branch?: Branch) => boolean;
  canEditBranchContent: (branchId: string) => boolean;
  // Login system
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  loginUser: (user: User, mustChange: boolean) => void;
  logout: () => void;
  dismissPasswordChange: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check for existing session
  const existingSession = authService.getSession();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!existingSession);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    if (existingSession?.user) {
      return existingSession.user;
    }
    return storageService.getCurrentUser();
  });

  const [registeredFacultyList, setRegisteredFacultyList] = useState<User[]>(() =>
    authService.getApprovedFaculty()
  );

  useEffect(() => {
    const unsubscribe = authService.subscribeApprovedFaculty(list => {
      setRegisteredFacultyList(list);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const allUsers = useMemo(() => {
    const existingIds = new Set(INITIAL_USERS.map(u => u.id));
    const extra = registeredFacultyList.filter(f => !existingIds.has(f.id));
    return [...INITIAL_USERS, ...extra];
  }, [registeredFacultyList]);

  // Initialize auth credentials on mount & revalidate active session from database
  useEffect(() => {
    authService.initializeCredentials();

    const session = authService.getSession();
    if (session?.user?.id) {
      firestoreService.getUserById(session.user.id).then(dbUser => {
        if (dbUser) {
          setCurrentUserState(dbUser);
          storageService.setCurrentUser(dbUser);
          if (dbUser.branchId && dbUser.branchId !== 'ALL') {
            storageService.setSelectedBranchId(dbUser.branchId);
          }
          authService.saveSession(dbUser);
        }
      }).catch(err => {
        console.warn('[AuthContext] Session user sync fallback:', err);
      });
    }
  }, []);

  useEffect(() => {
    storageService.setCurrentUser(currentUser);
  }, [currentUser]);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    storageService.setCurrentUser(user);
    if (user.branchId && user.branchId !== 'ALL') {
      storageService.setSelectedBranchId(user.branchId);
    }
    authService.saveSession(user);
    firestoreService.saveUser(user).catch(() => {});
  };

  // Login handler
  const loginUser = useCallback((user: User, _mustChange: boolean = false) => {
    storageService.clearUserSession();
    setCurrentUserState(user);
    setIsAuthenticated(true);
    setMustChangePassword(false);
    storageService.setCurrentUser(user);
    if (user.branchId && user.branchId !== 'ALL') {
      storageService.setSelectedBranchId(user.branchId);
    }
    authService.saveSession(user);
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    authService.clearSession();
    storageService.clearUserSession();
    setIsAuthenticated(false);
    setMustChangePassword(false);
    // Reset to clean default state
    const defaultUser = INITIAL_USERS[0];
    setCurrentUserState(defaultUser);
  }, []);

  // Dismiss password change prompt
  const dismissPasswordChange = useCallback(() => {
    setMustChangePassword(false);
  }, []);

  const switchRole = (role: UserRole) => {
    const foundUser = allUsers.find(u => u.role === role);
    if (foundUser) {
      setCurrentUserState(foundUser);
      storageService.setCurrentUser(foundUser);
      if (foundUser.branchId && foundUser.branchId !== 'ALL') {
        storageService.setSelectedBranchId(foundUser.branchId);
      }
      authService.saveSession(foundUser);
    }
  };

  const switchUserById = (userId: string) => {
    const mappedId =
      userId === 'user-hod-aids' ? 'user-hod-cs' :
        userId === 'user-hod-ece' ? 'user-hod-ep' :
          userId === 'user-hod-it' ? 'user-hod-mb' :
            userId;
    const foundUser = allUsers.find(u => u.id === mappedId || u.id === userId);
    if (foundUser) {
      setCurrentUserState(foundUser);
      storageService.setCurrentUser(foundUser);
      if (foundUser.branchId && foundUser.branchId !== 'ALL') {
        storageService.setSelectedBranchId(foundUser.branchId);
      }
      authService.saveSession(foundUser);
    }
  };

  // Super Administrator / College Dean check
  const isSuperAdmin = Boolean(currentUser.isSuperAdmin || currentUser.branchId === 'ALL');
  const canAddBranch = isSuperAdmin;

  // Department-level permission checks
  // Each HOD can only edit their own department's details
  const canEditBranchDetails = (branchId: string, branch?: Branch): boolean => {
    if (currentUser.role !== 'admin') return false;
    if (isSuperAdmin) return true;
    if (currentUser.branchId && currentUser.branchId === branchId) return true;
    if (branch) {
      if (branch.hodEmail && currentUser.email && branch.hodEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) {
        return true;
      }
      if (branch.hodName && currentUser.name && branch.hodName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  // Checks if user has write/edit rights for active branch resources (timetables, teaching logs, subjects)
  const canEditBranchContent = (branchId: string): boolean => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'faculty') return false;
    if (isSuperAdmin) return true;
    return currentUser.branchId === branchId;
  };

  // Role permissions
  const canManageDepartment = currentUser.role === 'admin';
  const canEditTimetable = currentUser.role === 'admin' || currentUser.role === 'faculty';
  const canLogTopics = currentUser.role === 'admin' || currentUser.role === 'faculty';
  const canCreateEvents = currentUser.role === 'admin' || currentUser.role === 'faculty' || currentUser.role === 'student';
  const canBookRooms = true; // All roles can request booking
  const canPostAnnouncements = currentUser.role === 'admin' || currentUser.role === 'faculty';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        switchRole,
        switchUserById,
        canEditTimetable,
        canLogTopics,
        canCreateEvents,
        canBookRooms,
        canPostAnnouncements,
        canManageDepartment,
        isSuperAdmin,
        canAddBranch,
        canEditBranchDetails,
        canEditBranchContent,
        // Login system
        isAuthenticated,
        mustChangePassword,
        loginUser,
        logout,
        dismissPasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
