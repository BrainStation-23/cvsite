
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddNoteFormProps, NoteFormData } from './types';

const AddNoteForm: React.FC<AddNoteFormProps> = ({
  categories,
  isAddingNote,
  onAdd,
  onCancel,
  profileId
}) => {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    category_id: ''
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;

    await onAdd({
      profile_id: profileId,
      title: formData.title,
      content: formData.content,
      category_id: formData.category_id || undefined
    });

    setFormData({ title: '', content: '', category_id: '' });
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '', category_id: '' });
    onCancel();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add New Note</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter note title"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Enter note content"
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isAddingNote}
          >
            {isAddingNote ? 'Adding...' : 'Add Note'}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddNoteForm;
