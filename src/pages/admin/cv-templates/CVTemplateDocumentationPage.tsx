
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const CVTemplateDocumentationPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CV Template Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive guide for creating and managing CV templates
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Documentation content coming soon...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CVTemplateDocumentationPage;
