
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import BillTypeCombobox from './BillTypeCombobox';
import ProjectSearchCombobox from './ProjectSearchCombobox';
import DatePicker from '@/components/admin/user/DatePicker';

interface ResourceAssignmentFormProps {
  profileId: string | null;
  setProfileId: (value: string | null) => void;
  billTypeId: string | null;
  setBillTypeId: (value: string | null) => void;
  projectId: string | null;
  setProjectId: (value: string | null) => void;
  engagementPercentage: number;
  setEngagementPercentage: (value: number) => void;
  billingPercentage: number;
  setBillingPercentage: (value: number) => void;
  releaseDate: string;
  setReleaseDate: (value: string) => void;
  engagementStartDate: string;
  setEngagementStartDate: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ResourceAssignmentForm: React.FC<ResourceAssignmentFormProps> = ({
  profileId,
  setProfileId,
  billTypeId,
  setBillTypeId,
  projectId,
  setProjectId,
  engagementPercentage,
  setEngagementPercentage,
  billingPercentage,
  setBillingPercentage,
  releaseDate,
  setReleaseDate,
  engagementStartDate,
  setEngagementStartDate,
  onSubmit,
  isLoading,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile" className="text-sm font-medium">Employee *</Label>
          <ProfileCombobox
            value={profileId}
            onValueChange={setProfileId}
            placeholder="Select employee..."
            label="Employee"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="engagement" className="text-sm font-medium">Engagement % *</Label>
          <Input
            id="engagement"
            type="number"
            min="1"
            max="100"
            value={engagementPercentage}
            onChange={(e) => setEngagementPercentage(Number(e.target.value))}
            placeholder="100"
            required
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing" className="text-sm font-medium">Billing %</Label>
          <Input
            id="billing"
            type="number"
            min="0"
            max="100"
            value={billingPercentage}
            onChange={(e) => setBillingPercentage(Number(e.target.value))}
            placeholder="0"
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billType" className="text-sm font-medium">Bill Type</Label>
          <BillTypeCombobox
            value={billTypeId}
            onValueChange={setBillTypeId}
            placeholder="Select bill type..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project" className="text-sm font-medium">Project</Label>
          <ProjectSearchCombobox
            value={projectId}
            onValueChange={setProjectId}
            placeholder="Select project..."
          />
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="forecastedProject" className="text-sm font-medium">Forecasted Project</Label>
          <Input
            id="forecastedProject"
            type="text"
            value={forecastedProject}
            onChange={(e) => setForecastedProject(e.target.value)}
            placeholder="Enter forecasted project..."
            className="h-9"
          />
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
          <DatePicker
            value={engagementStartDate}
            onChange={setEngagementStartDate}
            placeholder="Select start date"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="releaseDate" className="text-sm font-medium">Release Date</Label>
          <DatePicker
            value={releaseDate}
            onChange={setReleaseDate}
            placeholder="Select release date"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-4">
        <Button type="submit" disabled={isLoading || !profileId} className="w-full h-9">
          {isLoading ? 'Creating...' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
};
