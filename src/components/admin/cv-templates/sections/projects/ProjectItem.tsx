
import React from 'react';

interface ProjectItemProps {
  project: any;
  index: number;
  styles: any;
  isFieldEnabled: (fieldName: string) => boolean;
  applyMasking: (value: any, fieldName: string) => any;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  index,
  styles,
  isFieldEnabled,
  applyMasking
}) => {
  return (
    <div key={index} className="project-item mb-4 p-4 border rounded">
      {isFieldEnabled('name') && (
        <h4 className="font-semibold text-lg mb-2">
          {applyMasking(project.name, 'name')}
        </h4>
      )}
      
      {isFieldEnabled('role') && (
        <p className="text-sm text-gray-600 mb-1">
          <strong>Role:</strong> {applyMasking(project.role, 'role')}
        </p>
      )}
      
      {isFieldEnabled('description') && project.description && (
        <p className="text-sm mb-2">
          {applyMasking(project.description, 'description')}
        </p>
      )}
      
      {isFieldEnabled('technologies_used') && project.technologies_used && (
        <div className="mb-2">
          <span className="text-sm font-medium">Technologies: </span>
          <span className="text-sm">
            {Array.isArray(project.technologies_used) 
              ? project.technologies_used.join(', ')
              : project.technologies_used
            }
          </span>
        </div>
      )}
      
      {isFieldEnabled('start_date') && project.start_date && (
        <p className="text-sm text-gray-600">
          <strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}
        </p>
      )}
      
      {isFieldEnabled('end_date') && project.end_date && (
        <p className="text-sm text-gray-600">
          <strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

export default ProjectItem;
