
import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import SidebarNavigation from './navigation/SidebarNavigation';
import DashboardHeader from './DashboardHeader';
import { getSidebarGroups } from './navigation/navigationData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/toaster';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const getPageTitle = () => {
    const path = location.pathname;
    const role = user?.role || '';
    
    // First try to find a matching navigation item
    for (const group of sidebarGroups) {
      const matchingItem = group.items.find(item => {
        // Check if the path matches exactly or is a subpath (for nested routes)
        return path === item.to || path.startsWith(`${item.to}/`);
      });
      
      if (matchingItem) {
        return matchingItem.label;
      }
    }
    
    // Fallback for dashboard
    if (path.endsWith('/dashboard') || path === `/${role}` || path === `/${role}/`) {
      return `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
    }
    
    // Fallback: Convert path segments to title case
    const pathWithoutRole = path.replace(`/${role}`, '');
    const segments = pathWithoutRole.split('/').filter(Boolean);
    
    return segments
      .map(segment => segment.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      )
      .join(' - ');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    user?.role || ''
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-width duration-300 ease-in-out fixed h-full z-10 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex flex-col`}
      >
        {/* Fixed Header */}
        <div className="p-4 flex justify-between items-center bg-slate-900/90 border-b border-slate-700 flex-shrink-0">
          {isSidebarOpen && <h1 className="font-bold text-xl">Employee Database</h1>}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-cvsite-teal"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable Navigation */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full min-h-0">
            <SidebarNavigation sidebarGroups={sidebarGroups} isSidebarOpen={isSidebarOpen} />
          </ScrollArea>
        </div>
        
        {/* Fixed Logout Button */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
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
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64 w-[80%]' : 'ml-16 w-[90%]'} transition-margin duration-300 ease-in-out flex flex-col`}>
        <DashboardHeader pageTitle={getPageTitle()} user={user} />

        {/* Content */}
        <main className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 min-w-0">
          <ScrollArea className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 w-full">
            {children || <Outlet />}
          </ScrollArea>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default DashboardLayout;