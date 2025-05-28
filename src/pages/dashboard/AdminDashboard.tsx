
import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings, Database, Shield, FileText } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const modules = [
    {
      title: 'User Management',
      description: 'Create, update and manage user accounts',
      icon: <Users className="h-10 w-10 text-cvsite-teal" />,
      link: '/admin/user-management',
    },
    {
      title: 'Employee Data',
      description: 'View and edit employee profiles',
      icon: <Database className="h-10 w-10 text-cvsite-teal" />,
      link: '/admin/employee-data',
    },
    {
      title: 'CV Templates',
      description: 'Create and manage CV templates',
      icon: <FileText className="h-10 w-10 text-cvsite-teal" />,
      link: '/admin/cv-templates',
    },
    {
      title: 'Platform Settings',
      description: 'Configure system settings and references',
      icon: <Settings className="h-10 w-10 text-cvsite-teal" />,
      link: '/admin/platform-settings',
    },
    {
      title: 'Security',
      description: 'Update your password and security settings',
      icon: <Shield className="h-10 w-10 text-cvsite-teal" />,
      link: '/admin/security',
    }
  ];

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">{module.title}</CardTitle>
                {module.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">{module.description}</p>
              <a 
                href={module.link}
                className="mt-4 inline-block text-cvsite-teal hover:text-cvsite-navy dark:hover:text-cvsite-light-blue"
              >
                Access &rarr;
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
