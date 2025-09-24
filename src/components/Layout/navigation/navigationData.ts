
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
  // Permission-based access control
  requiredModuleAccess?: string;
  requiredSubModuleAccess?: string;
  requiredPermissionType?: 'create' | 'read' | 'update' | 'delete' | 'manage';
  // Keep for backward compatibility
  allowedRoles?: string[];
}

export interface NavigationGroup {
  label: string | null;
  items: NavigationItem[];
}

// New permission-based navigation data
export const getPermissionBasedSidebarGroups = (): NavigationGroup[] => {
  return [
    {
      label: null,
      items: [
        { to: '/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/profile', icon: User, label: 'My Profile' },
        { to: '/myteam', icon: Network, label: 'My Team', requiredModuleAccess: 'team_management' },
        { to: '/security', icon: Shield, label: 'Security' },
        { to: '/platform-feedback', icon: MessageSquare, label: 'Platform Feedback' },
      ],
    },

    // CV Database group
    {
      label: 'CV Database',
      items: [
        { 
          to: '/cv-database/dashboard', 
          icon: LayoutDashboard, 
          label: 'CV Dashboard',
          requiredModuleAccess: 'cv_database',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/employee-data', 
          icon: Search, 
          label: 'CV Search',
          requiredModuleAccess: 'cv_database',
          requiredSubModuleAccess: 'employee_data',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/training-certification', 
          icon: FileText, 
          label: 'Training and Certification',
          requiredModuleAccess: 'cv_database',
          requiredSubModuleAccess: 'training_certification',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/employee-data-management', 
          icon: FolderOpen, 
          label: 'CV Completion',
          requiredModuleAccess: 'cv_database',
          requiredSubModuleAccess: 'employee_data_management',
          requiredPermissionType: 'update'
        },
        { 
          to: '/cv-database/cv-templates', 
          icon: FileText, 
          label: 'CV Templates',
          requiredModuleAccess: 'cv_database',
          requiredSubModuleAccess: 'cv_templates',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/cv-template-settings', 
          icon: Settings, 
          label: 'CV Settings',
          requiredModuleAccess: 'cv_database',
          requiredSubModuleAccess: 'cv_template_settings',
          requiredPermissionType: 'update'
        },
      ],
    },

    // Resource Calendar group
    {
      label: 'Resource Calendar',
      items: [
        { 
          to: '/resource-calendar/dashboard', 
          icon: LayoutDashboard, 
          label: 'Resource Dashboard',
          requiredModuleAccess: 'resource_calendar',
          requiredPermissionType: 'read'
        },
        { 
          to: '/resource-calendar/planning', 
          icon: Calendar, 
          label: 'Planning',
          requiredModuleAccess: 'resource_calendar',
          requiredSubModuleAccess: 'resource_planning',
          requiredPermissionType: 'update'
        },
        { 
          to: '/resource-calendar/calendar', 
          icon: CalendarDays, 
          label: 'Calendar View',
          requiredModuleAccess: 'resource_calendar',
          requiredSubModuleAccess: 'calendar_view',
          requiredPermissionType: 'read'
        },
        { 
          to: '/resource-calendar/settings', 
          icon: Settings, 
          label: 'Resource Settings',
          requiredModuleAccess: 'resource_calendar',
          requiredSubModuleAccess: 'resource_settings',
          requiredPermissionType: 'update'
        },
      ],
    },

    // Non-Billed Management group
    {
      label: 'Non-Billed Management',
      items: [
        { 
          to: '/non-billed/dashboard', 
          icon: LayoutDashboard, 
          label: 'Non-Billed Dashboard',
          requiredModuleAccess: 'non_billed_management',
          requiredPermissionType: 'read'
        },
        { 
          to: '/non-billed/report', 
          icon: BarChart3, 
          label: 'Non-Billed Report',
          requiredModuleAccess: 'non_billed_management',
          requiredSubModuleAccess: 'non_billed_reports',
          requiredPermissionType: 'read'
        },
        { 
          to: '/non-billed/settings', 
          icon: Settings, 
          label: 'Non-Billed Settings',
          requiredModuleAccess: 'non_billed_management',
          requiredSubModuleAccess: 'non_billed_settings',
          requiredPermissionType: 'update'
        },
      ],
    },

    // PIP section
    {
      label: 'PIP',
      items: [
        { 
          to: '/pip/dashboard', 
          icon: LayoutDashboard, 
          label: 'PIP Dashboard',
          requiredModuleAccess: 'pip_management',
          requiredPermissionType: 'read'
        },
        { 
          to: '/pip/initiate', 
          icon: UserX, 
          label: 'Initiate',
          requiredModuleAccess: 'pip_management',
          requiredSubModuleAccess: 'pip_initiate',
          requiredPermissionType: 'create'
        },
        { 
          to: '/pip/list', 
          icon: List, 
          label: 'PIP List',
          requiredModuleAccess: 'pip_management',
          requiredSubModuleAccess: 'pip_list',
          requiredPermissionType: 'read'
        },
        { 
          to: '/pip/pm-review', 
          icon: UserCheck, 
          label: 'PM Review',
          requiredModuleAccess: 'pip_management',
          requiredSubModuleAccess: 'pip_pm_review',
          requiredPermissionType: 'update'
        },
        { to: '/pip/my-situation', icon: UserCheck, label: 'My Situation' },
      ],
    },

    // Admin Configuration group
    {
      label: 'Admin Configuration',
      items: [
        { 
          to: '/users', 
          icon: Users, 
          label: 'User Management',
          requiredModuleAccess: 'user_management',
          requiredPermissionType: 'read'
        },
        { 
          to: '/projects', 
          icon: Database, 
          label: 'Projects',
          requiredModuleAccess: 'project_management',
          requiredPermissionType: 'read'
        },
        { 
          to: '/system-settings', 
          icon: Settings, 
          label: 'System Settings',
          requiredModuleAccess: 'system_settings',
          requiredPermissionType: 'update'
        },
        { 
          to: '/admin/roles', 
          icon: Shield, 
          label: 'Role Management',
          requiredModuleAccess: 'role_management',
          requiredPermissionType: 'read'
        },
        { 
          to: '/admin/modules', 
          icon: LayoutDashboard, 
          label: 'Module Management',
          requiredModuleAccess: 'module_management',
          requiredPermissionType: 'read'
        }
      ],
    },

    // Audit
    {
      label: 'Audit',
      items: [
        { 
          to: '/audit/dashboard', 
          icon: AlertTriangle, 
          label: 'Dashboard',
          requiredModuleAccess: 'audit',
          requiredPermissionType: 'read'
        },
        { 
          to: '/audit/profile-image-warnings', 
          icon: ContactRound, 
          label: 'Profile Image',
          requiredModuleAccess: 'audit',
          requiredSubModuleAccess: 'profile_image_audit',
          requiredPermissionType: 'read'
        },
      ],
    },
  ];
};

// Backward compatibility - keep the old function but now filter by permissions
export const getSidebarGroups = (
  userRole: string,
): NavigationGroup[] => {
  return getPermissionBasedSidebarGroups();
};
