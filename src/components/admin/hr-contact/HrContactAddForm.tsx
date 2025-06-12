
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HrContactFormData } from '@/hooks/use-hr-contact-settings';

interface HrContactAddFormProps {
  onSubmit: (data: HrContactFormData) => void;
  isLoading: boolean;
}

const HrContactAddForm: React.FC<HrContactAddFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<HrContactFormData>({
    name: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    
    onSubmit(formData);
    setFormData({ name: '', email: '' });
  };

  const handleChange = (field: keyof HrContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter contact name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter contact email"
            required
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading || !formData.name.trim() || !formData.email.trim()}
        className="w-full md:w-auto"
      >
        {isLoading ? 'Adding...' : 'Add HR Contact'}
      </Button>
    </form>
  );
};

export default HrContactAddForm;
