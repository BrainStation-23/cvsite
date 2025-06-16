
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
  const sectionLabels: Record<string, string> = {
    general: 'General',
    technical_skills: 'Technical Skills',
    specialized_skills: 'Specialized Skills',
    experience: 'Experience',
    education: 'Education',
    training: 'Training',
    achievements: 'Achievements',
    projects: 'Projects',
  };

  const fieldTypes = ['text', 'number', 'date', 'boolean', 'array', 'image', 'richtext'];

  // Tabs state for section selection
  const [activeSection, setActiveSection] = useState(sectionTypes[0]);

  // Group configs by section_type
  const groupedConfigs: Record<string, any[]> = sectionTypes.reduce((acc, section) => {
    acc[section] = configs.filter((c) => c.section_type === section);
    return acc;
  }, {} as Record<string, any[]>);

  // Filter within selected section if searching
  const filteredConfigs = (groupedConfigs[activeSection] || []).filter((config) =>
    !searchQuery || config.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Section Tabs */}
      <div className="mt-4">
        <div className="flex gap-2 border-b mb-4 overflow-x-auto">
          {sectionTypes.map((section) => (
            <button
              key={section}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeSection === section ? 'border-cvsite-navy text-cvsite-navy' : 'border-transparent text-gray-500 hover:text-cvsite-navy'
              }`}
              onClick={() => setActiveSection(section)}
            >
              {sectionLabels[section]}
            </button>
          ))}
        </div>

        {/* Add form only for current section */}
        {isAdding && (
          <AddFieldConfigForm
            onAdd={handleAdd}
            onCancel={() => setIsAdding(false)}
            sectionTypes={[activeSection]}
            fieldTypes={fieldTypes}
          />
        )}

        <div className="space-y-2">
          {filteredConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No field configurations found for this section{searchQuery ? ` matching "${searchQuery}"` : ''}
            </div>
          ) : (
            filteredConfigs.map((config) => (
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
    </div>
  );
};

export default FieldDisplayConfigTab;
