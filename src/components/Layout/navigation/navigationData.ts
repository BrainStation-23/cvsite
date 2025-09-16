
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
        { to: `/${userRole}/cv-dashboard`, icon: LayoutDashboard, label: 'CV Dashboard' },
        { to: `/${userRole}/employee-data`, icon: Search, label: 'CV Search' },
        { to: `/${userRole}/training-certification`, icon: FileText, label: 'Training and Certification' },
        { to: `/${userRole}/cv-template-settings`, icon: Settings, label: 'CV Template Settings' },
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
      label: 'Bench Management',
      items: [
        { to: '/admin/bench/dashboard', icon: LayoutDashboard, label: 'Bench Dashboard' },
        { to: '/admin/bench/report', icon: BarChart3, label: 'Bench Report' },
        { to: '/admin/bench/settings', icon: Settings, label: 'Bench Settings' },
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
        { to: '/admin/employee-data-management', icon: FolderOpen, label: 'Employee Data Management' },
        { to: '/admin/projects', icon: Database, label: 'Projects' },
        { to: '/admin/cv-templates', icon: FileText, label: 'CV Templates' },
        { to: '/admin/system-settings', icon: Settings, label: 'System Settings' },
        { to: '/admin/audit', icon: AlertTriangle, label: 'Audit' },
      ],
    },
  ].filter(Boolean) as NavigationGroup[];

  return groups;
};
