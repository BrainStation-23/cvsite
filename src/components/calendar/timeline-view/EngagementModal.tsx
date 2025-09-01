
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import BillTypeCombobox from '@/components/resource-planning/BillTypeCombobox';
import ProjectSearchCombobox from '@/components/resource-planning/ProjectSearchCombobox';
import DatePicker from '@/components/admin/user/DatePicker';
import { format } from 'date-fns';

interface EngagementData {
  id?: string;
  profileId: string;
  projectId?: string;
  billTypeId?: string;
  forecastedProject?: string;
  engagementPercentage: number;
  billingPercentage?: number;
  engagementStartDate: string;
  releaseDate?: string;
}

interface EngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EngagementData) => void;
  initialData?: EngagementData;
  preselectedResourceId?: string;
  preselectedStartDate?: Date;
  mode: 'create' | 'edit';
}

export const EngagementModal: React.FC<EngagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  preselectedResourceId,
  preselectedStartDate,
  mode,
}) => {
  const [formData, setFormData] = useState<EngagementData>({
    profileId: preselectedResourceId || '',
    engagementPercentage: 100,
    billingPercentage: 0,
    engagementStartDate: preselectedStartDate ? format(preselectedStartDate, 'yyyy-MM-dd') : '',
    ...initialData,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        profileId: preselectedResourceId || '',
        engagementPercentage: 100,
        billingPercentage: 0,
        engagementStartDate: preselectedStartDate ? format(preselectedStartDate, 'yyyy-MM-dd') : '',
        ...initialData,
      });
    }
  }, [isOpen, initialData, preselectedResourceId, preselectedStartDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    onClose();
    setFormData({
      profileId: '',
      engagementPercentage: 100,
      billingPercentage: 0,
      engagementStartDate: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Assignment' : 'Edit Assignment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Employee *</Label>
            <ProfileCombobox
              value={formData.profileId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, profileId: value || '' }))}
              placeholder="Select employee..."
              label="Employee"
              disabled={mode === 'edit'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engagement">Engagement % *</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.engagementPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, engagementPercentage: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing">Billing %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.billingPercentage || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, billingPercentage: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billType">Bill Type</Label>
            <BillTypeCombobox
              value={formData.billTypeId || null}
              onValueChange={(value) => setFormData(prev => ({ ...prev, billTypeId: value || undefined }))}
              placeholder="Select bill type..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <ProjectSearchCombobox
              value={formData.projectId || null}
              onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value || undefined }))}
              placeholder="Select project..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecastedProject">Forecasted Project</Label>
            <Input
              value={formData.forecastedProject || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, forecastedProject: e.target.value }))}
              placeholder="Enter forecasted project..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <DatePicker
                value={formData.engagementStartDate}
                onChange={(value) => setFormData(prev => ({ ...prev, engagementStartDate: value }))}
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <DatePicker
                value={formData.releaseDate || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, releaseDate: value }))}
                placeholder="Select release date"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.profileId || !formData.engagementStartDate}>
              {mode === 'create' ? 'Create' : 'Update'} Assignment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
