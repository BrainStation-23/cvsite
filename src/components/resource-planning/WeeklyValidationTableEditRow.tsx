
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BillTypeCombobox from './BillTypeCombobox';
import { ProjectCombobox } from '@/components/projects/ProjectCombobox';
import DatePicker from '@/components/admin/user/DatePicker';
import { Check, X } from 'lucide-react';

interface WeeklyValidationData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  release_date: string;
  engagement_start_date: string;
  engagement_complete: boolean;
  weekly_validation: boolean;
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

interface WeeklyValidationTableEditRowProps {
  item: WeeklyValidationData;
  editData: EditFormData;
  onEditDataChange: (data: Partial<EditFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const WeeklyValidationTableEditRow: React.FC<WeeklyValidationTableEditRowProps> = ({
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
        {/* Static employee display - matching the regular row format */}
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
        <div className="w-full max-w-[120px]">
          <BillTypeCombobox
            value={editData.billTypeId}
            onValueChange={(value) => onEditDataChange({ billTypeId: value })}
            placeholder="Select..."
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[140px]">
          <ProjectCombobox
            value={editData.projectId || undefined}
            onValueChange={(value) => onEditDataChange({ projectId: value })}
            placeholder="Select..."
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <Input
          type="number"
          min="1"
          max="100"
          value={editData.engagementPercentage}
          onChange={(e) => onEditDataChange({ engagementPercentage: Number(e.target.value) })}
          className="w-16 h-7 text-xs"
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <Input
          type="number"
          min="0"
          max="100"
          value={editData.billingPercentage}
          onChange={(e) => onEditDataChange({ billingPercentage: Number(e.target.value) })}
          className="w-16 h-7 text-xs"
        />
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[130px]">
          <DatePicker
            value={editData.engagementStartDate}
            onChange={(value) => onEditDataChange({ engagementStartDate: value })}
            placeholder="Start date"
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[130px]">
          <DatePicker
            value={editData.releaseDate}
            onChange={(value) => onEditDataChange({ releaseDate: value })}
            placeholder="Release date"
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
