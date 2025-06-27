
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddNoteFormProps, NoteFormData } from './types';
import { AlertCircle, AlertTriangle, Info, CheckCircle, HelpCircle, Zap, Star, Heart, Bell } from 'lucide-react';

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

  // Map of icon names to components
  const iconMap = {
    'AlertCircle': AlertCircle,
    'AlertTriangle': AlertTriangle,
    'Info': Info,
    'CheckCircle': CheckCircle,
    'HelpCircle': HelpCircle,
    'Zap': Zap,
    'Star': Star,
    'Heart': Heart,
    'Bell': Bell,
  };

  // Color mapping for categories
  const colorMap = {
    'AlertCircle': 'text-red-500',
    'AlertTriangle': 'text-yellow-500',
    'Info': 'text-blue-500',
    'CheckCircle': 'text-green-500',
    'HelpCircle': 'text-purple-500',
    'Zap': 'text-orange-500',
    'Star': 'text-amber-500',
    'Heart': 'text-pink-500',
    'Bell': 'text-indigo-500',
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    const colorClass = colorMap[iconName as keyof typeof colorMap] || 'text-gray-500';
    return IconComponent ? <IconComponent className={`h-4 w-4 ${colorClass}`} /> : null;
  };

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
                  <div className="flex items-center gap-2">
                    {getIconComponent(category.icon)}
                    <span>{category.name}</span>
                  </div>
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
