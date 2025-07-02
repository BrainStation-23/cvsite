
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeCombobox } from '@/components/admin/cv-templates/EmployeeCombobox';
import { ProjectCombobox } from '@/components/projects/ProjectCombobox';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  release_date: string;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  resource_type: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  };
}

interface ResourceAssignmentDialogProps {
  mode: 'create' | 'edit';
  item?: ResourcePlanningData | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export const ResourceAssignmentDialog: React.FC<ResourceAssignmentDialogProps> = ({
  mode,
  item,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  children
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedResourceTypeId, setSelectedResourceTypeId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [engagementPercentage, setEngagementPercentage] = useState<string>('');
  const [releaseDate, setReleaseDate] = useState<Date>();

  const { createResourcePlanning, updateResourcePlanning, isCreating, isUpdating } = useResourcePlanning();

  // Handle controlled vs uncontrolled open state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  // Fetch resource types for the dropdown
  const { data: resourceTypes } = useQuery({
    queryKey: ['resource-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resource_types')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Reset form when dialog opens or item changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && item) {
        setSelectedProfileId(item.profile_id);
        setSelectedResourceTypeId(item.resource_type?.id || '');
        setSelectedProjectId(item.project?.id || '');
        setEngagementPercentage(item.engagement_percentage.toString());
        setReleaseDate(item.release_date ? new Date(item.release_date) : undefined);
      } else {
        // Reset form for create mode
        setSelectedProfileId('');
        setSelectedResourceTypeId('');
        setSelectedProjectId('');
        setEngagementPercentage('');
        setReleaseDate(undefined);
      }
    }
  }, [isOpen, mode, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfileId || !engagementPercentage) {
      return;
    }

    const percentage = parseInt(engagementPercentage);
    if (percentage < 1 || percentage > 100) {
      return;
    }

    const formData = {
      profile_id: selectedProfileId,
      resource_type_id: selectedResourceTypeId || undefined,
      project_id: selectedProjectId || undefined,
      engagement_percentage: percentage,
      release_date: releaseDate ? format(releaseDate, 'yyyy-MM-dd') : undefined,
    };

    if (mode === 'create') {
      createResourcePlanning(formData);
    } else if (mode === 'edit' && item) {
      updateResourcePlanning({
        id: item.id,
        updates: {
          resource_type_id: selectedResourceTypeId || undefined,
          project_id: selectedProjectId || undefined,
          engagement_percentage: percentage,
          release_date: releaseDate ? format(releaseDate, 'yyyy-MM-dd') : undefined,
        }
      });
    }

    setIsOpen(false);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  const isLoading = isCreating || isUpdating;
  const title = mode === 'create' ? 'Add Resource Assignment' : 'Edit Resource Assignment';
  const submitText = mode === 'create' 
    ? (isCreating ? 'Creating...' : 'Create Assignment')
    : (isUpdating ? 'Updating...' : 'Update Assignment');

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee">Employee *</Label>
          <EmployeeCombobox
            value={selectedProfileId}
            onValueChange={setSelectedProfileId}
            placeholder="Select an employee"
            disabled={isLoading || (mode === 'edit')} // Disable employee selection in edit mode
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resource-type">Resource Type</Label>
          <Select value={selectedResourceTypeId} onValueChange={setSelectedResourceTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a resource type (optional)" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <ProjectCombobox
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            placeholder="Select a project (optional)"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="engagement">Engagement Percentage *</Label>
          <Input
            id="engagement"
            type="number"
            min="1"
            max="100"
            value={engagementPercentage}
            onChange={(e) => setEngagementPercentage(e.target.value)}
            placeholder="Enter percentage (1-100)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Release Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !releaseDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {releaseDate ? format(releaseDate, 'PPP') : 'Pick a date (optional)'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={releaseDate}
                onSelect={setReleaseDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedProfileId || !engagementPercentage}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  // For create mode, wrap in Dialog with trigger
  if (mode === 'create') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource Assignment
            </Button>
          )}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // For edit mode, just return the dialog content (assumes Dialog wrapper is provided)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {dialogContent}
    </Dialog>
  );
};
