import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2, CheckCircle, Copy, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useResourcePlanningOperations } from '@/hooks/use-resource-planning-operations';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { useCompleteEngagementDialog } from '@/hooks/use-complete-engagement-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CompleteEngagementDialog } from '@/components/ui/complete-engagement-dialog';
import { ResourcePlanningTableEditRow } from './ResourcePlanningTableEditRow';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  weekly_validation: boolean;
  forecasted_project: string | null;
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
    project_level?: string;
    project_bill_type?: string;
    project_type_name?: string;
  } | null;
  manager: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    full_name: string;
  } | null;
  expertise: string;
}

interface EditFormData {
  profileId: string;
  billTypeId: string | null;
  projectId: string | null;
  engagementPercentage: number;
  billingPercentage: number;
  releaseDate: string;
  engagementStartDate: string;
  forecastedProject: string | null;
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
  // Bulk selection props
  showBulkSelection?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
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
  showBulkSelection = false,
  isSelected = false,
  onSelect,
}) => {
  const { updateResourcePlanning, deleteResourcePlanning, createResourcePlanning, isDeleting, isUpdating, isCreating } = useResourcePlanningOperations();
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();
  const { 
    isOpen: isCompleteDialogOpen, 
    config: completeConfig, 
    showCompleteDialog, 
    hideCompleteDialog, 
    handleConfirm: handleCompleteConfirm 
  } = useCompleteEngagementDialog();

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
    showCompleteDialog({
      title: 'Mark Engagement as Complete',
      description: 'Complete this engagement and optionally update the release date.',
      currentReleaseDate: item.release_date,
      employeeName: `${item.profile.first_name} ${item.profile.last_name}`,
      projectName: item.project?.project_name,
      onConfirm: (newReleaseDate: string) => {
        updateResourcePlanning({ 
          id: item.id, 
          updates: { 
            engagement_complete: true,
            release_date: newReleaseDate
          } 
        });
      }
    });
  };

  const handleInvalidateAssignment = () => {
    showConfirmation({
      title: 'Invalidate Resource Assignment',
      description: 'Are you sure you want to invalidate this resource assignment? This will remove its weekly validation status.',
      confirmText: 'Invalidate',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        updateResourcePlanning({ 
          id: item.id, 
          updates: { weekly_validation: false } 
        });
      }
    });
  };

  const handleDuplicateAssignment = () => {
    showConfirmation({
      title: 'Duplicate Resource Assignment',
      description: 'This will create a new resource assignment with the same information. You can edit it after creation.',
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: () => {
        const duplicateData = {
          profile_id: item.profile_id,
          project_id: item.project?.id,
          bill_type_id: item.bill_type?.id,
          engagement_percentage: item.engagement_percentage,
          billing_percentage: item.billing_percentage,
          engagement_start_date: item.engagement_start_date,
          release_date: item.release_date,
          forecasted_project: item.forecasted_project,
          engagement_complete: false,
          weekly_validation: false,
        };
        createResourcePlanning(duplicateData);
      }
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
        showBulkSelection={showBulkSelection}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    );
  }

  // Apply visual styling for validated rows
  const rowClassName = `h-10 ${item.weekly_validation ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`;

  // Otherwise show the normal read-only row
  return (
    <>
      <TableRow className={rowClassName}>
        {showBulkSelection && (
          <TableCell className="py-1 px-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect?.(item.id, !!checked)}
            />
          </TableCell>
        )}
        
        <TableCell className="py-1 px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs">
                {item.profile.first_name} {item.profile.last_name}
              </span>
              {item.weekly_validation && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-green-100 text-green-700">
                  Validated
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {item.profile.employee_id} 
              {item.expertise && (
                <Badge variant="secondary" className="text-[10px] px-2 mx-1 py-0 h-4 bg-blue-100 text-blue-600">
                   {item.expertise}  
                </Badge>
              )} 

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
            <div className="space-y-1">
              <div className="font-medium text-xs leading-tight">{item.project.project_name}</div>
              {item.project.client_name && (
                <div className="text-xs text-muted-foreground leading-tight">
                  {item.project.client_name}
                </div>
              )}
              {(item.project.project_type_name || item.project.project_level || item.project.project_bill_type) && (
                <div className="flex gap-1 flex-wrap">
                  {item.project.project_type_name && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                      {item.project.project_type_name}
                    </Badge>
                  )}
                  {item.project.project_level && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                      {item.project.project_level}
                    </Badge>
                  )}
                  {item.project.project_bill_type && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                      {item.project.project_bill_type}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">Not assigned</span>
          )}
        </TableCell>

        <TableCell className="py-1 px-2">
          {item.manager ? (
            <span className="text-xs">{item.manager.first_name}</span>
          ) : (
            <span className="text-muted-foreground text-xs">Not specified</span>
          )}
        </TableCell>

        <TableCell className="py-1 px-2">
          {item.forecasted_project ? (
            <span className="text-xs">{item.forecasted_project}</span>
          ) : (
            <span className="text-muted-foreground text-xs">Not specified</span>
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
              title="Edit assignment"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompleteEngagement}
              disabled={isUpdating || editLoading}
              className="h-7 px-2 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvalidateAssignment}
              disabled={!item.weekly_validation || isUpdating || editLoading}
              className={`h-7 px-2 text-xs ${
                item.weekly_validation 
                  ? 'text-orange-700 border-orange-300 hover:bg-orange-50' 
                  : 'text-muted-foreground border-muted'
              }`}
              title={item.weekly_validation ? "Invalidate assignment" : "Assignment not validated"}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Invalidate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDuplicateAssignment}
              disabled={isCreating || editLoading}
              className="h-6 w-6 p-0"
              title="Duplicate assignment"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting || editLoading}
              className="h-6 w-6 p-0"
              title="Delete assignment"
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

      <CompleteEngagementDialog
        isOpen={isCompleteDialogOpen}
        onClose={hideCompleteDialog}
        onConfirm={handleCompleteConfirm}
        title={completeConfig?.title || ''}
        description={completeConfig?.description || ''}
        currentReleaseDate={completeConfig?.currentReleaseDate}
        employeeName={completeConfig?.employeeName || ''}
        projectName={completeConfig?.projectName}
      />
    </>
  );
};
