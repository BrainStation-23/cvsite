
import React from 'react';
import { GenericSettingsTable } from './common/GenericSettingsTable';

const ProjectTypeSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Project Types
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage project types used throughout the platform.
        </p>
      </div>
      
      <GenericSettingsTable 
        tableName="project_types"
        entityName="Project Type"
        placeholder="Enter new project type..."
      />
    </div>
  );
};

export default ProjectTypeSettings;
