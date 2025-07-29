
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import BillTypeCombobox from './BillTypeCombobox';
import { ProjectCombobox } from '@/components/projects/ProjectCombobox';
import DatePicker from '@/components/admin/user/DatePicker';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

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

interface ResourcePlanningTableEditRowProps {
  item: ResourcePlanningData;
  editData: EditFormData;
  onEditDataChange: (data: Partial<EditFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ResourcePlanningTableEditRow: React.FC<ResourcePlanningTableEditRowProps> = ({
  item,
  editData,
  onEditDataChange,
  onSave,
  onCancel,
  isLoading,
}) => {
  return (
    <TableRow>
      <TableCell>
        <ProfileCombobox
          value={editData.profileId}
          onValueChange={(value) => onEditDataChange({ profileId: value || '' })}
          placeholder="Select employee..."
          disabled={true} // Profile shouldn't be changed in edit mode
          label="Employee"
        />
      </TableCell>
      <TableCell>
        <BillTypeCombobox
          value={editData.billTypeId}
          onValueChange={(value) => onEditDataChange({ billTypeId: value })}
          placeholder="Select bill type..."
        />
      </TableCell>
      <TableCell>
        <ProjectCombobox
          value={editData.projectId || undefined}
          onValueChange={(value) => onEditDataChange({ projectId: value })}
          placeholder="Select project..."
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="1"
          max="100"
          value={editData.engagementPercentage}
          onChange={(e) => onEditDataChange({ engagementPercentage: Number(e.target.value) })}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          max="100"
          value={editData.billingPercentage}
          onChange={(e) => onEditDataChange({ billingPercentage: Number(e.target.value) })}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <DatePicker
          value={editData.engagementStartDate}
          onChange={(value) => onEditDataChange({ engagementStartDate: value })}
          placeholder="Select start date"
        />
      </TableCell>
      <TableCell>
        <DatePicker
          value={editData.releaseDate}
          onChange={(value) => onEditDataChange({ releaseDate: value })}
          placeholder="Select release date"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
