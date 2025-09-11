
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import BillTypeCombobox from './BillTypeCombobox';
import { ProjectCombobox } from '@/components/projects/ProjectCombobox';
import DatePicker from '@/components/admin/user/DatePicker';
import { Check, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ResourcePlanningData } from './types/resourceplanning';


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
  item: ResourcePlanningData;
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
  // Handle project selection with mutual exclusivity
  const handleProjectChange = (value: string | null) => {
    onEditDataChange({
      projectId: value,
    });
  };

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
            {item.expertise && (
              <Badge variant="secondary" className="text-[10px] px-2 mx-1 py-0 h-4 bg-blue-100 text-blue-600 hover:text-blue-600 hover:bg-blue-100">
                {item.expertise}
              </Badge>
            )}
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
            onValueChange={handleProjectChange}
            placeholder="Select..."
          />
        </div>
      </TableCell>

      <TableCell className="py-1 px-2">
        {item.manager ? (
          <span className="text-xs">{item.manager.first_name}</span>
        ) : (
          <span className="text-muted-foreground text-xs">Not specified</span>
        )}
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
