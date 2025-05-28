import React from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield } from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
  const modules = [
    {
      title: 'My Profile',
      description: 'View and edit your profile information',
      icon: <User className="h-10 w-10 text-cvsite-teal" />,
      link: '/employee/profile',
    },
    {
      title: 'Security',
      description: 'Update your password and security settings',
      icon: <Shield className="h-10 w-10 text-cvsite-teal" />,
      link: '/employee/security',
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

export default EmployeeDashboard;
