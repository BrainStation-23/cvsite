
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { BillTypeItem } from '@/hooks/use-bill-types';
import ResourceTypeCombobox from '@/components/admin/user/ResourceTypeCombobox';

interface BillTypeCardProps {
  item: BillTypeItem;
  onUpdate: (
    id: string,
    name: string,
    originalName: string,
    is_billable: boolean,
    is_support: boolean,
    non_billed: boolean,
    resource_type: string | null
  ) => void;
  onDelete: (item: BillTypeItem) => void;
  isUpdating: boolean;
}

export const BillTypeCard: React.FC<BillTypeCardProps> = ({
  item,
  onUpdate,
  onDelete,
  isUpdating
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editResourceType, setEditResourceType] = useState<string | null>(item.resource_type || null);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(item.name);
    setEditResourceType(item.resource_type || null);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdate(
        item.id,
        editName.trim(),
        item.name,
        item.is_billable,
        item.is_support,
        item.non_billed,
        editResourceType
      );
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(item.name);
    setEditResourceType(item.resource_type || null);
  };

  const handleToggle = (field: 'is_billable' | 'is_support' | 'non_billed') => {
    const newValue = !item[field];
    onUpdate(
      item.id,
      item.name,
      item.name,
      field === 'is_billable' ? newValue : item.is_billable,
      field === 'is_support' ? newValue : item.is_support,
      field === 'non_billed' ? newValue : item.non_billed,
      item.resource_type || null
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="font-semibold text-lg"
                  autoFocus
                />
                <ResourceTypeCombobox
                  value={editResourceType}
                  onValueChange={setEditResourceType}
                  placeholder="Select resource type..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit} disabled={isUpdating || !editName.trim()}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isUpdating}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleStartEdit}
                  className="text-left hover:underline font-semibold text-lg text-foreground mb-1 block"
                  disabled={isUpdating}
                >
                  {item.name}
                </button>
                {item.resource_type_name ? (
                  <Badge variant="outline" className="text-xs">
                    {item.resource_type_name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">No resource type</span>
                )}
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex gap-1 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleStartEdit}
                disabled={isUpdating}
                title="Edit bill type"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item)}
                disabled={isUpdating}
                title="Delete bill type"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Properties */}
        {!isEditing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Billable</span>
              <Switch
                checked={item.is_billable}
                onCheckedChange={() => handleToggle('is_billable')}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Support</span>
              <Switch
                checked={item.is_support}
                onCheckedChange={() => handleToggle('is_support')}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Non-Billed</span>
              <Switch
                checked={item.non_billed}
                onCheckedChange={() => handleToggle('non_billed')}
                disabled={isUpdating}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
