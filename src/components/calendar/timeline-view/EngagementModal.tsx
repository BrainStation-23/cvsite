
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';
import BillTypeCombobox from '@/components/resource-planning/BillTypeCombobox';
import { format, startOfMonth, endOfMonth } from 'date-fns';

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
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [formData, setFormData] = useState<EngagementData>({
    profileId: preselectedResourceId || '',
    engagementPercentage: 0, // Hidden, set to 0
    billingPercentage: 0, // Hidden, set to 0
    engagementStartDate: '',
    forecastedProject: '',
    ...initialData,
  });

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

  useEffect(() => {
    if (isOpen) {
      // Set default values when modal opens
      const defaultMonth = preselectedStartDate ? preselectedStartDate.getMonth() + 1 : currentMonth;
      const defaultYear = preselectedStartDate ? preselectedStartDate.getFullYear() : currentYear;
      
      setSelectedMonth(defaultMonth);
      setSelectedYear(defaultYear);
      setFormData({
        profileId: preselectedResourceId || '',
        engagementPercentage: 0,
        billingPercentage: 0,
        engagementStartDate: '',
        forecastedProject: '',
        ...initialData,
      });
    }
  }, [isOpen, initialData, preselectedResourceId, preselectedStartDate, currentMonth, currentYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate start and end dates based on selected month/year
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
    
    const submissionData: EngagementData = {
      ...formData,
      engagementStartDate: format(startDate, 'yyyy-MM-dd'),
      releaseDate: format(endDate, 'yyyy-MM-dd'),
      engagementPercentage: 0, // Set to 0 as per requirements
      billingPercentage: 0, // Set to 0 as per requirements
    };
    
    onSave(submissionData);
  };

  const handleClose = () => {
    onClose();
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setFormData({
      profileId: '',
      engagementPercentage: 0,
      billingPercentage: 0,
      engagementStartDate: '',
      forecastedProject: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Forecasted Assignment' : 'Edit Forecasted Assignment'}
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

          <div className="space-y-2">
            <Label htmlFor="billType">Bill Type</Label>
            <BillTypeCombobox
              value={formData.billTypeId || null}
              onValueChange={(value) => setFormData(prev => ({ ...prev, billTypeId: value || undefined }))}
              placeholder="Select bill type..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecastedProject">Forecasted Project *</Label>
            <Input
              value={formData.forecastedProject || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, forecastedProject: e.target.value }))}
              placeholder="Enter forecasted project name..."
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.profileId || !formData.forecastedProject || !selectedMonth || !selectedYear}
            >
              {mode === 'create' ? 'Create' : 'Update'} Assignment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
