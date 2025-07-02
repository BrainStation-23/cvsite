
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { DesignationItem } from '@/hooks/use-designation-settings';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';

interface DesignationTableProps {
  designations: DesignationItem[];
  editingId: string | null;
  editItem: { name: string };
  onEdit: (id: string, name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditItemChange: (field: 'name', value: string) => void;
  onDelete: (id: string, name: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  isLoading: boolean;
}

const DesignationTable: React.FC<DesignationTableProps> = ({
  designations,
  editingId,
  editItem,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onEditItemChange,
  onDelete,
  isUpdating,
  isRemoving,
  isLoading
}) => {
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();

  const handleDelete = (item: DesignationItem) => {
    showConfirmation({
      title: 'Delete Designation',
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => onDelete(item.id, item.name)
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designations.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editItem.name}
                    onChange={(e) => onEditItemChange('name', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <span className="font-medium">{item.name}</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(item.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {editingId === item.id ? (
                    <>
                      <Button size="sm" onClick={onSaveEdit} disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={onCancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onEdit(item.id, item.name)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {designations.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No designations found.
        </div>
      )}

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
    </>
  );
};

export default DesignationTable;
