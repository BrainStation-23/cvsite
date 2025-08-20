
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBillTypes, BillTypeItem } from '@/hooks/use-bill-types';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { BillTypeCard } from './BillTypeCard';
import { AddBillTypeModal } from './AddBillTypeModal';

export const BillTypeCards: React.FC = () => {
  const { items, isLoading, addItem, updateItem, removeItem, isAddingItem, isUpdatingItem, isRemovingItem } = useBillTypes();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleDelete = (item: BillTypeItem) => {
    showConfirmation({
      title: 'Delete Bill Type',
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => removeItem(item.id, item.name)
    });
  };

  const handleAddNew = (value: {
    name: string;
    is_billable: boolean;
    is_support: boolean;
    non_billed: boolean;
    resource_type: string | null;
  }) => {
    addItem(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-muted-foreground">Loading bill types...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Bill Types</h2>
          <p className="text-muted-foreground text-sm">
            {items?.length || 0} bill type{items?.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bill Type
        </Button>
      </div>

      {/* Cards Grid */}
      {items?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            No bill types found
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add your first bill type
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items?.map((item) => (
            <BillTypeCard
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={handleDelete}
              isUpdating={isUpdatingItem}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddBillTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNew}
        isAdding={isAddingItem}
      />

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
