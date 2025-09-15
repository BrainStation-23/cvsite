import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface ProjectDetailsProps {
  project: {
    project_name: string;
    client_name: string | null;
    project_level?: string | null;
    project_bill_type?: string | null;
    project_type_name?: string | null;
  } | null;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  if (!project) return null;

  return (
    <Card className="border-muted">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground">{project.project_name}</h4>
          </div>
          
          {project.client_name && (
            <p className="text-sm text-muted-foreground">Client: {project.client_name}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {project.project_level && (
              <Badge variant="secondary" className="text-xs">
                Level: {project.project_level}
              </Badge>
            )}
            {project.project_bill_type && (
              <Badge variant="secondary" className="text-xs">
                Bill Type: {project.project_bill_type}
              </Badge>
            )}
            {project.project_type_name && (
              <Badge variant="secondary" className="text-xs">
                Type: {project.project_type_name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};