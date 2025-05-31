
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SectionTableMapping {
  id: string;
  section_type: string;
  table_name: string;
  display_name: string;
  description?: string;
}

const SectionTableMappingsTab: React.FC = () => {
  const [mappings, setMappings] = useState<SectionTableMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMapping, setNewMapping] = useState<Partial<SectionTableMapping>>({
    section_type: 'general',
    table_name: '',
    display_name: '',
    description: ''
  });
  const { toast } = useToast();

  const sectionTypes = [
    'general', 'technical_skills', 'specialized_skills', 
    'experience', 'education', 'training', 'achievements', 'projects'
  ];

  const commonTables = [
    'general_information', 'technical_skills', 'specialized_skills',
    'experiences', 'education', 'trainings', 'achievements', 'projects'
  ];

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cv_section_table_mappings')
        .select('*')
        .order('section_type', { ascending: true });

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Error loading section table mappings:', error);
      toast({
        title: "Error",
        description: "Failed to load section table mappings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (mapping: SectionTableMapping) => {
    try {
      const { error } = await supabase
        .from('cv_section_table_mappings')
        .update({
          section_type: mapping.section_type,
          table_name: mapping.table_name,
          display_name: mapping.display_name,
          description: mapping.description
        })
        .eq('id', mapping.id);

      if (error) throw error;

      setEditingId(null);
      toast({
        title: "Success",
        description: "Section table mapping updated successfully"
      });
      loadMappings();
    } catch (error) {
      console.error('Error updating mapping:', error);
      toast({
        title: "Error",
        description: "Failed to update section table mapping",
        variant: "destructive"
      });
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('cv_section_table_mappings')
        .insert([newMapping]);

      if (error) throw error;

      setIsAdding(false);
      setNewMapping({
        section_type: 'general',
        table_name: '',
        display_name: '',
        description: ''
      });
      toast({
        title: "Success",
        description: "Section table mapping added successfully"
      });
      loadMappings();
    } catch (error) {
      console.error('Error adding mapping:', error);
      toast({
        title: "Error",
        description: "Failed to add section table mapping",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section table mapping?')) return;

    try {
      const { error } = await supabase
        .from('cv_section_table_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section table mapping deleted successfully"
      });
      loadMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast({
        title: "Error",
        description: "Failed to delete section table mapping",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading section table mappings...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Section Table Mappings</h3>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Mapping
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Section Table Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Section Type</Label>
                <Select 
                  value={newMapping.section_type} 
                  onValueChange={(value) => setNewMapping({...newMapping, section_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Table Name</Label>
                <Select 
                  value={newMapping.table_name} 
                  onValueChange={(value) => setNewMapping({...newMapping, table_name: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTables.map(table => (
                      <SelectItem key={table} value={table}>{table}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Display Name</Label>
              <Input
                value={newMapping.display_name || ''}
                onChange={(e) => setNewMapping({...newMapping, display_name: e.target.value})}
                placeholder="e.g., General Information"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newMapping.description || ''}
                onChange={(e) => setNewMapping({...newMapping, description: e.target.value})}
                placeholder="Description of this section mapping..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Save</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {mappings.map((mapping) => (
          <SectionMappingItem
            key={mapping.id}
            mapping={mapping}
            isEditing={editingId === mapping.id}
            onEdit={() => setEditingId(mapping.id)}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            onDelete={() => handleDelete(mapping.id)}
            sectionTypes={sectionTypes}
            commonTables={commonTables}
          />
        ))}
      </div>
    </div>
  );
};

interface SectionMappingItemProps {
  mapping: SectionTableMapping;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (mapping: SectionTableMapping) => void;
  onCancel: () => void;
  onDelete: () => void;
  sectionTypes: string[];
  commonTables: string[];
}

const SectionMappingItem: React.FC<SectionMappingItemProps> = ({
  mapping,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  sectionTypes,
  commonTables
}) => {
  const [editedMapping, setEditedMapping] = useState(mapping);

  useEffect(() => {
    setEditedMapping(mapping);
  }, [mapping]);

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Section Type</Label>
              <Select 
                value={editedMapping.section_type} 
                onValueChange={(value) => setEditedMapping({...editedMapping, section_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Table Name</Label>
              <Select 
                value={editedMapping.table_name} 
                onValueChange={(value) => setEditedMapping({...editedMapping, table_name: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commonTables.map(table => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Label>Display Name</Label>
            <Input
              value={editedMapping.display_name}
              onChange={(e) => setEditedMapping({...editedMapping, display_name: e.target.value})}
            />
          </div>
          <div className="mt-4">
            <Label>Description</Label>
            <Textarea
              value={editedMapping.description || ''}
              onChange={(e) => setEditedMapping({...editedMapping, description: e.target.value})}
              rows={2}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={() => onSave(editedMapping)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-4 flex-1">
            <div>
              <span className="font-medium">{mapping.section_type}</span>
              <p className="text-sm text-gray-500">Section Type</p>
            </div>
            <div>
              <span className="text-sm">{mapping.table_name}</span>
              <p className="text-xs text-gray-500">Table Name</p>
            </div>
            <div>
              <span className="text-sm">{mapping.display_name}</span>
              {mapping.description && (
                <p className="text-xs text-gray-500">{mapping.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionTableMappingsTab;
