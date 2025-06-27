
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoteFormData } from './types';
import { AlertCircle, AlertTriangle, Info, CheckCircle, HelpCircle, Zap, Star, Heart, Bell } from 'lucide-react';

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
          onChange={(e) => onChange({ ...formData, content: e.target.value })}
          placeholder="Enter note content"
          rows={4}
        />
      </div>
    </div>
  );
};

export default NoteEditForm;
