
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { SbuFormData } from '@/hooks/use-sbu-settings';

interface SbuAddFormProps {
  onSubmit: (formData: SbuFormData) => void;
  isLoading: boolean;
}

const SbuAddForm: React.FC<SbuAddFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SbuFormData>({
    name: '',
    sbu_head_email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.sbu_head_email.trim()) {
      onSubmit(formData);
      setFormData({ name: '', sbu_head_email: '' });
    }
  };

  const handleChange = (field: keyof SbuFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div>
        <Label htmlFor="sbu-name">SBU Name</Label>
        <Input
          id="sbu-name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter SBU name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="sbu-head-email">SBU Head Email</Label>
        <Input
          id="sbu-head-email"
          type="email"
          value={formData.sbu_head_email}
          onChange={(e) => handleChange('sbu_head_email', e.target.value)}
          placeholder="Enter SBU head email"
          required
        />
      </div>
      
      <Button type="submit" disabled={isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Adding...' : 'Add SBU'}
      </Button>
    </form>
  );
};

export default SbuAddForm;
