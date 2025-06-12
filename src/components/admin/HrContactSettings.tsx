
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHrContactSettings } from '@/hooks/use-hr-contact-settings';
import HrContactAddForm from './hr-contact/HrContactAddForm';
import HrContactTable from './hr-contact/HrContactTable';
import HrContactCSVManager from './hr-contact/HrContactCSVManager';
import { HrContactFormData, HrContactItem } from '@/hooks/use-hr-contact-settings';

const HrContactSettings: React.FC = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<HrContactFormData>({
    name: '',
    email: ''
  });

  const {
    items,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    bulkImport,
    isAddingItem,
    isUpdatingItem,
    isRemovingItem,
    isBulkImporting
  } = useHrContactSettings();

  const handleEdit = (id: string, contact: HrContactItem) => {
    setEditingId(id);
    setEditItem({
      name: contact.name,
      email: contact.email
    });
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateItem(editingId, editItem);
      setEditingId(null);
      setEditItem({
        name: '',
        email: ''
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditItem({
      name: '',
      email: ''
    });
  };

  const handleEditItemChange = (field: keyof HrContactFormData, value: string) => {
    setEditItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      removeItem(id, name);
    }
  };

  const handleValidationResult = (result: any) => {
    if (result.valid && result.valid.length > 0) {
      bulkImport(result.valid);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New HR Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <HrContactAddForm 
            onSubmit={addItem}
            isLoading={isAddingItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage HR Contacts</CardTitle>
          <HrContactCSVManager
            hrContacts={items || []}
            onValidationResult={handleValidationResult}
            isBulkImporting={isBulkImporting}
          />
        </CardHeader>
        <CardContent>
          <HrContactTable
            hrContacts={items || []}
            editingId={editingId}
            editItem={editItem}
            onEdit={handleEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onEditItemChange={handleEditItemChange}
            onDelete={handleDelete}
            isUpdating={isUpdatingItem}
            isRemoving={isRemovingItem}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HrContactSettings;
