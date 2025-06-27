
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoteFormData } from './types';

interface NoteEditFormProps {
  formData: NoteFormData;
  categories: any[];
  onChange: (data: NoteFormData) => void;
}

const NoteEditForm: React.FC<NoteEditFormProps> = ({
  formData,
  categories,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">Title *</label>
        <Input
          value={formData.title}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          placeholder="Enter note title"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Category</label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => onChange({ ...formData, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Content</label>
        <Textarea
          value={formData.content}
          onChange={(e) => onChange({ ...formData, content: e.target.value })}
          placeholder="Enter note content"
          rows={4}
        />
      </div>
    </div>
  );
};

export default NoteEditForm;
