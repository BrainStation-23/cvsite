
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { HrContactItem, HrContactFormData } from '@/hooks/use-hr-contact-settings';

interface HrContactTableProps {
  hrContacts: HrContactItem[];
  editingId: string | null;
  editItem: HrContactFormData;
  onEdit: (id: string, contact: HrContactItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditItemChange: (field: keyof HrContactFormData, value: string) => void;
  onDelete: (id: string, name: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  isLoading: boolean;
}

const HrContactTable: React.FC<HrContactTableProps> = ({
  hrContacts,
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
  if (isLoading) {
    return <div className="text-center py-8">Loading HR Contacts...</div>;
  }

  if (!hrContacts || hrContacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No HR contacts found. Add some contacts to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hrContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                {editingId === contact.id ? (
                  <Input
                    value={editItem.name}
                    onChange={(e) => onEditItemChange('name', e.target.value)}
                    className="min-w-[150px]"
                  />
                ) : (
                  contact.name
                )}
              </TableCell>
              <TableCell>
                {editingId === contact.id ? (
                  <Input
                    type="email"
                    value={editItem.email}
                    onChange={(e) => onEditItemChange('email', e.target.value)}
                    className="min-w-[200px]"
                  />
                ) : (
                  contact.email
                )}
              </TableCell>
              <TableCell>
                {new Date(contact.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {editingId === contact.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={onSaveEdit}
                        disabled={isUpdating || !editItem.name.trim() || !editItem.email.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancelEdit}
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(contact.id, contact)}
                        disabled={editingId !== null || isUpdating || isRemoving}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(contact.id, contact.name)}
                        disabled={editingId !== null || isUpdating || isRemoving}
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
    </div>
  );
};

export default HrContactTable;
