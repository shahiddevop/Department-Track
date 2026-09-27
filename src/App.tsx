import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DepartmentProvider, useDepartment } from './context/DepartmentContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';
import { UrgentBanner } from './components/notifications/UrgentBanner';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { TimetableGrid } from './components/timetable/TimetableGrid';
import { TeachingPlanList } from './components/teaching/TeachingPlanList';
import { EventList } from './components/events/EventList';
import { RoomGrid } from './components/rooms/RoomGrid';
import { AnalyticsDashboard } from './components/reports/AnalyticsDashboard';
import { DepartmentSettings } from './components/settings/DepartmentSettings';
import { UserProfileView } from './components/profile/UserProfileView';

const MainAppContent: React.FC = () => {
  const { activeTab } = useDepartment();
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 960) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsDesktopSidebarCollapsed(prev => !prev);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onOpenNotifications={() => setIsNotificationDrawerOpen(true)} />;
      case 'timetable':
        return <TimetableGrid />;
      case 'teaching-plan':
        return <TeachingPlanList />;
      case 'events':
        return <EventList />;
      case 'rooms':
        return <RoomGrid />;
      case 'notifications':
        return (
          <div className="page-container">
            <AnalyticsDashboard />
          </div>
        );
      case 'reports':
        return <AnalyticsDashboard />;
      case 'settings':
        return <DepartmentSettings />;
      case 'profile':
        return <UserProfileView />;
      default:
        return <DashboardOverview onOpenNotifications={() => setIsNotificationDrawerOpen(true)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        isCollapsed={isDesktopSidebarCollapsed}
        onClose={() => setIsMobileSidebarOpen(false)} 
        onToggleCollapse={() => setIsDesktopSidebarCollapsed(prev => !prev)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Sticky Top Urgent Broadcast Alert */}
        <UrgentBanner onOpenNotifications={() => setIsNotificationDrawerOpen(true)} />

        {/* Global Top Navbar */}
        <Navbar 
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)} 
          onToggleMobileSidebar={handleToggleSidebar}
        />

        {/* Active Tab View */}
        <main style={{ flex: 1 }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Global Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DepartmentProvider>
        <MainAppContent />
      </DepartmentProvider>
    </AuthProvider>
  );
}

export default App;
