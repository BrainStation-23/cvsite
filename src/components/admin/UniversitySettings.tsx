
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useUniversitySettings, UniversityFormData } from '@/hooks/use-university-settings';
import UniversityAddForm from './university/UniversityAddForm';
import UniversityTable from './university/UniversityTable';
import UniversityDeleteDialog from './university/UniversityDeleteDialog';

const UniversitySettings: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });
  
  const { 
    items, 
    isLoading, 
    addItem, 
    updateItem, 
    removeItem, 
    isAddingItem, 
    isUpdatingItem, 
    isRemovingItem 
  } = useUniversitySettings();

  const handleStartAddNew = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleSaveNew = async (data: UniversityFormData) => {
    addItem(data);
    setIsAdding(false);
  };

  const handleStartEdit = (item: any) => {
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string, data: UniversityFormData) => {
    updateItem(id, data);
    setEditingId(null);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, id, name });
  };

  const handleDeleteConfirm = () => {
    removeItem(deleteDialog.id, deleteDialog.name);
    setDeleteDialog({ isOpen: false, id: '', name: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, id: '', name: '' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Universities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading universities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Universities</CardTitle>
          {!isAdding && (
            <Button variant="outline" onClick={handleStartAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add University
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <UniversityAddForm
            onSave={handleSaveNew}
            onCancel={handleCancelAdd}
            isAdding={isAddingItem}
          />
        )}
        
        <UniversityTable
          items={items || []}
          editingId={editingId}
          onEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDeleteClick}
          isUpdating={isUpdatingItem}
          isRemoving={isRemovingItem}
        />
        
        <UniversityDeleteDialog
          isOpen={deleteDialog.isOpen}
          universityName={deleteDialog.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </CardContent>
    </Card>
  );
};

export default UniversitySettings;
