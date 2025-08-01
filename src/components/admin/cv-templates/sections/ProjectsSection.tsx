
import React from 'react';
import ProjectItem from './projects/ProjectItem';
import { FieldMapping } from '@/types/cv-templates';

interface FieldConfig {
  field_name: string;
  display_label: string;
  default_enabled: boolean;
  default_masked: boolean;
  default_mask_value: string;
  default_order: number;
  field_type: string;
}

interface ProjectsSectionProps {
  projects: any[];
  orderedFields: FieldConfig[];
  fieldMappings: FieldMapping[];
  styles: any;
  isFieldEnabled: (fieldName: string) => boolean;
  applyMasking: (value: any, fieldName: string) => any;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  orderedFields,
  fieldMappings,
  styles,
  isFieldEnabled,
  applyMasking
}) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="projects-section mb-6">
      <h3 className="text-xl font-semibold mb-4">Projects</h3>
      {projects.map((project, index) => (
        <ProjectItem
          key={project.id || index}
          project={project}
          index={index}
          styles={styles}
          isFieldEnabled={isFieldEnabled}
          applyMasking={applyMasking}
        />
      ))}
    </div>
  );
};

export default ProjectsSection;
