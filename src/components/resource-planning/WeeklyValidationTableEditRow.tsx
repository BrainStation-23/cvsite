
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  forecastedProject: string | null;
}

interface WeeklyValidationTableEditRowProps {
  item: WeeklyValidationData;
  editData: EditFormData;
  onEditDataChange: (data: Partial<EditFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  // Bulk selection props
  showBulkSelection?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export const WeeklyValidationTableEditRow: React.FC<WeeklyValidationTableEditRowProps> = ({
  item,
  editData,
  onEditDataChange,
  onSave,
  onCancel,
  isLoading,
  showBulkSelection = false,
  isSelected = false,
  onSelect,
}) => {
  return (
    <TableRow>
      {showBulkSelection && (
        <TableCell className="py-1 px-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(item.id, !!checked)}
          />
        </TableCell>
      )}
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
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[140px]">
          <Input
            type="text"
            value={editData.forecastedProject || ''}
            onChange={(e) => onEditDataChange({ forecastedProject: e.target.value })}
            placeholder="Enter project..."
            className="h-7 text-xs px-2"
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
        <div className="w-full max-w-[240px]">
          <DatePicker
            value={editData.engagementStartDate}
            onChange={(value) => onEditDataChange({ engagementStartDate: value })}
            placeholder="Select date"
          />
        </div>
      </TableCell>
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[240px]">
          <DatePicker
            value={editData.releaseDate}
            onChange={(value) => onEditDataChange({ releaseDate: value })}
            placeholder="Select date"
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
