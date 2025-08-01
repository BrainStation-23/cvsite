
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ResourcePlanningTableEditRow } from './ResourcePlanningTableEditRow';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
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

interface EditFormData {
  profileId: string;
  billTypeId: string | null;
  projectId: string | null;
  engagementPercentage: number;
  billingPercentage: number;
  releaseDate: string;
  engagementStartDate: string;
}

interface ResourcePlanningTableRowProps {
  item: ResourcePlanningData;
  isEditing: boolean;
  editData: EditFormData | null;
  onStartEdit: (item: ResourcePlanningData) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDataChange: (data: Partial<EditFormData>) => void;
  editLoading: boolean;
}

export const ResourcePlanningTableRow: React.FC<ResourcePlanningTableRowProps> = ({ 
  item, 
  isEditing,
  editData,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditDataChange,
  editLoading,
}) => {
  const { updateResourcePlanning, deleteResourcePlanning, isDeleting, isUpdating } = usePlannedResources();
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleDeleteClick = () => {
    showConfirmation({
      title: 'Delete Resource Assignment',
      description: 'Are you sure you want to delete this resource assignment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: () => deleteResourcePlanning(item.id)
    });
  };

  const handleCompleteEngagement = () => {
    showConfirmation({
      title: 'Mark Engagement as Complete',
      description: 'Are you sure you want to mark this engagement as complete? This will remove it from the planned resources view.',
      confirmText: 'Mark Complete',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => updateResourcePlanning({ 
        id: item.id, 
        updates: { engagement_complete: true } 
      })
    });
  };

  // If this row is being edited, show the edit row
  if (isEditing && editData) {
    return (
      <ResourcePlanningTableEditRow
        item={item}
        editData={editData}
        onEditDataChange={onEditDataChange}
        onSave={onSaveEdit}
        onCancel={onCancelEdit}
        isLoading={editLoading}
      />
    );
  }

  // Otherwise show the normal read-only row
  return (
    <>
      <TableRow className="h-10">
        <TableCell className="py-1 px-2">
          <div className="flex flex-col">
            <span className="font-medium text-xs">
              {item.profile.first_name} {item.profile.last_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.profile.employee_id}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-1 px-2">
          {item.bill_type ? (
            <Badge variant="secondary" className="text-xs">{item.bill_type.name}</Badge>
          ) : (
            <span className="text-muted-foreground text-xs">Not specified</span>
          )}
        </TableCell>
        <TableCell className="py-1 px-2">
          {item.project ? (
            <div className="flex flex-col">
              <span className="font-medium text-xs">{item.project.project_name}</span>
              {item.project.client_name && (
                <span className="text-xs text-muted-foreground">
                  Client: {item.project.client_name}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">Not assigned</span>
          )}
        </TableCell>
        <TableCell className="py-1 px-2">
          <Badge variant="outline" className="text-xs">{item.engagement_percentage}%</Badge>
        </TableCell>
        <TableCell className="py-1 px-2">
          <Badge variant="outline" className="text-xs">{item.billing_percentage || 0}%</Badge>
        </TableCell>
        <TableCell className="py-1 px-2 text-xs">
          {item.engagement_start_date ? (
            format(new Date(item.engagement_start_date), 'MMM dd, yyyy')
          ) : (
            <span className="text-muted-foreground">Not set</span>
          )}
        </TableCell>
        <TableCell className="py-1 px-2 text-xs">
          {item.release_date ? (
            format(new Date(item.release_date), 'MMM dd, yyyy')
          ) : (
            <span className="text-muted-foreground">Not set</span>
          )}
        </TableCell>
        <TableCell className="py-1 px-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartEdit(item)}
              disabled={isUpdating || editLoading}
              className="h-6 w-6 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCompleteEngagement}
              disabled={isUpdating || editLoading}
              title="Mark engagement as complete"
              className="h-6 w-6 p-0"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting || editLoading}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        description={config?.description || ''}
        confirmText={config?.confirmText}
        cancelText={config?.cancelText}
        variant={config?.variant}
      />
    </>
  );
};
