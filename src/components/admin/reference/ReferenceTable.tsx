import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { DesignationCombobox } from '@/components/admin/designation/DesignationCombobox';
import { ReferenceItem, ReferenceFormData } from '@/hooks/settings/use-reference-settings';

interface ReferenceTableProps {
  references: ReferenceItem[];
  editingId: string | null;
  editItem: ReferenceFormData;
  onEdit: (id: string, reference: ReferenceItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditItemChange: (field: keyof ReferenceFormData, value: string) => void;
  onDelete: (id: string, name: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  isLoading: boolean;
}

const ReferenceTable: React.FC<ReferenceTableProps> = ({
  references,
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
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {references.map((item) => (
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
                {editingId === item.id ? (
                  <Input
                    type="email"
                    value={editItem.email}
                    onChange={(e) => onEditItemChange('email', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <span>{item.email}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <DesignationCombobox
                    value={editItem.designation}
                    onValueChange={(value) => onEditItemChange('designation', value)}
                    placeholder="Select designation"
                  />
                ) : (
                  <span>{item.designation}</span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={editItem.company}
                    onChange={(e) => onEditItemChange('company', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <span>{item.company}</span>
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
                        onClick={() => onEdit(item.id, item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(item.id, item.name)}
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

      {references.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No references found.
        </div>
      )}
    </>
  );
};

export default ReferenceTable;
