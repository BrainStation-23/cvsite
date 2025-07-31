
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Settings,
  ChevronRight,
  University,
  Building2,
  UserCheck,
  Briefcase
} from 'lucide-react';

const PlatformSettings: React.FC = () => {
  const settingsCategories = [
    {
      title: 'Profile Management',
      description: 'Configure universities, departments, degrees, and designations used in employee profiles.',
      icon: GraduationCap,
      route: '/admin/platform-settings/profile',
      items: ['Universities', 'Departments', 'Degrees', 'Designations'],
      color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Resource Planning',
      description: 'Manage resource types, bill types, project types, and automated scheduling for resource planning.',
      icon: Briefcase,
      route: '/admin/platform-settings/resources',
      items: ['Resource Types', 'Bill Types', 'Project Types', 'Weekly Validation Scheduling'],
      color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'CV Template Settings',
      description: 'Configure references and other settings related to CV template generation.',
      icon: FileText,
      route: '/admin/platform-settings/cv-templates',
      items: ['References'],
      color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'System Configuration',
      description: 'Configure system-wide settings including SBUs, HR contacts, and note categories.',
      icon: Settings,
      route: '/admin/platform-settings/system',
      items: ['SBUs', 'HR Contacts', 'Note Categories'],
      color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Platform Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Configure and manage platform-wide settings organized by category.
          </p>
        </div>

        {/* Settings Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category) => (
            <Card key={category.title} className={`${category.color} hover:shadow-lg transition-all duration-200`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${category.iconColor}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {category.title}
                      </CardTitle>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  {category.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Settings Items */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <span 
                        key={item}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button asChild className="w-full">
                  <Link to={category.route}>
                    Configure {category.title}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Profile Settings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resource Settings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">CV Settings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Settings</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlatformSettings;
