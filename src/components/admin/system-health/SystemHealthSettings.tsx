
import React from 'react';
import StorageCleanup from './StorageCleanup';

const SystemHealthSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          System Health
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and maintain system health with automated cleanup and maintenance tasks.
        </p>
      </div>
      
      <StorageCleanup />
    </div>
  );
};

export default SystemHealthSettings;
