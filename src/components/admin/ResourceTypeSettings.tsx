
import React from 'react';
import { GenericSettingsTable } from './common/GenericSettingsTable';

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
      
      <GenericSettingsTable 
        tableName="resource_types"
        entityName="Resource Type"
        placeholder="Enter new resource type..."
      />
    </div>
  );
};

export default ResourceTypeSettings;
