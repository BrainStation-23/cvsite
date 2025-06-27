
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Edit, Trash2, Check, X, AlertCircle, AlertTriangle, Info, CheckCircle, HelpCircle, Zap, Star, Heart, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NoteCardProps, NoteFormData } from './types';
import NoteEditForm from './NoteEditForm';

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  categories,
  isUpdatingNote,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<NoteFormData>({
    title: note.title,
    content: note.content || '',
    category_id: note.category_id || ''
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
    'AlertCircle': 'text-red-500 bg-red-50 border-red-200',
    'AlertTriangle': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'Info': 'text-blue-500 bg-blue-50 border-blue-200',
    'CheckCircle': 'text-green-500 bg-green-50 border-green-200',
    'HelpCircle': 'text-purple-500 bg-purple-50 border-purple-200',
    'Zap': 'text-orange-500 bg-orange-50 border-orange-200',
    'Star': 'text-amber-500 bg-amber-50 border-amber-200',
    'Heart': 'text-pink-500 bg-pink-50 border-pink-200',
    'Bell': 'text-indigo-500 bg-indigo-50 border-indigo-200',
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    const colorClass = colorMap[iconName as keyof typeof colorMap]?.split(' ')[0] || 'text-gray-500';
    return IconComponent ? <IconComponent className={`h-3 w-3 ${colorClass}`} /> : null;
  };

  const getCategoryColors = (iconName?: string) => {
    return colorMap[iconName as keyof typeof colorMap] || 'text-gray-500 bg-gray-50 border-gray-200';
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditForm({
      title: note.title,
      content: note.content || '',
      category_id: note.category_id || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) return;

    await onEdit(note.id, {
      title: editForm.title,
      content: editForm.content,
      category_id: editForm.category_id || undefined
    });

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: note.title,
      content: note.content || '',
      category_id: note.category_id || ''
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await onDelete(note.id);
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <NoteEditForm
                formData={editForm}
                categories={categories}
                onChange={setEditForm}
              />
            ) : (
              <>
                <CardTitle className="text-base truncate">
                  {note.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  {note.category && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColors(note.category.icon)}`}
                    >
                      <div className="flex items-center gap-1">
                        {getIconComponent(note.category.icon)}
                        <span>{note.category.name}</span>
                      </div>
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editForm.title.trim() || isUpdatingNote}
                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      {(note.content || isEditing) && !isEditing && (
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {note.content}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default NoteCard;
