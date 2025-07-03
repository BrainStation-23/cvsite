
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { usePlatformSettings, SettingItem } from '@/hooks/use-platform-settings';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';

export const ProjectTypeTable: React.FC = () => {
  const { items, isLoading, addItem, updateItem, removeItem, isAddingItem, isUpdatingItem, isRemovingItem } = usePlatformSettings('project_types');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleEdit = (item: SettingItem) => {
    setEditingId(item.id);
    setEditValue(item.name);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editingId) {
      const originalItem = items?.find(item => item.id === editingId);
      if (originalItem) {
        updateItem(editingId, editValue.trim(), originalItem.name);
        setEditingId(null);
        setEditValue('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (item: SettingItem) => {
    showConfirmation({
      title: 'Delete Project Type',
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => removeItem(item.id, item.name)
    });
  };

  const handleAddNew = () => {
    if (newItemValue.trim()) {
      addItem(newItemValue);
      setNewItemValue('');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add new project type */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter new project type..."
          value={newItemValue}
          onChange={(e) => setNewItemValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
          className="flex-1"
        />
        <Button 
          onClick={handleAddNew}
          disabled={!newItemValue.trim() || isAddingItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isAddingItem ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {/* Project types table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No project types found. Add one above to get started.
                </TableCell>
              </TableRow>
            ) : (
              items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          onClick={handleSaveEdit}
                          disabled={isUpdatingItem || !editValue.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          disabled={isUpdatingItem}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                        disabled={editingId === item.id || isUpdatingItem}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                        disabled={isRemovingItem || editingId === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      {config && (
        <ConfirmationDialog
          isOpen={isOpen}
          onClose={hideConfirmation}
          onConfirm={handleConfirm}
          title={config.title}
          description={config.description}
          confirmText={config.confirmText}
          cancelText={config.cancelText}
          variant={config.variant}
        />
      )}
    </div>
  );
};
