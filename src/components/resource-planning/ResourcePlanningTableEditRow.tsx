
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BillTypeCombobox from './BillTypeCombobox';
import { ProjectCombobox } from '@/components/projects/ProjectCombobox';
import CompactDatePicker from './CompactDatePicker';
import { Check, X } from 'lucide-react';

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
      <TableCell className="py-1 px-2">
        {/* Static employee display */}
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
        <div className="w-full max-w-[110px]">
          <BillTypeCombobox
            value={editData.billTypeId}
            onValueChange={(value) => onEditDataChange({ billTypeId: value })}
            placeholder="Select..."
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[120px]">
          <ProjectCombobox
            value={editData.projectId || undefined}
            onValueChange={(value) => onEditDataChange({ projectId: value })}
            placeholder="Select..."
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2 w-20">
        <Input
          type="number"
          min="1"
          max="100"
          value={editData.engagementPercentage}
          onChange={(e) => onEditDataChange({ engagementPercentage: Number(e.target.value) })}
          className="w-14 h-7 text-xs px-1"
        />
      </TableCell>
      <TableCell className="py-1 px-2 w-20">
        <Input
          type="number"
          min="0"
          max="100"
          value={editData.billingPercentage}
          onChange={(e) => onEditDataChange({ billingPercentage: Number(e.target.value) })}
          className="w-14 h-7 text-xs px-1"
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[100px]">
          <CompactDatePicker
            value={editData.engagementStartDate}
            onChange={(value) => onEditDataChange({ engagementStartDate: value })}
            placeholder="dd-mm-yyyy"
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[100px]">
          <CompactDatePicker
            value={editData.releaseDate}
            onChange={(value) => onEditDataChange({ releaseDate: value })}
            placeholder="dd-mm-yyyy"
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
