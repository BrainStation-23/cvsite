
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
  requiredModuleAccess: string;
  requiredSubModuleAccess: string;
  requiredPermissionType: 'create' | 'read' | 'update' | 'delete' | 'manage';
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
        { 
          to: '/dashboard', 
          icon: Home, 
          label: 'Dashboard',
          requiredModuleAccess: 'General',
          requiredSubModuleAccess: 'Dashboard',
          requiredPermissionType: 'read'
        },
        { 
          to: '/profile', 
          icon: User, 
          label: 'My Profile',
          requiredModuleAccess: 'General',
          requiredSubModuleAccess: 'My Profile',
          requiredPermissionType: 'read'
        },
        { 
          to: '/myteam', 
          icon: Network, 
          label: 'My Team',
          requiredModuleAccess: 'General',
          requiredSubModuleAccess: 'My Team',
          requiredPermissionType: 'read'
        },
        { 
          to: '/security', 
          icon: Shield, 
          label: 'Security',
          requiredModuleAccess: 'General',
          requiredSubModuleAccess: 'Security',
          requiredPermissionType: 'read'
        },
        { 
          to: '/platform-feedback', 
          icon: MessageSquare, 
          label: 'Platform Feedback',
          requiredModuleAccess: 'General',
          requiredSubModuleAccess: 'Platform Feedback',
          requiredPermissionType: 'read'
        },
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
          requiredModuleAccess: 'CV Database',
          requiredSubModuleAccess: 'CV Dashboard',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/employee-data', 
          icon: Search, 
          label: 'CV Search',
          requiredModuleAccess: 'CV Database',
          requiredSubModuleAccess: 'CV Search',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/training-certification', 
          icon: FileText, 
          label: 'Training and Certification',
          requiredModuleAccess: 'CV Database',
          requiredSubModuleAccess: 'Training and Certification',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/employee-data-management', 
          icon: FolderOpen, 
          label: 'CV Completion',
          requiredModuleAccess: 'CV Database',
          requiredSubModuleAccess: 'CV Completion',
          requiredPermissionType: 'update'
        },
        { 
          to: '/cv-database/cv-templates', 
          icon: FileText, 
          label: 'CV Templates',
          requiredModuleAccess: 'CV Database',
          requiredSubModuleAccess: 'CV Templates',
          requiredPermissionType: 'read'
        },
        { 
          to: '/cv-database/cv-template-settings', 
          icon: Settings, 
          label: 'CV Settings',
          requiredModuleAccess: 'CV Database',
          requiredSubModuleAccess: 'CV Settings',
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
          requiredModuleAccess: 'Resource Calendar',
          requiredSubModuleAccess: 'Resource Dashboard',
          requiredPermissionType: 'read'
        },
        { 
          to: '/resource-calendar/planning', 
          icon: Calendar, 
          label: 'Planning',
          requiredModuleAccess: 'Resource Calendar',
          requiredSubModuleAccess: 'Planning',
          requiredPermissionType: 'read'
        },
        { 
          to: '/resource-calendar/calendar', 
          icon: CalendarDays, 
          label: 'Calendar View',
          requiredModuleAccess: 'Resource Calendar',
          requiredSubModuleAccess: 'Calendar View',
          requiredPermissionType: 'read'
        },
        { 
          to: '/resource-calendar/settings', 
          icon: Settings, 
          label: 'Resource Settings',
          requiredModuleAccess: 'Resource Calendar',
          requiredSubModuleAccess: 'Resource Settings',
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
          requiredModuleAccess: 'Non-Billed Management',
          requiredSubModuleAccess: 'Non-Billed Dashboard',
          requiredPermissionType: 'read'
        },
        { 
          to: '/non-billed/report', 
          icon: BarChart3, 
          label: 'Non-Billed Report',
          requiredModuleAccess: 'Non-Billed Management',
          requiredSubModuleAccess: 'Non-Billed Report',
          requiredPermissionType: 'read'
        },
        { 
          to: '/non-billed/settings', 
          icon: Settings, 
          label: 'Non-Billed Settings',
          requiredModuleAccess: 'Non-Billed Management',
          requiredSubModuleAccess: 'Non-Billed Settings',
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
          requiredModuleAccess: 'PIP',
          requiredSubModuleAccess: 'PIP Dashboard',
          requiredPermissionType: 'read'
        },
        { 
          to: '/pip/initiate', 
          icon: UserX, 
          label: 'Initiate',
          requiredModuleAccess: 'PIP',
          requiredSubModuleAccess: 'Initiate',
          requiredPermissionType: 'create'
        },
        { 
          to: '/pip/list', 
          icon: List, 
          label: 'PIP List',
          requiredModuleAccess: 'PIP',
          requiredSubModuleAccess: 'PIP List',
          requiredPermissionType: 'read'
        },
        { 
          to: '/pip/pm-review', 
          icon: UserCheck, 
          label: 'PM Review',
          requiredModuleAccess: 'PIP',
          requiredSubModuleAccess: 'PM Review',
          requiredPermissionType: 'read'
        },
        { to: '/pip/my-situation', 
          icon: UserCheck, 
          label: 'My Situation',
          requiredModuleAccess: 'PIP',
          requiredSubModuleAccess: 'My Situation',
          requiredPermissionType: 'read' 
        },
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
          requiredModuleAccess: 'Admin Configuration',
          requiredSubModuleAccess: 'User Management',
          requiredPermissionType: 'read'
        },
        { 
          to: '/projects', 
          icon: Database, 
          label: 'Projects',
          requiredModuleAccess: 'Admin Configuration',
          requiredSubModuleAccess: 'Projects',
          requiredPermissionType: 'read'
        },
        { 
          to: '/system-settings', 
          icon: Settings, 
          label: 'System Settings',
          requiredModuleAccess: 'Admin Configuration',
          requiredSubModuleAccess: 'System Settings',
          requiredPermissionType: 'update'
        },
        { 
          to: '/admin/roles', 
          icon: Shield, 
          label: 'Role Management',
          requiredModuleAccess: 'Admin Configuration',
          requiredSubModuleAccess: 'Role Management',
          requiredPermissionType: 'read'
        },
        { 
          to: '/admin/modules', 
          icon: LayoutDashboard, 
          label: 'Module Management',
          requiredModuleAccess: 'Admin Configuration',
          requiredSubModuleAccess: 'Module Management',
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
          requiredModuleAccess: 'Audit',
          requiredSubModuleAccess: 'Audit Dashboard',
          requiredPermissionType: 'read'
        },
        { 
          to: '/audit/profile-image-warnings', 
          icon: ContactRound, 
          label: 'Profile Image',
          requiredModuleAccess: 'Audit',
          requiredSubModuleAccess: 'Profile Image Warnings',
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
