
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X } from 'lucide-react';
import { ProfileSelect } from './ProfileSelect';
import { BillTypeSelect } from './BillTypeSelect';
import { ProjectSelect } from './ProjectSelect';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
  };
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
  } | null;
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

interface ResourcePlanningTableEditRowProps {
  item: ResourcePlanningData;
  editData: EditFormData;
  onEditDataChange: (data: Partial<EditFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  showBulkSelection?: boolean;
}

export const ResourcePlanningTableEditRow: React.FC<ResourcePlanningTableEditRowProps> = ({
  item,
  editData,
  onEditDataChange,
  onSave,
  onCancel,
  isLoading,
  showBulkSelection = false,
}) => {
  return (
    <TableRow className="h-10 bg-muted/30">
      {showBulkSelection && (
        <TableCell className="py-1 px-2">
          {/* Empty cell for bulk selection column during edit */}
        </TableCell>
      )}
      <TableCell className="py-1 px-2">
        <ProfileSelect
          value={editData.profileId}
          onChange={(value) => onEditDataChange({ profileId: value })}
          placeholder="Select employee..."
          disabled={isLoading}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <BillTypeSelect
          value={editData.billTypeId}
          onChange={(value) => onEditDataChange({ billTypeId: value })}
          placeholder="Select bill type..."
          disabled={isLoading}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <ProjectSelect
          value={editData.projectId}
          onChange={(value) => onEditDataChange({ projectId: value })}
          placeholder="Select project..."
          disabled={isLoading}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <Input
          type="number"
          value={editData.engagementPercentage}
          onChange={(e) => onEditDataChange({ engagementPercentage: parseInt(e.target.value) || 0 })}
          min="0"
          max="100"
          className="h-7 text-xs"
          disabled={isLoading}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <Input
          type="number"
          value={editData.billingPercentage}
          onChange={(e) => onEditDataChange({ billingPercentage: parseInt(e.target.value) || 0 })}
          min="0"
          max="100"
          className="h-7 text-xs"
          disabled={isLoading}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <Input
          type="date"
          value={editData.engagementStartDate}
          onChange={(e) => onEditDataChange({ engagementStartDate: e.target.value })}
          className="h-7 text-xs"
          disabled={isLoading}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <Input
          type="date"
          value={editData.releaseDate}
          onChange={(e) => onEditDataChange({ releaseDate: e.target.value })}
          className="h-7 text-xs"
          disabled={isLoading}
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isLoading}
            className="h-6 w-6 p-0"
            title="Save changes"
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="h-6 w-6 p-0"
            title="Cancel edit"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
