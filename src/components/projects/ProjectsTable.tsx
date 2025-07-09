
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
  project_manager: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
  // Added to handle the joined profile data
  project_manager_profile?: {
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
  } | null;
}

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  isLoading: boolean;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onEdit,
  onDelete,
  isLoading
}) => {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectManagerName = (project: Project) => {
    if (!project.project_manager_profile) {
      return <span className="text-muted-foreground">Not assigned</span>;
    }
    
    const profile = project.project_manager_profile;
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    
    return (
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        {profile.employee_id && (
          <span className="text-sm text-muted-foreground">
            ID: {profile.employee_id}
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">No projects found</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project Manager</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <div className="font-medium">{project.project_name}</div>
              </TableCell>
              <TableCell>
                {project.client_name ? (
                  <Badge variant="secondary">{project.client_name}</Badge>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </TableCell>
              <TableCell>
                {getProjectManagerName(project)}
              </TableCell>
              <TableCell>
                <span className="font-mono">
                  {formatCurrency(project.budget)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(project.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
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
                    onClick={() => onDelete(project)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
