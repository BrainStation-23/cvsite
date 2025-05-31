
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFieldDisplayConfig } from '@/hooks/use-field-display-config';
import FieldDisplayConfigItem from './FieldDisplayConfigItem';
import AddFieldConfigForm from './AddFieldConfigForm';
import FieldDisplaySearchControls from './FieldDisplaySearchControls';

const FieldDisplayConfigTab: React.FC = () => {
  const { 
    configs, 
    isLoading, 
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    saveConfig, 
    addConfig, 
    deleteConfig 
  } = useFieldDisplayConfig();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const sectionTypes = [
    'general', 'technical_skills', 'specialized_skills', 
    'experience', 'education', 'training', 'achievements', 'projects'
  ];

  const fieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'image'];

  const handleSave = async (config: any) => {
    const success = await saveConfig(config);
    if (success) {
      setEditingId(null);
    }
  };

  const handleAdd = async (newConfig: any) => {
    const success = await addConfig(newConfig);
    if (success) {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteConfig(id);
  };

  if (isLoading) {
    return <div className="p-4">Loading field display configurations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Field Display Configuration</h3>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field Config
        </Button>
      </div>

      <FieldDisplaySearchControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {isAdding && (
        <AddFieldConfigForm
          onAdd={handleAdd}
          onCancel={() => setIsAdding(false)}
          sectionTypes={sectionTypes}
          fieldTypes={fieldTypes}
        />
      )}

      <div className="space-y-2">
        {configs.length === 0 && searchQuery ? (
          <div className="text-center py-8 text-gray-500">
            No configurations found matching "{searchQuery}"
          </div>
        ) : (
          configs.map((config) => (
            <FieldDisplayConfigItem
              key={config.id}
              config={config}
              isEditing={editingId === config.id}
              onEdit={() => setEditingId(config.id)}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDelete(config.id)}
              sectionTypes={sectionTypes}
              fieldTypes={fieldTypes}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FieldDisplayConfigTab;
