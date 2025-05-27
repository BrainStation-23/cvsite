
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DepartmentAddFormProps {
  onAdd: (department: { name: string; full_form?: string }) => void;
  onCancel: () => void;
  isAdding: boolean;
}

const DepartmentAddForm: React.FC<DepartmentAddFormProps> = ({
  onAdd,
  onCancel,
  isAdding
}) => {
  const [newItem, setNewItem] = useState({ name: '', full_form: '' });

  const handleAdd = () => {
    if (newItem.name.trim()) {
      onAdd({ name: newItem.name.trim(), full_form: newItem.full_form.trim() || undefined });
      setNewItem({ name: '', full_form: '' });
    }
  };

  return (
    <div className="mb-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-name">Name *</Label>
          <Input
            id="new-name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Department name"
          />
        </div>
        <div>
          <Label htmlFor="new-full-form">Full Form</Label>
          <Input
            id="new-full-form"
            value={newItem.full_form}
            onChange={(e) => setNewItem({ ...newItem, full_form: e.target.value })}
            placeholder="Full department name"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={handleAdd} 
          disabled={!newItem.name.trim() || isAdding}
        >
          {isAdding ? 'Adding...' : 'Add Department'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DepartmentAddForm;
