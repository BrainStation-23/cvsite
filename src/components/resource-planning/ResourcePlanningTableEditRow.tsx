
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import BillTypeCombobox from './BillTypeCombobox';
import { ProjectCombobox } from '@/components/projects/ProjectCombobox';
import DatePicker from '@/components/admin/user/DatePicker';
import { Check, X } from 'lucide-react';

interface ResourcePlanningData {
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
    project_level?: string;
    project_type_name?: string;
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
  editData: EditFormData | null;
  onEditDataChange: (data: Partial<EditFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  // Bulk selection props
  showBulkSelection?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export const ResourcePlanningTableEditRow: React.FC<ResourcePlanningTableEditRowProps> = ({
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
  // Apply visual styling for validated rows (same as the regular row)
  const rowClassName = `h-10 ${item.weekly_validation ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`;

  return (
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
          </span>
        </div>
      </TableCell>
      
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[150px]">
          <BillTypeCombobox
            value={editData?.billTypeId || null}
            onValueChange={(value) => onEditDataChange({ billTypeId: value })}
            placeholder="Select..."
          />
        </div>
      </TableCell>
      
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[120px]">
          <ProjectCombobox
            value={editData?.projectId || undefined}
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
          value={editData?.engagementPercentage || 0}
          onChange={(e) => onEditDataChange({ engagementPercentage: Number(e.target.value) })}
          className="w-14 h-7 text-xs px-1"
        />
      </TableCell>
      
      <TableCell className="py-1 px-2 w-20">
        <Input
          type="number"
          min="0"
          max="100"
          value={editData?.billingPercentage || 0}
          onChange={(e) => onEditDataChange({ billingPercentage: Number(e.target.value) })}
          className="w-14 h-7 text-xs px-1"
        />
      </TableCell>
      
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[240px]">
          <DatePicker
            value={editData?.engagementStartDate || ''}
            onChange={(value) => onEditDataChange({ engagementStartDate: value })}
            placeholder="Select date"
          />
        </div>
      </TableCell>
      
      <TableCell className="py-1 px-2">
        <div className="w-full max-w-[240px]">
          <DatePicker
            value={editData?.releaseDate || ''}
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
