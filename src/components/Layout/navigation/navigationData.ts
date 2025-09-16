
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
  LayoutDashboard
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
        { to: `/${userRole}/dashboard`, icon: Home, label: 'Dashboard' },
        { to: `/${userRole}/profile`, icon: User, label: 'My Profile' },
        { to: `/${userRole}/myteam`, icon: Network, label: 'My Team' },
        { to: `/${userRole}/security`, icon: Shield, label: 'Security' },

      ],
    },

    // CV Database group (admin/manager)
    (userRole === 'admin' || userRole === 'manager') && {
      label: 'CV Database',
      items: [
        { to: `/${userRole}/cv-database/cv-dashboard`, icon: LayoutDashboard, label: 'CV Dashboard' },
        { to: `/${userRole}/cv-database/employee-data`, icon: Search, label: 'CV Search' },
        { to: `/${userRole}/cv-database/training-certification`, icon: FileText, label: 'Training and Certification' },
        { to: `/${userRole}/cv-database/employee-data-management`, icon: FolderOpen, label: 'CV Completion' },
        { to: `/${userRole}/cv-database/cv-templates`, icon: FileText, label: 'CV Templates' },
        { to: `/${userRole}/cv-database/cv-template-settings`, icon: Settings, label: 'CV Settings' },
      ],
    },

    // CV Database group (admin/manager)
    (userRole === 'admin') && {
      label: 'Resource Calendar',
      items: [
        { to: `/${userRole}/resource-calendar/resource-dashboard`, icon: LayoutDashboard, label: 'Resource Dashboard' },
        { to: `/${userRole}/resource-calendar/planning`, icon: Calendar, label: 'Planning' },
        { to: `/${userRole}/resource-calendar/calendar`, icon: CalendarDays, label: 'Calendar View' },
        { to: `/${userRole}/resource-calendar/resource-settings`, icon: Settings, label: 'Resource Settings' },
      ],
    },

    // Bench Management group (admin only)
    userRole === 'admin' && {
      label: 'Non-Billed Management',
      items: [
        { to: `/${userRole}/non-billed-management/dashboard`, icon: LayoutDashboard, label: 'Non-Billed Dashboard' },
        { to: `/${userRole}/non-billed-management/report`, icon: BarChart3, label: 'Non-Billed Report' },
        { to: `/${userRole}/non-billed-management/settings`, icon: Settings, label: 'Non-Billed Settings' },
      ],
    },

    // PIP section (available for all users)
    {
      label: 'PIP',
      items: [
        ...(userRole === 'admin' ? [
          { to: '/admin/pip/dashboard', icon: LayoutDashboard, label: 'PIP Dashboard' },
          { to: '/admin/pip/initiate', icon: UserX, label: 'Initiate' },
          { to: '/admin/pip/list', icon: List, label: 'PIP List' },
        ] : []),
        ...(userRole === 'manager' ? [
          { to: '/manager/pip/pm-review', icon: UserCheck, label: 'PM Review' },
        ] : []),
        { to: `/${userRole}/pip/my-situation`, icon: UserCheck, label: 'My Situation' },
      ],
    },


    // Admin Configuration group (admin only)
    userRole === 'admin' && {
      label: 'Admin Configuration',
      items: [
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/projects', icon: Database, label: 'Projects' },
        { to: '/admin/audit', icon: AlertTriangle, label: 'Audit' },
        { to: '/admin/system-settings', icon: Settings, label: 'System Settings' }
      ],
    },
  ].filter(Boolean) as NavigationGroup[];

  return groups;
};
