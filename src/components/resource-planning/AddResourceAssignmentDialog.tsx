
import React, { useState } from 'react';
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

interface AddResourceAssignmentDialogProps {
  onSuccess?: () => void;
}

export const AddResourceAssignmentDialog: React.FC<AddResourceAssignmentDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedResourceTypeId, setSelectedResourceTypeId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [engagementPercentage, setEngagementPercentage] = useState<string>('');
  const [releaseDate, setReleaseDate] = useState<Date>();

  const { createResourcePlanning, isCreating } = useResourcePlanning();

  // Fetch profiles for the dropdown
  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-resource-planning'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          general_information(first_name, last_name, current_designation)
        `)
        .order('employee_id');
      
      if (error) throw error;
      return data;
    },
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfileId || !engagementPercentage) {
      return;
    }

    const percentage = parseInt(engagementPercentage);
    if (percentage < 1 || percentage > 100) {
      return;
    }

    createResourcePlanning({
      profile_id: selectedProfileId,
      resource_type_id: selectedResourceTypeId || undefined,
      project_id: selectedProjectId || undefined,
      engagement_percentage: percentage,
      release_date: releaseDate ? format(releaseDate, 'yyyy-MM-dd') : undefined,
    });

    // Reset form
    setSelectedProfileId('');
    setSelectedResourceTypeId('');
    setSelectedProjectId('');
    setEngagementPercentage('');
    setReleaseDate(undefined);
    setOpen(false);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Resource Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.employee_id} - {' '}
                    {profile.general_information?.[0]?.first_name || profile.first_name}{' '}
                    {profile.general_information?.[0]?.last_name || profile.last_name}
                    {profile.general_information?.[0]?.current_designation && (
                      <span className="text-muted-foreground ml-2">
                        ({profile.general_information[0].current_designation})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !selectedProfileId || !engagementPercentage}
            >
              {isCreating ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
