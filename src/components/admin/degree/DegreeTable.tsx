
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowUpDown, Edit, Check, X } from 'lucide-react';
import { DegreeItem } from '@/utils/degreeCsvUtils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';

interface DegreeTableProps {
  degrees: DegreeItem[];
  onDelete: (id: string, name: string) => void;
  onUpdate: (id: string, name: string, fullForm?: string) => void;
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const DegreeTable: React.FC<DegreeTableProps> = ({
  degrees,
  onDelete,
  onUpdate,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', full_form: '' });

  const handleDelete = (item: DegreeItem) => {
    showConfirmation({
      title: 'Delete Degree',
      description: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: () => onDelete(item.id, item.name)
    });
  };

  const handleEdit = (item: DegreeItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      full_form: item.full_form || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editForm.name.trim()) {
      onUpdate(editingId, editForm.name.trim(), editForm.full_form.trim() || undefined);
      setEditingId(null);
      setEditForm({ name: '', full_form: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', full_form: '' });
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />;
  };

  if (degrees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No degrees found. Add some degrees to get started.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort('name')} className="h-auto p-0 font-medium">
                Name
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort('full_form')} className="h-auto p-0 font-medium">
                Full Form
                {getSortIcon('full_form')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort('created_at')} className="h-auto p-0 font-medium">
                Created
                {getSortIcon('created_at')}
              </Button>
            </TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {degrees.map((degree) => (
            <TableRow key={degree.id}>
              <TableCell className="font-medium">
                {editingId === degree.id ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="h-8"
                    autoFocus
                  />
                ) : (
                  degree.name
                )}
              </TableCell>
              <TableCell>
                {editingId === degree.id ? (
                  <Input
                    value={editForm.full_form}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_form: e.target.value }))}
                    className="h-8"
                    placeholder="Optional"
                  />
                ) : (
                  degree.full_form || '-'
                )}
              </TableCell>
              <TableCell>{new Date(degree.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {editingId === degree.id ? (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isLoading || !editForm.name.trim()}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(degree)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(degree)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
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

export default DegreeTable;
