
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { templateUtilities } from '@/utils/template-utilities';

interface ProjectDisplayProps {
  project: Project;
  isEditing: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectDisplay: React.FC<ProjectDisplayProps> = ({
  project,
  isEditing,
  onEdit,
  onDelete
}) => {
  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    if (!startDate) return '';
    return templateUtilities.formatDateRange(startDate, endDate || null, isCurrent);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-muted-foreground font-medium mb-2">{project.role}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDateRange(project.startDate, project.endDate, project.isCurrent)}
              </span>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(project)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(project.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Key Responsibilities</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.responsibility}
            </p>
          </div>

          {project.technologiesUsed && project.technologiesUsed.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Technologies Used</h4>
              <div className="flex flex-wrap gap-1">
                {project.technologiesUsed.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
