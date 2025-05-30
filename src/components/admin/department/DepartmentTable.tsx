
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { DepartmentItem } from '@/hooks/use-department-settings';

interface DepartmentTableProps {
  departments: DepartmentItem[];
  editingId: string | null;
  editItem: { name: string; full_form: string };
  onEdit: (id: string, name: string, full_form: string | null) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditItemChange: (field: 'name' | 'full_form', value: string) => void;
  onDelete: (id: string, name: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  isLoading: boolean;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
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
            <TableHead>Full Form</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((item) => (
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
                    value={editItem.full_form}
                    onChange={(e) => onEditItemChange('full_form', e.target.value)}
                    className="w-full"
                    placeholder="Full form"
                  />
                ) : (
                  <span className="text-gray-600">{item.full_form || '-'}</span>
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
                        onClick={() => onEdit(item.id, item.name, item.full_form)}
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

      {departments.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No departments found.
        </div>
      )}
    </>
  );
};

export default DepartmentTable;
