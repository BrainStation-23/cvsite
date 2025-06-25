
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  LogOut,
  Settings,
  Users,
  Home,
  Shield,
  Database,
  Menu,
  FileText,
  Bell,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed default to false for mobile-first
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Grouped sidebar navigation structure
  const sidebarGroups = [
    {
      label: null,
      items: [
        { to: `/${user?.role}/dashboard`, icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { to: `/${user?.role}/profile`, icon: <User className="w-5 h-5" />, label: 'My Profile' },
        { to: `/${user?.role}/security`, icon: <Shield className="w-5 h-5" />, label: 'Security' },
      ],
    },
    // Admin Configuration group (admin only)
    user?.role === 'admin' && {
      label: 'Admin Configuration',
      items: [
        { to: '/admin/user-management', icon: <Users className="w-5 h-5" />, label: 'User Management' },
        { to: '/admin/platform-settings', icon: <Settings className="w-5 h-5" />, label: 'Platform Settings' }
      ],
    },
    // Employee Database group (admin/manager)
    (user?.role === 'admin' || user?.role === 'manager') && {
      label: 'Employee Database',
      items: [
        { to: `/${user?.role}/employee-data`, icon: <Database className="w-5 h-5" />, label: 'Employee Data' },
        { to: `/${user?.role}/training-certification`, icon: <FileText className="w-5 h-5" />, label: 'Training and Certification' }
      ],
    },
    // Admin only: CV Templates (not grouped)
    user?.role === 'admin' && {
      label: null,
      items: [
        { to: '/admin/cv-templates', icon: <FileText className="w-5 h-5" />, label: 'CV Templates' },
      ],
    },
  ].filter(Boolean);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out fixed h-full z-30 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 hidden md:block`}
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
        
        {/* Desktop Navigation */}
        <nav className="mt-5">
          {sidebarGroups.map((group, groupIdx) => (
            <div key={group.label || groupIdx} className="mb-4">
              {group.label && isSidebarOpen && (
                <div className="px-4 py-2.5 text-sm font-bold bg-slate-800/70 text-teal-300 uppercase tracking-wider border-b border-slate-700">
                  {group.label}
                </div>
              )}
              <ul>
                {group.items.map((link) => (
                  <li key={link.to} className="mb-1.5 mx-2">
                    <Link
                      to={link.to}
                      className="flex items-center px-4 py-2.5 hover:bg-teal-900/40 transition-colors rounded-lg group"
                    >
                      {React.cloneElement(link.icon, { className: 'w-5 h-5 text-teal-400 group-hover:text-teal-200' })}
                      {isSidebarOpen && <span className="ml-3 group-hover:text-white">{link.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
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

      {/* Mobile Sidebar */}
      <aside 
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 transform transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="p-4 flex justify-between items-center bg-slate-900/90 border-b border-slate-700">
          <h1 className="font-bold text-xl">CVSite</h1>
          <button 
            onClick={closeMobileMenu}
            className="p-1 rounded hover:bg-cvsite-teal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="mt-5">
          {sidebarGroups.map((group, groupIdx) => (
            <div key={group.label || groupIdx} className="mb-4">
              {group.label && (
                <div className="px-4 py-2.5 text-sm font-bold bg-slate-800/70 text-teal-300 uppercase tracking-wider border-b border-slate-700">
                  {group.label}
                </div>
              )}
              <ul>
                {group.items.map((link) => (
                  <li key={link.to} className="mb-1.5 mx-2">
                    <Link
                      to={link.to}
                      onClick={closeMobileMenu}
                      className="flex items-center px-4 py-2.5 hover:bg-teal-900/40 transition-colors rounded-lg group"
                    >
                      {React.cloneElement(link.icon, { className: 'w-5 h-5 text-teal-400 group-hover:text-teal-200' })}
                      <span className="ml-3 group-hover:text-white">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-cvsite-teal rounded transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'} transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm py-3 px-4 md:px-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 md:hidden mr-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white truncate">
                {getPageTitle()}
              </h2>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative">
                <button className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 bg-slate-50 dark:bg-slate-900 overflow-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 md:p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
