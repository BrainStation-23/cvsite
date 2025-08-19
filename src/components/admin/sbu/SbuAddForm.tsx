
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { SbuFormData } from '@/hooks/use-sbu-settings';

interface SbuAddFormProps {
  onSubmit: (formData: SbuFormData) => void;
  isLoading: boolean;
}

const SbuAddForm: React.FC<SbuAddFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SbuFormData>({
    name: '',
    sbu_head_email: '',
    sbu_head_name: '',
    is_department: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.sbu_head_email.trim()) {
      onSubmit(formData);
      setFormData({ 
        name: '', 
        sbu_head_email: '', 
        sbu_head_name: '', 
        is_department: false 
      });
    }
  };

  const handleChange = (field: keyof SbuFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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

      <div>
        <Label htmlFor="sbu-head-name">SBU Head Name</Label>
        <Input
          id="sbu-head-name"
          value={formData.sbu_head_name}
          onChange={(e) => handleChange('sbu_head_name', e.target.value)}
          placeholder="Enter SBU head name"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is-department"
          checked={formData.is_department}
          onCheckedChange={(checked) => handleChange('is_department', checked)}
        />
        <Label htmlFor="is-department" className="text-sm">Department</Label>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Adding...' : 'Add SBU'}
      </Button>
    </form>
  );
};

export default SbuAddForm;
