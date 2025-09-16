
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
  );
};

export default AuditPage;
