
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { usePlannedResources } from '@/hooks/use-planned-resources';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import BillTypeCombobox from './BillTypeCombobox';
import { ProjectCombobox } from '@/components/projects/ProjectCombobox';
import DatePicker from '@/components/admin/user/DatePicker';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  release_date: string;
  engagement_start_date: string;
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

interface ResourceAssignmentDialogProps {
  mode: 'create' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preselectedProfileId?: string | null;
  item?: ResourcePlanningData;
}

export const ResourceAssignmentDialog: React.FC<ResourceAssignmentDialogProps> = ({
  mode,
  open: controlledOpen,
  onOpenChange,
  preselectedProfileId,
  item,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(preselectedProfileId || item?.profile_id || null);
  const [billTypeId, setBillTypeId] = useState<string | null>(item?.bill_type?.id || null);
  const [projectId, setProjectId] = useState<string | null>(item?.project?.id || null);
  const [engagementPercentage, setEngagementPercentage] = useState<number>(item?.engagement_percentage || 100);
  const [releaseDate, setReleaseDate] = useState<string>(item?.release_date || '');
  const [engagementStartDate, setEngagementStartDate] = useState<string>(item?.engagement_start_date || '');

  const { createResourcePlanning, updateResourcePlanning, isCreating, isUpdating } = usePlannedResources();

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (preselectedProfileId) {
      setProfileId(preselectedProfileId);
    }
  }, [preselectedProfileId]);

  useEffect(() => {
    if (item && mode === 'edit') {
      setProfileId(item.profile_id);
      setBillTypeId(item.bill_type?.id || null);
      setProjectId(item.project?.id || null);
      setEngagementPercentage(item.engagement_percentage);
      setReleaseDate(item.release_date || '');
      setEngagementStartDate(item.engagement_start_date || '');
    }
  }, [item, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileId) {
      return;
    }

    const resourcePlanningData = {
      profile_id: profileId,
      bill_type_id: billTypeId || undefined,
      project_id: projectId || undefined,
      engagement_percentage: engagementPercentage,
      release_date: releaseDate || undefined,
      engagement_start_date: engagementStartDate || undefined,
    };

    if (mode === 'edit' && item) {
      updateResourcePlanning({
        id: item.id,
        updates: resourcePlanningData,
      });
    } else {
      createResourcePlanning(resourcePlanningData);
    }

    // Reset form for create mode
    if (mode === 'create') {
      if (!preselectedProfileId) {
        setProfileId(null);
      }
      setBillTypeId(null);
      setProjectId(null);
      setEngagementPercentage(100);
      setReleaseDate('');
      setEngagementStartDate('');
    }
    
    setOpen(false);
  };

  const DialogComponent = () => (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {mode === 'edit' ? 'Edit Resource Assignment' : 'Create Resource Assignment'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'edit' 
            ? 'Update the resource assignment details.'
            : 'Assign a resource to a project or bill type with engagement details.'
          }
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Employee *</Label>
            <ProfileCombobox
              value={profileId}
              onValueChange={setProfileId}
              placeholder="Select employee..."
              disabled={!!preselectedProfileId || mode === 'edit'}
              label="Employee"
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
              onChange={(e) => setEngagementPercentage(Number(e.target.value))}
              placeholder="100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billType">Bill Type</Label>
            <BillTypeCombobox
              value={billTypeId}
              onValueChange={setBillTypeId}
              placeholder="Select bill type..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <ProjectCombobox
              value={projectId}
              onValueChange={setProjectId}
              placeholder="Select project..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Engagement Start Date</Label>
            <DatePicker
              value={engagementStartDate}
              onChange={setEngagementStartDate}
              placeholder="Select start date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDate">Release Date</Label>
            <DatePicker
              value={releaseDate}
              onChange={setReleaseDate}
              placeholder="Select release date"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={(mode === 'create' ? isCreating : isUpdating) || !profileId}>
            {mode === 'create' 
              ? (isCreating ? 'Creating...' : 'Create Assignment')
              : (isUpdating ? 'Updating...' : 'Update Assignment')
            }
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  if (controlledOpen !== undefined) {
    // Controlled mode - don't render DialogTrigger
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogComponent />
      </Dialog>
    );
  }

  // Uncontrolled mode - render with trigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogComponent />
    </Dialog>
  );
};
