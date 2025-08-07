
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResourcePlanningOperations } from '@/hooks/use-resource-planning-operations';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EditResourcePlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onSuccess: () => void;
}

export const EditResourcePlanningDialog: React.FC<EditResourcePlanningDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    profileId: '',
    projectId: '',
    billTypeId: '',
    engagementPercentage: 100,
    billingPercentage: 100,
    engagementStartDate: '',
    releaseDate: '',
  });

  const { updateResourcePlanning, isUpdating } = useResourcePlanningOperations();
  const { toast } = useToast();

  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects_management')
        .select('id, project_name')
        .order('project_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch bill types for dropdown
  const { data: billTypes } = useQuery({
    queryKey: ['bill-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bill_types')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        profileId: item.profile_id || '',
        projectId: item.project?.id || '',
        billTypeId: item.bill_type?.id || '',
        engagementPercentage: item.engagement_percentage || 100,
        billingPercentage: item.billing_percentage || 100,
        engagementStartDate: item.engagement_start_date?.split('T')[0] || '',
        releaseDate: item.release_date?.split('T')[0] || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item?.id) return;

    const updateData = {
      project_id: formData.projectId || undefined,
      bill_type_id: formData.billTypeId || undefined,
      engagement_percentage: formData.engagementPercentage,
      billing_percentage: formData.billingPercentage,
      engagement_start_date: formData.engagementStartDate || undefined,
      release_date: formData.releaseDate || undefined,
    };

    updateResourcePlanning(
      { id: item.id, updates: updateData },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Resource assignment updated successfully',
          });
          onSuccess();
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update resource assignment',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Resource Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Profile</Label>
            <Input
              value={`${item?.profile?.employee_id || ''} - ${item?.profile?.first_name || ''} ${item?.profile?.last_name || ''}`}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="project">Project</Label>
            <Select 
              value={formData.projectId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Project</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="billType">Bill Type</Label>
            <Select 
              value={formData.billTypeId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, billTypeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bill type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Bill Type</SelectItem>
                {billTypes?.map((billType) => (
                  <SelectItem key={billType.id} value={billType.id}>
                    {billType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engagementPercentage">Engagement %</Label>
              <Input
                id="engagementPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.engagementPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, engagementPercentage: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="billingPercentage">Billing %</Label>
              <Input
                id="billingPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.billingPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, billingPercentage: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engagementStartDate">Start Date</Label>
              <Input
                id="engagementStartDate"
                type="date"
                value={formData.engagementStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, engagementStartDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
