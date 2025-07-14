
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import SidebarNavigation from './navigation/SidebarNavigation';
import DashboardHeader from './DashboardHeader';
import { getSidebarGroups } from './navigation/navigationData';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlatformSettingsOpen, setIsPlatformSettingsOpen] = useState(
    location.pathname.startsWith('/admin/platform-settings')
  );
  const [isResourceCalendarOpen, setIsResourceCalendarOpen] = useState(
    location.pathname.startsWith(`/${user?.role}/resource-calendar`)
  );
  
  const getPageTitle = () => {
    const path = location.pathname;
    const role = user?.role || '';
    
    // Remove role prefix and split path
    const pathWithoutRole = path.replace(`/${role}`, '');
    const segments = pathWithoutRole.split('/').filter(Boolean);
    
    if (segments.length === 0 || segments[0] === 'dashboard') {
      return `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
    }

    // Convert path segments to title case
    const title = segments
      .map(segment => segment.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      )
      .join(' - ');

    return title;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const togglePlatformSettings = () => {
    setIsPlatformSettingsOpen(!isPlatformSettingsOpen);
  };

  const toggleResourceCalendar = () => {
    setIsResourceCalendarOpen(!isResourceCalendarOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarGroups = getSidebarGroups(
    user?.role || '',
    isPlatformSettingsOpen,
    isResourceCalendarOpen,
    togglePlatformSettings,
    toggleResourceCalendar
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-width duration-300 ease-in-out fixed h-full z-10 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100`}
      >
        <div className="p-4 flex justify-between items-center bg-slate-900/90 border-b border-slate-700">
          {isSidebarOpen && <h1 className="font-bold text-xl">CVSite</h1>}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-cvsite-teal"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <SidebarNavigation sidebarGroups={sidebarGroups} isSidebarOpen={isSidebarOpen} />
        
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-cvsite-teal rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-margin duration-300 ease-in-out flex flex-col`}>
        <DashboardHeader pageTitle={getPageTitle()} user={user} />

        {/* Content */}
        <main className="flex-1 px-6 py-6 bg-slate-50 dark:bg-slate-900">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
