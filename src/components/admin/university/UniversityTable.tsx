
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Pencil } from 'lucide-react';
import { UniversityItem } from '@/hooks/use-university-settings';
import UniversityEditForm from './UniversityEditForm';

interface UniversityTableProps {
  items: UniversityItem[];
  editingId: string | null;
  onEdit: (item: UniversityItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, data: any) => void;
  onDelete: (id: string, name: string) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

const getTypeDisplayStyles = (type: string) => {
  switch (type) {
    case 'Public':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Private':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'International':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Special':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const UniversityTable: React.FC<UniversityTableProps> = ({
  items,
  editingId,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  isUpdating,
  isRemoving
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No universities found. Click "Add University" to add the first one.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Acronyms</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            {editingId === item.id ? (
              <TableCell colSpan={5}>
                <UniversityEditForm
                  item={item}
                  onSave={onSaveEdit}
                  onCancel={onCancelEdit}
                  isUpdating={isUpdating}
                />
              </TableCell>
            ) : (
              <>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeDisplayStyles(item.type)}`}>
                    {item.type}
                  </span>
                </TableCell>
                <TableCell>{item.acronyms || '-'}</TableCell>
                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDelete(item.id, item.name)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UniversityTable;
