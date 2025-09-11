
import {
  User,
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
  BarChart3,
  FolderOpen,
  AlertTriangle,
  UserX,
  List,
  TrendingUp,
  UserCheck,
  Search,
  Network,
  Settings,
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
        { to: `/${userRole}/employee-data`, icon: Search, label: 'CV Search' },
        { to: `/${userRole}/training-certification`, icon: FileText, label: 'Training and Certification' },
      ],
    },

        // CV Database group (admin/manager)
    (userRole === 'admin') && {
      label: 'Resource Calendar',
      items: [
          { to: `/${userRole}/resource-calendar/planning`, icon: Calendar, label: 'Planning' },
          { to: `/${userRole}/resource-calendar/calendar`, icon: CalendarDays, label: 'Calendar View' },
          { to: `/${userRole}/resource-calendar/statistics`, icon: BarChart3, label: 'Statistics' },
      ],
    },

    // PIP section (available for all users)
    {
      label: 'PIP',
      items: [
        ...(userRole === 'admin' ? [
          { to: '/admin/pip/initiate', icon: UserX, label: 'Initiate' },
          { to: '/admin/pip/list', icon: List, label: 'PIP List' },
          { to: '/admin/pip/dashboard', icon: TrendingUp, label: 'PIP Dashboard' },
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
        { to: '/admin/user-management', icon: Users, label: 'User Management' },
        { to: '/admin/employee-data-management', icon: FolderOpen, label: 'Employee Data Management' },
        { to: '/admin/projects', icon: Database, label: 'Projects' },
        { to: '/admin/cv-templates', icon: FileText, label: 'CV Templates' },
      ],
    },

    // Bench Management group (admin only)
    userRole === 'admin' && {
      label: 'Bench Management',
      items: [
        { to: '/admin/bench/report', icon: BarChart3, label: 'Bench Report' },
        { to: '/admin/bench/settings', icon: Settings, label: 'Bench Settings' },
      ],
    },


    // Platform Settings(admin only)
    userRole === 'admin' && {
      label: 'Platform Settings',
      items: [
          { to: '/admin/platform-settings/profile', icon: GraduationCap, label: 'Profile Management' },
          { to: '/admin/platform-settings/resources', icon: Briefcase, label: 'Resource Planning' },
          { to: '/admin/platform-settings/cv-templates', icon: FileText, label: 'CV Templates' },
          { to: '/admin/platform-settings/system', icon: Building2, label: 'System Config' },
          { to: '/admin/platform-settings/audit', icon: AlertTriangle, label: 'Audit' },
      ],
    },

  ].filter(Boolean) as NavigationGroup[];

  return groups;
};
