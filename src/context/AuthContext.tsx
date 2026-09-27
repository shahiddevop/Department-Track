import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Branch } from '../types';
import { INITIAL_USERS } from '../services/mockData';
import { storageService } from '../services/storageService';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(() => storageService.getCurrentUser());
  const allUsers = INITIAL_USERS;

  useEffect(() => {
    storageService.setCurrentUser(currentUser);
  }, [currentUser]);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
  };

  const switchRole = (role: UserRole) => {
    const foundUser = allUsers.find(u => u.role === role);
    if (foundUser) {
      setCurrentUserState(foundUser);
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
        canEditBranchContent
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
