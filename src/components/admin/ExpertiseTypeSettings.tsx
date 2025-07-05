
import React from 'react';
import { GenericSettingsTable } from './common/GenericSettingsTable';

const ExpertiseTypeSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Expertise Types
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage expertise types used throughout the platform.
        </p>
      </div>
      
      <GenericSettingsTable 
        tableName="expertise_types"
        entityName="Expertise Type"
        placeholder="Enter new expertise type..."
      />
    </div>
  );
};

export default ExpertiseTypeSettings;
