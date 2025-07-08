
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { ResourceAssignmentDialog } from './ResourceAssignmentDialog';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  release_date: string;
  engagement_start_date: string;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  };
}

interface ResourcePlanningTableRowProps {
  item: ResourcePlanningData;
}

export const ResourcePlanningTableRow: React.FC<ResourcePlanningTableRowProps> = ({ item }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { deleteResourcePlanning, isDeleting } = useResourcePlanning();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this resource assignment?')) {
      deleteResourcePlanning(item.id);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">
              {item.profile.first_name} {item.profile.last_name}
            </span>
            <span className="text-sm text-muted-foreground">
              {item.profile.employee_id}
            </span>
          </div>
        </TableCell>
        <TableCell>
          {item.bill_type ? (
            <Badge variant="secondary">{item.bill_type.name}</Badge>
          ) : (
            <span className="text-muted-foreground">Not specified</span>
          )}
        </TableCell>
        <TableCell>
          {item.project ? (
            <div className="flex flex-col">
              <span className="font-medium">{item.project.project_name}</span>
              {item.project.client_name && (
                <span className="text-sm text-muted-foreground">
                  Client: {item.project.client_name}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="outline">{item.engagement_percentage}%</Badge>
        </TableCell>
        <TableCell>
          {item.engagement_start_date ? (
            format(new Date(item.engagement_start_date), 'MMM dd, yyyy')
          ) : (
            <span className="text-muted-foreground">Not set</span>
          )}
        </TableCell>
        <TableCell>
          {item.release_date ? (
            format(new Date(item.release_date), 'MMM dd, yyyy')
          ) : (
            <span className="text-muted-foreground">Not set</span>
          )}
        </TableCell>
        <TableCell>
          {format(new Date(item.created_at), 'MMM dd, yyyy')}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <ResourceAssignmentDialog
        mode="edit"
        item={item}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};
