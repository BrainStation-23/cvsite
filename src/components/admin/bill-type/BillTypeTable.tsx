
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
  const [editIsBillable, setEditIsBillable] = useState(false);
  const [editIsSupport, setEditIsSupport] = useState(false);
  const [editNonBilled, setEditNonBilled] = useState(false);
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
    setEditIsBillable(item.is_billable);
    setEditIsSupport(item.is_support || false);
    setEditNonBilled(item.non_billed || false);
    setEditResourceType(item.resource_type || null);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editingId) {
      const originalItem = items?.find(item => item.id === editingId);
      if (originalItem) {
        updateItem(editingId, editValue.trim(), originalItem.name, editIsBillable, editIsSupport, editNonBilled, editResourceType);
        setEditingId(null);
        setEditValue('');
        setEditIsBillable(false);
        setEditIsSupport(false);
        setEditNonBilled(false);
        setEditResourceType(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditIsBillable(false);
    setEditIsSupport(false);
    setEditNonBilled(false);
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

  const handleToggleBillable = (item: BillTypeItem) => {
    updateItem(item.id, item.name, item.name, !item.is_billable, item.is_support || false, item.non_billed || false, item.resource_type || null);
  };

  const handleToggleSupport = (item: BillTypeItem) => {
    updateItem(item.id, item.name, item.name, item.is_billable, !item.is_support, item.non_billed || false, item.resource_type || null);
  };

  const handleToggleNonBilled = (item: BillTypeItem) => {
    updateItem(item.id, item.name, item.name, item.is_billable, item.is_support || false, !item.non_billed, item.resource_type || null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add new bill type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Input
            placeholder="Enter new bill type..."
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
          />
          
          <div className="w-full">
            <ResourceTypeCombobox
              value={newResourceType}
              onValueChange={setNewResourceType}
              placeholder="Select resource type..."
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={newIsBillable}
                onCheckedChange={setNewIsBillable}
              />
              <label className="text-sm text-gray-600">Billable</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newIsSupport}
                onCheckedChange={setNewIsSupport}
              />
              <label className="text-sm text-gray-600">Support</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newNonBilled}
                onCheckedChange={setNewNonBilled}
              />
              <label className="text-sm text-gray-600">Non-Billed</label>
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

      {/* Bill types table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Resource Type</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead>Support</TableHead>
              <TableHead>Non-Billed</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                    {editingId === item.id ? (
                      <Switch
                        checked={editIsBillable}
                        onCheckedChange={setEditIsBillable}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Switch
                          checked={item.is_billable}
                          onCheckedChange={() => handleToggleBillable(item)}
                          disabled={isUpdatingItem}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Switch
                        checked={editIsSupport}
                        onCheckedChange={setEditIsSupport}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Switch
                          checked={item.is_support || false}
                          onCheckedChange={() => handleToggleSupport(item)}
                          disabled={isUpdatingItem}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Switch
                        checked={editNonBilled}
                        onCheckedChange={setEditNonBilled}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Switch
                          checked={item.non_billed || false}
                          onCheckedChange={() => handleToggleNonBilled(item)}
                          disabled={isUpdatingItem}
                        />
                      </div>
                    )}
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
