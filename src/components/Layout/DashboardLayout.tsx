
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  X
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, breadcrumbs }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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

  // Default title based on user role
  const defaultTitle = `${user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard`;
  const pageTitle = title || defaultTitle;

  // Navigation links based on user role
  const navLinks = [
    { to: `/${user?.role}/dashboard`, icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
    { to: `/${user?.role}/profile`, icon: <User className="w-5 h-5" />, label: 'My Profile' },
    { to: `/${user?.role}/security`, icon: <Shield className="w-5 h-5" />, label: 'Security' },
  ];

  // Add role-specific links
  if (user?.role === 'admin') {
    navLinks.push(
      { to: '/admin/user-management', icon: <Users className="w-5 h-5" />, label: 'User Management' },
      { to: '/admin/employee-data', icon: <Database className="w-5 h-5" />, label: 'Employee Data' },
      { to: '/admin/platform-settings', icon: <Settings className="w-5 h-5" />, label: 'Platform Settings' }
    );
  } else if (user?.role === 'manager') {
    navLinks.push(
      { to: '/manager/employee-data', icon: <Database className="w-5 h-5" />, label: 'Employee Data' }
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-cvsite-navy text-white transition-width duration-300 ease-in-out fixed h-full z-10`}
      >
        <div className="p-4 flex justify-between items-center">
          {isSidebarOpen && <h1 className="font-bold text-xl">CVSite</h1>}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-cvsite-teal"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <nav className="mt-5">
          <ul>
            {navLinks.map((link) => (
              <li key={link.to} className="mb-2">
                <Link
                  to={link.to}
                  className="flex items-center px-4 py-3 hover:bg-cvsite-teal transition-colors"
                >
                  {link.icon}
                  {isSidebarOpen && <span className="ml-3">{link.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
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

      {/* Main content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-margin duration-300 ease-in-out flex flex-col`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-cvsite-navy dark:text-white mb-1">
                {pageTitle}
              </h2>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((breadcrumb, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          {breadcrumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="w-10 h-10 bg-cvsite-teal rounded-full flex items-center justify-center text-white">
                {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
