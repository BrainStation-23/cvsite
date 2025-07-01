
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useResourcePlanning } from '@/hooks/use-resource-planning';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeCombobox } from '@/components/admin/cv-templates/EmployeeCombobox';

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

interface EditResourceAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: ResourcePlanningData | null;
}

export const EditResourceAssignmentDialog: React.FC<EditResourceAssignmentDialogProps> = ({
  isOpen,
  onOpenChange,
  item
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedResourceTypeId, setSelectedResourceTypeId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [engagementPercentage, setEngagementPercentage] = useState<string>('');
  const [releaseDate, setReleaseDate] = useState<Date>();

  const { updateResourcePlanning, isUpdating } = useResourcePlanning();

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

  // Fetch projects for the dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects_management')
        .select('id, project_name, client_name')
        .order('project_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item && isOpen) {
      setSelectedProfileId(item.profile_id);
      setSelectedResourceTypeId(item.resource_type?.id || '');
      setSelectedProjectId(item.project?.id || '');
      setEngagementPercentage(item.engagement_percentage.toString());
      setReleaseDate(item.release_date ? new Date(item.release_date) : undefined);
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !selectedProfileId || !engagementPercentage) {
      return;
    }

    const percentage = parseInt(engagementPercentage);
    if (percentage < 1 || percentage > 100) {
      return;
    }

    updateResourcePlanning({
      id: item.id,
      updates: {
        resource_type_id: selectedResourceTypeId || undefined,
        project_id: selectedProjectId || undefined,
        engagement_percentage: percentage,
        release_date: releaseDate ? format(releaseDate, 'yyyy-MM-dd') : undefined,
      }
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Resource Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <EmployeeCombobox
              value={selectedProfileId}
              onValueChange={setSelectedProfileId}
              placeholder="Select an employee"
              disabled={true} // Employee cannot be changed in edit mode
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
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name}
                    {project.client_name && (
                      <span className="text-muted-foreground ml-2">
                        - {project.client_name}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !selectedProfileId || !engagementPercentage}
            >
              {isUpdating ? 'Updating...' : 'Update Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
