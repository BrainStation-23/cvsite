
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
  icon: any;
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
  { to: '/admin/platform-settings/profile', icon: GraduationCap, label: 'Profile Management' },
  { to: '/admin/platform-settings/resources', icon: Briefcase, label: 'Resource Planning' },
  { to: '/admin/platform-settings/cv-templates', icon: FileText, label: 'CV Templates' },
  { to: '/admin/platform-settings/system', icon: Building2, label: 'System Config' },
];

export const getResourceCalendarItems = (userRole: string): NavigationItem[] => [
  { to: `/${userRole}/resource-planning`, icon: Calendar, label: 'Planning' },
  { to: `/${userRole}/resource-calendar/calendar`, icon: CalendarDays, label: 'Calendar View' },
  { to: `/${userRole}/resource-calendar/statistics`, icon: BarChart3, label: 'Statistics' },
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
        { to: `/${userRole}/dashboard`, icon: Home, label: 'Dashboard' },
        { to: `/${userRole}/profile`, icon: User, label: 'My Profile' },
        { to: `/${userRole}/security`, icon: Shield, label: 'Security' },
      ],
    },
    // Admin Configuration group (admin only)
    userRole === 'admin' && {
      label: 'Admin Configuration',
      items: [
        { to: '/admin/user-management', icon: Users, label: 'User Management' },
        { 
          to: '/admin/platform-settings', 
          icon: Settings, 
          label: 'Platform Settings',
          hasSubmenu: true,
          submenuItems: platformSettingsItems,
          isExpanded: isPlatformSettingsOpen,
          onToggle: togglePlatformSettings
        },
        { to: '/admin/projects', icon: Database, label: 'Projects' }
      ],
    },
    // Employee Database group (admin/manager)
    (userRole === 'admin' || userRole === 'manager') && {
      label: 'Employee Database',
      items: [
        { to: `/${userRole}/employee-data`, icon: Database, label: 'Employee Data' },
        { to: `/${userRole}/training-certification`, icon: FileText, label: 'Training and Certification' },
        { 
          to: `/${userRole}/resource-calendar`, 
          icon: CalendarDays, 
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
        { to: '/admin/cv-templates', icon: FileText, label: 'CV Templates' },
      ],
    },
  ].filter(Boolean) as NavigationGroup[];

  return groups;
};
