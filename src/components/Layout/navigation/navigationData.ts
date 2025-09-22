
import {
  User,
  Users,
  Home,
  Shield,
  Database,
  FileText,
  Calendar,
  CalendarDays,
  BarChart3,
  FolderOpen,
  AlertTriangle,
  UserX,
  List,
  UserCheck,
  Search,
  Network,
  Settings,
  LayoutDashboard,
  ContactRound,
  MessageSquare
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

export const getSidebarGroups = (
  userRole: string,
): NavigationGroup[] => {
  const groups: NavigationGroup[] = [
    {
      label: null,
      items: [
        { to: '/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/profile', icon: User, label: 'My Profile' },
        { to: '/myteam', icon: Network, label: 'My Team' },
        { to: '/security', icon: Shield, label: 'Security' },
        { to: '/platform-feedback', icon: MessageSquare, label: 'Platform Feedback' },
      ],
    },

    // CV Database group (admin/manager with different access levels)
    (userRole === 'admin' || userRole === 'manager') && {
      label: 'CV Database',
      items: [
        { to: '/cv-database/dashboard', icon: LayoutDashboard, label: 'CV Dashboard' },
        { to: '/cv-database/employee-data', icon: Search, label: 'CV Search' },
        { to: '/cv-database/training-certification', icon: FileText, label: 'Training and Certification' },
        ...(userRole === 'admin' ? [
          { to: '/cv-database/employee-data-management', icon: FolderOpen, label: 'CV Completion' },
          { to: '/cv-database/cv-templates', icon: FileText, label: 'CV Templates' },
          { to: '/cv-database/cv-template-settings', icon: Settings, label: 'CV Settings' },
        ] : []),
      ],
    },

    // Resource Calendar group (admin/manager with different access levels)
    (userRole === 'admin' || userRole === 'manager') && {
      label: 'Resource Calendar',
      items: [
        { to: '/resource-calendar/dashboard', icon: LayoutDashboard, label: 'Resource Dashboard' },
        ...(userRole === 'admin' ? [
          { to: '/resource-calendar/planning', icon: Calendar, label: 'Planning' },
          { to: '/resource-calendar/calendar', icon: CalendarDays, label: 'Calendar View' },
          { to: '/resource-calendar/settings', icon: Settings, label: 'Resource Settings' },
        ] : []),
      ],
    },

    // Non-Billed Management group (admin/manager with different access levels)
    (userRole === 'admin' || userRole === 'manager') && {
      label: 'Non-Billed Management',
      items: [
        { to: '/non-billed/dashboard', icon: LayoutDashboard, label: 'Non-Billed Dashboard' },
        { to: '/non-billed/report', icon: BarChart3, label: 'Non-Billed Report' },
        ...(userRole === 'admin' ? [
          { to: '/non-billed/settings', icon: Settings, label: 'Non-Billed Settings' },
        ] : []),
      ],
    },

    // PIP section (available for all users)
    {
      label: 'PIP',
      items: [
        ...(userRole === 'admin' ? [
          { to: '/pip/dashboard', icon: LayoutDashboard, label: 'PIP Dashboard' },
          { to: '/pip/initiate', icon: UserX, label: 'Initiate' },
          { to: '/pip/list', icon: List, label: 'PIP List' },
        ] : []),
        ...(userRole === 'manager' ? [
          { to: '/pip/pm-review', icon: UserCheck, label: 'PM Review (Under Development)' },
        ] : []),
        { to: '/pip/my-situation', icon: UserCheck, label: 'My Situation (Under Development)' },
      ],
    },


    // Admin Configuration group (admin only)
    userRole === 'admin' && {
      label: 'Admin Configuration',
      items: [
        { to: '/users', icon: Users, label: 'User Management' },
        { to: '/projects', icon: Database, label: 'Projects' },
        { to: '/system-settings', icon: Settings, label: 'System Settings' }
      ],
    },
        // Admin Configuration group (admin only)
    userRole === 'admin' && {
      label: 'Audit',
      items: [
        { to: '/audit/dashboard', icon: AlertTriangle, label: 'Dashboard' },
        { to: '/audit/profile-image-warnings', icon: ContactRound, label: 'Profile Image' },
      ],
    },
  ].filter(Boolean) as NavigationGroup[];

  return groups;
};
