
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { useBillTypes, BillTypeItem } from '@/hooks/use-bill-types';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import ResourceTypeCombobox from '@/components/admin/user/ResourceTypeCombobox';

export const BillTypeTable: React.FC = () => {
  const { items, isLoading, addItem, updateItem, removeItem, isAddingItem, isUpdatingItem, isRemovingItem } = useBillTypes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editResourceType, setEditResourceType] = useState<string | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [newIsBillable, setNewIsBillable] = useState(false);
  const [newIsSupport, setNewIsSupport] = useState(false);
  const [newNonBilled, setNewNonBilled] = useState(false);
  const [newResourceType, setNewResourceType] = useState<string | null>(null);
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleEdit = (item: BillTypeItem) => {
    setEditingId(item.id);
    setEditValue(item.name);
    setEditResourceType(item.resource_type || null);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editingId) {
      const originalItem = items?.find(item => item.id === editingId);
      if (originalItem) {
        updateItem(
          editingId, 
          editValue.trim(), 
          originalItem.name, 
          originalItem.is_billable,
          originalItem.is_support,
          originalItem.non_billed,
          editResourceType
        );
        setEditingId(null);
        setEditValue('');
        setEditResourceType(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditResourceType(null);
  };

  const handleDelete = (item: BillTypeItem) => {
    showConfirmation({
      title: 'Delete Bill Type',
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => removeItem(item.id, item.name)
    });
  };

  const handleAddNew = () => {
    if (newItemValue.trim()) {
      addItem({ 
        name: newItemValue.trim(), 
        is_billable: newIsBillable, 
        is_support: newIsSupport, 
        non_billed: newNonBilled,
        resource_type: newResourceType
      });
      setNewItemValue('');
      setNewIsBillable(false);
      setNewIsSupport(false);
      setNewNonBilled(false);
      setNewResourceType(null);
    }
  };

  const handleToggle = (item: BillTypeItem, field: 'is_billable' | 'is_support' | 'non_billed') => {
    const newValue = !item[field];
    updateItem(
      item.id, 
      item.name, 
      item.name, 
      field === 'is_billable' ? newValue : item.is_billable,
      field === 'is_support' ? newValue : item.is_support,
      field === 'non_billed' ? newValue : item.non_billed,
      item.resource_type || null
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add new bill type */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">Add New Bill Type</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Input
              placeholder="Enter bill type name..."
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
            />
            
            <ResourceTypeCombobox
              value={newResourceType}
              onValueChange={setNewResourceType}
              placeholder="Select resource type..."
            />
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Billable</label>
                <Switch
                  checked={newIsBillable}
                  onCheckedChange={setNewIsBillable}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Support</label>
                <Switch
                  checked={newIsSupport}
                  onCheckedChange={setNewIsSupport}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Non-Billed</label>
                <Switch
                  checked={newNonBilled}
                  onCheckedChange={setNewNonBilled}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleAddNew}
              disabled={!newItemValue.trim() || isAddingItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAddingItem ? 'Adding...' : 'Add Bill Type'}
            </Button>
          </div>
        </div>
      </div>

      {/* Bill types table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Resource Type</TableHead>
              <TableHead className="text-center">Properties</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No bill types found. Add one above to get started.
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
                  
                  <TableCell>
                    {editingId === item.id ? (
                      <ResourceTypeCombobox
                        value={editResourceType}
                        onValueChange={setEditResourceType}
                        placeholder="Select resource type..."
                      />
                    ) : (
                      item.resource_type_name ? (
                        <Badge variant="outline" className="text-xs">
                          {item.resource_type_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Not specified</span>
                      )
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Billable</span>
                        <Switch
                          checked={item.is_billable}
                          onCheckedChange={() => handleToggle(item, 'is_billable')}
                          disabled={isUpdatingItem || editingId === item.id}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Support</span>
                        <Switch
                          checked={item.is_support}
                          onCheckedChange={() => handleToggle(item, 'is_support')}
                          disabled={isUpdatingItem || editingId === item.id}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Non-Billed</span>
                        <Switch
                          checked={item.non_billed}
                          onCheckedChange={() => handleToggle(item, 'non_billed')}
                          disabled={isUpdatingItem || editingId === item.id}
                          size="sm"
                        />
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                        disabled={editingId === item.id || isUpdatingItem}
                        title="Edit name and resource type"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                        disabled={isRemovingItem || editingId === item.id}
                        title="Delete bill type"
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
