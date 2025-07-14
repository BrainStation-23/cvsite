
import {
  User,
  Settings,
  Users,
  Home,
  Shield,
  Database,
  FileText,
  Calendar,
  GraduationCap,
  Briefcase,
  Building2,
  CalendarDays,
  BarChart3
} from 'lucide-react';

export interface NavigationItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  hasSubmenu?: boolean;
  submenuItems?: NavigationItem[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

export interface NavigationGroup {
  label: string | null;
  items: NavigationItem[];
}

// Platform settings sub-menu items
export const platformSettingsItems = [
  { to: '/admin/platform-settings/profile', icon: <GraduationCap className="w-4 h-4" />, label: 'Profile Management' },
  { to: '/admin/platform-settings/resources', icon: <Briefcase className="w-4 h-4" />, label: 'Resource Planning' },
  { to: '/admin/platform-settings/cv-templates', icon: <FileText className="w-4 h-4" />, label: 'CV Templates' },
  { to: '/admin/platform-settings/system', icon: <Building2 className="w-4 h-4" />, label: 'System Config' },
];

export const getResourceCalendarItems = (userRole: string): NavigationItem[] => [
  { to: `/${userRole}/resource-calendar/calendar`, icon: <CalendarDays className="w-4 h-4" />, label: 'Calendar View' },
  { to: `/${userRole}/resource-calendar/statistics`, icon: <BarChart3 className="w-4 h-4" />, label: 'Statistics' },
];

export const getSidebarGroups = (
  userRole: string,
  isPlatformSettingsOpen: boolean,
  isResourceCalendarOpen: boolean,
  togglePlatformSettings: () => void,
  toggleResourceCalendar: () => void
): NavigationGroup[] => {
  const groups: NavigationGroup[] = [
    {
      label: null,
      items: [
        { to: `/${userRole}/dashboard`, icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { to: `/${userRole}/profile`, icon: <User className="w-5 h-5" />, label: 'My Profile' },
        { to: `/${userRole}/security`, icon: <Shield className="w-5 h-5" />, label: 'Security' },
      ],
    },
    // Admin Configuration group (admin only)
    userRole === 'admin' && {
      label: 'Admin Configuration',
      items: [
        { to: '/admin/user-management', icon: <Users className="w-5 h-5" />, label: 'User Management' },
        { 
          to: '/admin/platform-settings', 
          icon: <Settings className="w-5 h-5" />, 
          label: 'Platform Settings',
          hasSubmenu: true,
          submenuItems: platformSettingsItems,
          isExpanded: isPlatformSettingsOpen,
          onToggle: togglePlatformSettings
        },
        { to: '/admin/projects', icon: <Database className="w-5 h-5" />, label: 'Projects' }
      ],
    },
    // Employee Database group (admin/manager)
    (userRole === 'admin' || userRole === 'manager') && {
      label: 'Employee Database',
      items: [
        { to: `/${userRole}/employee-data`, icon: <Database className="w-5 h-5" />, label: 'Employee Data' },
        { to: `/${userRole}/training-certification`, icon: <FileText className="w-5 h-5" />, label: 'Training and Certification' },
        { to: `/${userRole}/resource-planning`, icon: <Calendar className="w-5 h-5" />, label: 'Resource Planning' },
        { 
          to: `/${userRole}/resource-calendar`, 
          icon: <CalendarDays className="w-5 h-5" />, 
          label: 'Resource Calendar',
          hasSubmenu: true,
          submenuItems: getResourceCalendarItems(userRole),
          isExpanded: isResourceCalendarOpen,
          onToggle: toggleResourceCalendar
        }
      ],
    },
    // Admin only: CV Templates (not grouped)
    userRole === 'admin' && {
      label: null,
      items: [
        { to: '/admin/cv-templates', icon: <FileText className="w-5 h-5" />, label: 'CV Templates' },
      ],
    },
  ].filter(Boolean) as NavigationGroup[];

  return groups;
};
