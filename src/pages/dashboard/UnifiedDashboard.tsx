import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Search, FileText, Users, Calendar, Clock, Settings, BarChart3, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnifiedDashboard: React.FC = () => {
  const { hasModuleAccess, hasSubModulePermission, user } = useAuth();

  // Base modules available to all authenticated users
  const baseModules = [
    {
      title: 'My Profile',
      description: 'View and edit your profile information',
      icon: <User className="h-10 w-10 text-cvsite-teal" />,
      link: '/profile',
      condition: true,
    },
    {
      title: 'Security',
      description: 'Update your password and security settings',
      icon: <Shield className="h-10 w-10 text-cvsite-teal" />,
      link: '/security',
      condition: true,
    }
  ];

  // Permission-based modules
  const permissionBasedModules = [
    {
      title: 'CV Search',
      description: 'Search and view employee CVs',
      icon: <Search className="h-10 w-10 text-cvsite-teal" />,
      link: '/cv-database/employee-data',
      condition: hasModuleAccess("CV Database") && hasSubModulePermission("CV Search", "read"),
    },
    {
      title: 'CV Management',
      description: 'Manage employee data and CVs',
      icon: <FileText className="h-10 w-10 text-cvsite-teal" />,
      link: '/cv-database/employee-data-management',
      condition: hasModuleAccess("CV Database") && hasSubModulePermission("CV Management", "manage"),
    },
    {
      title: 'CV Templates',
      description: 'Manage CV templates and layouts',
      icon: <FileText className="h-10 w-10 text-cvsite-teal" />,
      link: '/cv-database/cv-templates',
      condition: hasModuleAccess("CV Database") && hasSubModulePermission("CV Templates", "manage"),
    },
    {
      title: 'PIP Dashboard',
      description: 'View PIP statistics and analytics',
      icon: <BarChart3 className="h-10 w-10 text-cvsite-teal" />,
      link: '/pip/dashboard',
      condition: hasModuleAccess("PIP") && hasSubModulePermission("PIP Dashboard", "read"),
    },
    {
      title: 'Initiate PIP',
      description: 'Create and manage PIP processes',
      icon: <Users className="h-10 w-10 text-cvsite-teal" />,
      link: '/pip/initiate',
      condition: hasModuleAccess("PIP") && hasSubModulePermission("PIP Initiate", "create"),
    },
    {
      title: 'Resource Calendar',
      description: 'View and manage resource planning',
      icon: <Calendar className="h-10 w-10 text-cvsite-teal" />,
      link: '/resource-calendar/dashboard',
      condition: hasModuleAccess("Resource Calendar") && hasSubModulePermission("Resource Calendar Dashboard", "read"),
    },
    {
      title: 'Resource Planning',
      description: 'Advanced resource planning tools',
      icon: <Calendar className="h-10 w-10 text-cvsite-teal" />,
      link: '/resource-calendar/planning',
      condition: hasModuleAccess("Resource Calendar") && hasSubModulePermission("Resource Calendar Management", "manage"),
    },
    {
      title: 'Non-Billed Dashboard',
      description: 'Track non-billable hours and activities',
      icon: <Clock className="h-10 w-10 text-cvsite-teal" />,
      link: '/non-billed/dashboard',
      condition: hasModuleAccess("Non-Billed") && hasSubModulePermission("Non-Billed Dashboard", "read"),
    },
    {
      title: 'User Management',
      description: 'Manage system users and their roles',
      icon: <Users className="h-10 w-10 text-cvsite-teal" />,
      link: '/users',
      condition: hasModuleAccess("Admin Configuration") && hasSubModulePermission("User Management", "manage"),
    },
    {
      title: 'Role Management',
      description: 'Configure user roles and permissions',
      icon: <Settings className="h-10 w-10 text-cvsite-teal" />,
      link: '/admin/roles',
      condition: hasModuleAccess("Admin Configuration") && hasSubModulePermission("Role Management", "manage"),
    },
    {
      title: 'Module Management',
      description: 'Configure system modules and permissions',
      icon: <Settings className="h-10 w-10 text-cvsite-teal" />,
      link: '/admin/modules',
      condition: hasModuleAccess("Admin Configuration") && hasSubModulePermission("Module Management", "manage"),
    },
    {
      title: 'Projects',
      description: 'Manage projects and assignments',
      icon: <Briefcase className="h-10 w-10 text-cvsite-teal" />,
      link: '/projects',
      condition: hasModuleAccess("Admin Configuration") && hasSubModulePermission("Project Management", "manage"),
    }
  ];

  // Combine and filter modules based on permissions
  const availableModules = [
    ...baseModules,
    ...permissionBasedModules.filter(module => module.condition)
  ];

  console.log('=== Dashboard Debug ===');
  console.log('User role:', user?.role);
  console.log('Available modules count:', availableModules.length);
  console.log('Filtered modules:', availableModules.map(m => m.title));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.first_name || 'User'}! Here's what you have access to:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableModules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center space-y-0 space-x-4">
              {module.icon}
              <CardTitle className="text-lg">{module.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
              <Link 
                to={module.link}
                className="inline-block text-cvsite-teal hover:text-cvsite-navy dark:hover:text-cvsite-light-blue transition-colors font-medium"
              >
                Access &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableModules.length === 2 && (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            You have limited access. Contact your administrator if you need access to additional modules.
          </p>
        </div>
      )}
    </div>
  );
};

export default UnifiedDashboard;