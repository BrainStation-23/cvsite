
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useBillTypes } from '@/hooks/use-bill-types';
import { BillTypeCard } from './BillTypeCard';
import ResourceTypeCombobox from '@/components/admin/user/ResourceTypeCombobox';
import { ColorPicker } from '@/components/ui/color-picker';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export const BillTypeTable: React.FC = () => {
  const {
    items,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    isAddingItem,
    isUpdatingItem,
    isRemovingItem
  } = useBillTypes();

  const [newItemName, setNewItemName] = useState('');
  const [newItemIsBillable, setNewItemIsBillable] = useState(false);
  const [newItemIsSupport, setNewItemIsSupport] = useState(false);
  const [newItemNonBilled, setNewItemNonBilled] = useState(false);
  const [newItemResourceType, setNewItemResourceType] = useState<string | null>(null);
  const [newItemColorCode, setNewItemColorCode] = useState('#FFFFFF');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; item: any }>({ show: false, item: null });

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addItem({
        name: newItemName.trim(),
        is_billable: newItemIsBillable,
        is_support: newItemIsSupport,
        non_billed: newItemNonBilled,
        resource_type: newItemResourceType,
        color_code: newItemColorCode
      });
      
      // Reset form
      setNewItemName('');
      setNewItemIsBillable(false);
      setNewItemIsSupport(false);
      setNewItemNonBilled(false);
      setNewItemResourceType(null);
      setNewItemColorCode('#FFFFFF');
      setIsAddingNew(false);
    }
  };

  const handleCancelAdd = () => {
    setNewItemName('');
    setNewItemIsBillable(false);
    setNewItemIsSupport(false);
    setNewItemNonBilled(false);
    setNewItemResourceType(null);
    setNewItemColorCode('#FFFFFF');
    setIsAddingNew(false);
  };

  const handleDeleteClick = (item: any) => {
    setConfirmDelete({ show: true, item });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.item) {
      removeItem(confirmDelete.item.id, confirmDelete.item.name);
    }
    setConfirmDelete({ show: false, item: null });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Bill Type Section */}
      <Card>
        <CardContent className="p-6">
          {!isAddingNew ? (
            <Button
              onClick={() => setIsAddingNew(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Bill Type
            </Button>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add New Bill Type</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter bill type name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddItem();
                      if (e.key === 'Escape') handleCancelAdd();
                    }}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Resource Type</label>
                  <ResourceTypeCombobox
                    value={newItemResourceType}
                    onValueChange={setNewItemResourceType}
                    placeholder="Select resource type..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <ColorPicker
                  value={newItemColorCode}
                  onChange={setNewItemColorCode}
                  disabled={isAddingItem}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Billable</span>
                  <Switch
                    checked={newItemIsBillable}
                    onCheckedChange={setNewItemIsBillable}
                    disabled={isAddingItem}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Support</span>
                  <Switch
                    checked={newItemIsSupport}
                    onCheckedChange={setNewItemIsSupport}
                    disabled={isAddingItem}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Non-Billed</span>
                  <Switch
                    checked={newItemNonBilled}
                    onCheckedChange={setNewItemNonBilled}
                    disabled={isAddingItem}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddItem}
                  disabled={isAddingItem || !newItemName.trim()}
                >
                  {isAddingItem ? 'Adding...' : 'Add Bill Type'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelAdd}
                  disabled={isAddingItem}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Types List */}
      <div className="space-y-4">
        {items && items.length > 0 ? (
          items.map((item) => (
            <BillTypeCard
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={handleDeleteClick}
              isUpdating={isUpdatingItem}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No bill types found.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, item: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Bill Type"
        description={`Are you sure you want to delete "${confirmDelete.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isRemovingItem}
      />
    </div>
  );
};
