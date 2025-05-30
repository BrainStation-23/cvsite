
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { Project } from '@/types';
import { format } from 'date-fns';

interface ProjectDisplayProps {
  project: Project;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

export const ProjectDisplay: React.FC<ProjectDisplayProps> = ({
  project,
  isEditing,
  onEdit,
  onDelete,
  children
}) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete();
    }
  };

  return (
    <>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center w-full">
          {children}
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between pr-4">
            <div className="font-medium">{project.name} - {project.role}</div>
            <div className="text-muted-foreground text-sm mt-1 md:mt-0">
              {format(project.startDate, 'MMM yyyy')} - {project.isCurrent ? 'Present' : project.endDate ? format(project.endDate, 'MMM yyyy') : ''}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="mt-2 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{project.description}</p>
            
            {project.technologiesUsed && project.technologiesUsed.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium">Technologies:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.technologiesUsed.map((tech) => (
                    <span key={tech} className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {project.url && (
              <div className="mt-3">
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cvsite-teal flex items-center text-sm hover:underline"
                >
                  View Project <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </>
  );
};
