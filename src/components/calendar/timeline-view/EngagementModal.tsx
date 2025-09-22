import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import BillTypeCombobox from '@/components/resource-planning/BillTypeCombobox';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import ProjectSearchCombobox from '@/components/resource-planning/ProjectSearchCombobox';
import DatePicker from '@/components/admin/user/DatePicker';
import { ResourceCalendarData } from '@/hooks/use-resource-calendar-data';
import { ProjectDetails } from '@/components/resource-planning/ProjectDetails';

interface EngagementFormData {
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
  engagement_start_date: string;
  release_date?: string;
  bill_type_id?: string;
  project_id?: string;
  is_forecasted: boolean;
}

interface EngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EngagementFormData) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  initialData?: ResourceCalendarData | null;
  preselectedResourceId?: string;
  preselectedStartDate?: Date;
  mode: 'create' | 'edit';
  isForecasted?: boolean;
}

export const EngagementModal: React.FC<EngagementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  initialData,
  preselectedResourceId,
  preselectedStartDate,
  mode,
  isForecasted = true,
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [formData, setFormData] = useState<EngagementFormData>({
    profile_id: preselectedResourceId || '',
    engagement_percentage: 0,
    billing_percentage: 0,
    engagement_start_date: '',
    is_forecasted: isForecasted,
    ...initialData,
  });
  const [selectedProjectData, setSelectedProjectData] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Generate month options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Generate year options (current year ± 2 years)
  const years = [];
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    years.push(year);
  }

  // Shallow compare relevant fields for edit-assignment-form
  useEffect(() => {
    if (mode === 'edit' && !isForecasted && initialData) {
      const relevantFields = [
        'engagement_percentage',
        'billing_percentage',
        'bill_type_id',
        'project_id',
        'engagement_start_date',
        'release_date',
      ];
      let dirty = false;
      for (const key of relevantFields) {
        if ((formData?.[key] ?? '') !== (initialData?.[key] ?? '')) {
          dirty = true;
          break;
        }
      }
      setIsDirty(dirty);
    }
  }, [formData, initialData, mode, isForecasted]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening the modal
      const defaultMonth = preselectedStartDate ? preselectedStartDate.getMonth() + 1 : currentMonth;
      const defaultYear = preselectedStartDate ? preselectedStartDate.getFullYear() : currentYear;
      
      setSelectedMonth(defaultMonth);
      setSelectedYear(defaultYear);
      
      // Reset project data when opening the modal
      setSelectedProjectData(null);
      
      setFormData({
        profile_id: preselectedResourceId || initialData?.profile_id || '',
        engagement_percentage: initialData?.engagement_percentage || 0,
        billing_percentage: initialData?.billing_percentage || 0,
        engagement_start_date: initialData?.engagement_start_date || '',
        release_date: initialData?.release_date || '',
        bill_type_id: initialData?.bill_type?.id || '',
        project_id: initialData?.project?.id || '',
        is_forecasted: initialData?.is_forecasted ?? isForecasted,
      });
    }
  }, [isOpen, initialData, preselectedResourceId, preselectedStartDate, currentMonth, currentYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate start and end dates based on selected month/year
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
    
    const submissionData: EngagementFormData = {
      ...formData,
      engagement_start_date: format(startDate, 'yyyy-MM-dd'),
      release_date: format(endDate, 'yyyy-MM-dd'),
      engagement_percentage: formData.engagement_percentage,
      billing_percentage: formData.billing_percentage || 0,
      is_forecasted: mode === 'edit' ? (initialData?.is_forecasted ?? false) : isForecasted,
    };
    
    onSave(submissionData);
  };

  const handleClose = () => {
    onClose();
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setFormData({
      profile_id: '',
      engagement_percentage: 0,
      billing_percentage: 0,
      engagement_start_date: '',
      is_forecasted: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Forecasted Assignment' : 'Edit Assignment'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'edit' && !isForecasted ? (
          <div className="p-4 bg-muted rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-4 edit-assignment-form">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile" className="text-sm font-medium">Employee *</Label>
                  <ProfileCombobox
                    value={formData.profile_id}
                    onValueChange={(value) => setFormData({ ...formData, profile_id: value })}
                    placeholder="Select employee..."
                    label="Employee"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engagement" className="text-sm font-medium">Engagement % *</Label>
                  <Input
                    id="engagement"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.engagement_percentage}
                    onChange={(e) => setFormData({ ...formData, engagement_percentage: Number(e.target.value) })}
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
                    value={formData.billing_percentage}
                    onChange={(e) => setFormData({ ...formData, billing_percentage: Number(e.target.value) })}
                    placeholder="0"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billType" className="text-sm font-medium">Bill Type</Label>
                  <BillTypeCombobox
                    value={formData.bill_type_id}
                    onValueChange={(value) => setFormData({ ...formData, bill_type_id: value })}
                    placeholder="Select bill type..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project" className="text-sm font-medium">Project</Label>
                  <ProjectSearchCombobox
                    value={formData.project_id}
                    onValueChange={(value, projectData) => {
                      setFormData({ ...formData, project_id: value });
                      setSelectedProjectData(projectData);
                    }}
                    placeholder="Select project..."
                  />
                </div>

                {selectedProjectData && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Project Details</Label>
                    <ProjectDetails project={selectedProjectData} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                  <DatePicker
                    value={formData.engagement_start_date}
                    onChange={(date) => setFormData({ ...formData, engagement_start_date: date })}
                    placeholder="Select start date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="releaseDate" className="text-sm font-medium">Release Date</Label>
                  <DatePicker
                    value={formData.release_date}
                    onChange={(date) => setFormData({ ...formData, release_date: date })}
                    placeholder="Select release date"
                  />
                </div>
              </div>

              <div className="flex justify-between space-x-2 pt-4">
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!isDirty}
                  >
                    Update Assignment
                  </Button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Employee *</Label>
            <ProfileCombobox
              value={formData.profile_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, profile_id: value || '' }))}
              placeholder="Select employee..."
              label="Employee"
              disabled={mode === 'edit'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billType">Bill Type</Label>
            <BillTypeCombobox
              value={formData.bill_type_id || null}
              onValueChange={(value) => setFormData(prev => ({ ...prev, bill_type_id: value || undefined }))}
              placeholder="Select bill type..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <ProjectSearchCombobox
              value={formData.project_id}
              onValueChange={(value, projectData) => {
                setFormData(prev => ({ ...prev, project_id: value }));
                setSelectedProjectData(projectData);
              }}
              placeholder="Select project..."
            />
          </div>

          {selectedProjectData && (
            <div className="space-y-2">
              <Label>Project Details</Label>
              <ProjectDetails project={selectedProjectData} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="engagementPercentage">Engagement Percentage *</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.engagement_percentage || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, engagement_percentage: Number(e.target.value) }))}
              placeholder="Enter engagement percentage..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between space-x-2 pt-4">
            <div className="flex space-x-2">
              {mode === 'edit' && isForecasted && onDelete && initialData?.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onDelete(initialData.id);
                    handleClose();
                  }}
                >
                  Delete
                </Button>
              )}
              {mode === 'edit' && onDuplicate && initialData?.id && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    onDuplicate(initialData.id);
                    handleClose();
                  }}
                >
                  Duplicate
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.profile_id || !selectedMonth || !selectedYear || !formData.engagement_percentage}
              >
                {mode === 'create' ? 'Create' : 'Update'} Assignment
              </Button>
            </div>
          </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
