
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface DesignationAddFormProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

const DesignationAddForm: React.FC<DesignationAddFormProps> = ({
  onSubmit,
  isLoading
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Designation Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter designation name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>
      
      <Button type="submit" disabled={!name.trim() || isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Adding...' : 'Add Designation'}
      </Button>
    </form>
  );
};

export default DesignationAddForm;
