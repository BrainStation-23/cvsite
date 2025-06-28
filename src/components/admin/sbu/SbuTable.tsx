
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { SbuItem, SbuFormData } from '@/hooks/use-sbu-settings';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';

interface SbuTableProps {
  sbus: SbuItem[];
  editingId: string | null;
  editItem: SbuFormData;
  onEdit: (id: string, sbu: SbuItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditItemChange: (field: keyof SbuFormData, value: string) => void;
  onDelete: (id: string, name: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  isLoading: boolean;
}

const SbuTable: React.FC<SbuTableProps> = ({
  sbus,
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

  const handleDelete = (item: SbuItem) => {
    showConfirmation({
      title: 'Delete SBU',
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => onDelete(item.id, item.name)
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading SBUs...</div>;
  }

  if (!sbus || sbus.length === 0) {
    return <div className="text-center py-8 text-gray-500">No SBUs found</div>;
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SBU Name</TableHead>
              <TableHead>SBU Head Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sbus.map((sbu) => (
              <TableRow key={sbu.id}>
                <TableCell>
                  {editingId === sbu.id ? (
                    <Input
                      value={editItem.name}
                      onChange={(e) => onEditItemChange('name', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span className="font-medium">{sbu.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === sbu.id ? (
                    <Input
                      type="email"
                      value={editItem.sbu_head_email}
                      onChange={(e) => onEditItemChange('sbu_head_email', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <span>{sbu.sbu_head_email}</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(sbu.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === sbu.id ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={onSaveEdit}
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancelEdit}
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(sbu.id, sbu)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(sbu)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
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
    </>
  );
};

export default SbuTable;
