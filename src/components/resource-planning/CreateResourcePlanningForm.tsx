
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResourcePlanningOperations } from '@/hooks/use-resource-planning-operations';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateResourcePlanningFormProps {
  onSuccess: () => void;
}

export const CreateResourcePlanningForm: React.FC<CreateResourcePlanningFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    profileId: '',
    projectId: '',
    billTypeId: '',
    engagementPercentage: 100,
    billingPercentage: 100,
    engagementStartDate: '',
    releaseDate: '',
  });

  const { createResourcePlanning, isCreating } = useResourcePlanningOperations();
  const { toast } = useToast();

  // Fetch profiles for dropdown
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          general_information(first_name, last_name)
        `)
        .order('employee_id');
      
      if (error) throw error;
      return data;
    },
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.profileId) {
      toast({
        title: 'Error',
        description: 'Please select a profile',
        variant: 'destructive',
      });
      return;
    }

    const resourcePlanningData = {
      profile_id: formData.profileId,
      project_id: formData.projectId || undefined,
      bill_type_id: formData.billTypeId || undefined,
      engagement_percentage: formData.engagementPercentage,
      billing_percentage: formData.billingPercentage,
      engagement_start_date: formData.engagementStartDate || undefined,
      release_date: formData.releaseDate || undefined,
      engagement_complete: false,
      weekly_validation: false,
    };

    createResourcePlanning(resourcePlanningData, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Resource assignment created successfully',
        });
        setFormData({
          profileId: '',
          projectId: '',
          billTypeId: '',
          engagementPercentage: 100,
          billingPercentage: 100,
          engagementStartDate: '',
          releaseDate: '',
        });
        onSuccess();
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create resource assignment',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="profile">Profile *</Label>
        <Select 
          value={formData.profileId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, profileId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select profile" />
          </SelectTrigger>
          <SelectContent>
            {profiles?.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.employee_id} - {profile.general_information?.first_name || profile.first_name} {profile.general_information?.last_name || profile.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <Button type="submit" disabled={isCreating} className="w-full">
        {isCreating ? 'Creating...' : 'Create Assignment'}
      </Button>
    </form>
  );
};
