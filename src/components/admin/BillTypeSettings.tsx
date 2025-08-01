
import React from 'react';
import { GenericSettingsTable } from './common/GenericSettingsTable';

const BillTypeSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bill Types
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage bill types used throughout the platform.
        </p>
      </div>
      
      <GenericSettingsTable 
        tableName="bill_types"
        entityName="Bill Type"
        placeholder="Enter new bill type..."
      />
    </div>
  );
};

export default BillTypeSettings;
