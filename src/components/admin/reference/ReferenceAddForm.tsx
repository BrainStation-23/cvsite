
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { DesignationCombobox } from '@/components/admin/designation/DesignationCombobox';
import { ReferenceFormData } from '@/hooks/use-reference-settings';

interface ReferenceAddFormProps {
  onSubmit: (formData: ReferenceFormData) => void;
  isLoading: boolean;
}

const ReferenceAddForm: React.FC<ReferenceAddFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<ReferenceFormData>({
    name: '',
    email: '',
    designation: '',
    company: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim() && formData.designation.trim() && formData.company.trim()) {
      onSubmit(formData);
      setFormData({
        name: '',
        email: '',
        designation: '',
        company: ''
      });
    }
  };

  const handleInputChange = (field: keyof ReferenceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.designation.trim() && formData.company.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter reference name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="designation">Designation *</Label>
          <DesignationCombobox
            value={formData.designation}
            onValueChange={(value) => handleInputChange('designation', value)}
            placeholder="Select or enter designation"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            type="text"
            placeholder="Enter company name"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
          />
        </div>
      </div>
      
      <Button type="submit" disabled={!isFormValid || isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Adding...' : 'Add Reference'}
      </Button>
    </form>
  );
};

export default ReferenceAddForm;
