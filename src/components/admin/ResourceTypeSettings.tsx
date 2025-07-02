
import React from 'react';
import { ResourceTypeTable } from './resource-type/ResourceTypeTable';

const ResourceTypeSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Resource Types
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage resource types used throughout the platform.
        </p>
      </div>
      
      <ResourceTypeTable />
    </div>
  );
};

export default ResourceTypeSettings;
