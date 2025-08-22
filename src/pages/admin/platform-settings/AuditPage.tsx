
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Shield, FileWarning } from 'lucide-react';

const AuditPage: React.FC = () => {
  const auditCategories = [
    {
      title: 'Profile Image Warnings',
      description: 'View and manage forced profile image uploads that bypassed validation checks.',
      icon: FileWarning,
      route: '/admin/platform-settings/audit/profile-image-warnings',
      color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400',
      severity: 'High'
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Audit Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Monitor and review system security events, policy violations, and administrative actions.
          </p>
        </div>

        {/* Audit Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auditCategories.map((category) => (
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${category.severity === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {category.severity} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                  {category.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link to={category.route}>
                    View Audit Log
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
            Audit Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Audit Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Admin Only</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Access Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">Real-time</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditPage;
