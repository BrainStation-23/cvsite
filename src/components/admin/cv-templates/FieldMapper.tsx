
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Edit } from 'lucide-react';

interface FieldMapperProps {
  templateId: string;
}

interface FieldMapping {
  id: string;
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

const FIELD_MAPPINGS: FieldMapping[] = [
  {
    id: '1',
    original_field_name: 'first_name',
    display_name: 'First Name',
    is_masked: false,
    field_order: 1,
    visibility_rules: {},
    section_type: 'general'
  },
  {
    id: '2',
    original_field_name: 'last_name',
    display_name: 'Last Name',
    is_masked: false,
    field_order: 2,
    visibility_rules: {},
    section_type: 'general'
  },
  {
    id: '3',
    original_field_name: 'employee_id',
    display_name: 'Employee ID',
    is_masked: true,
    mask_value: 'EMP-***',
    field_order: 3,
    visibility_rules: {},
    section_type: 'general'
  },
  {
    id: '4',
    original_field_name: 'company_name',
    display_name: 'Organization',
    is_masked: false,
    field_order: 1,
    visibility_rules: {},
    section_type: 'experience'
  },
  {
    id: '5',
    original_field_name: 'designation',
    display_name: 'Position',
    is_masked: false,
    field_order: 2,
    visibility_rules: {},
    section_type: 'experience'
  }
];

const FieldMapper: React.FC<FieldMapperProps> = ({ templateId }) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(FIELD_MAPPINGS);
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateFieldMapping = (id: string, updates: Partial<FieldMapping>) => {
    setFieldMappings(mappings => 
      mappings.map(mapping => 
        mapping.id === id ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const getSectionBadgeColor = (sectionType: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      experience: 'bg-green-100 text-green-800',
      education: 'bg-purple-100 text-purple-800',
      skills: 'bg-orange-100 text-orange-800',
      projects: 'bg-pink-100 text-pink-800'
    };
    return colors[sectionType] || 'bg-gray-100 text-gray-800';
  };

  const groupedMappings = fieldMappings.reduce((acc, mapping) => {
    if (!acc[mapping.section_type]) {
      acc[mapping.section_type] = [];
    }
    acc[mapping.section_type].push(mapping);
    return acc;
  }, {} as Record<string, FieldMapping[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedMappings).map(([sectionType, mappings]) => (
        <Card key={sectionType}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getSectionBadgeColor(sectionType)}>
                {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}
              </Badge>
              Field Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original Field</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Masking</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-mono text-sm">
                      {mapping.original_field_name}
                    </TableCell>
                    <TableCell>
                      {editingField === mapping.id ? (
                        <Input
                          value={mapping.display_name}
                          onChange={(e) => updateFieldMapping(mapping.id, { display_name: e.target.value })}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => setEditingField(mapping.id)} className="cursor-pointer hover:underline">
                          {mapping.display_name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {mapping.is_masked ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm">
                          {mapping.is_masked ? 'Hidden' : 'Visible'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={mapping.is_masked}
                            onCheckedChange={(checked) => updateFieldMapping(mapping.id, { is_masked: checked })}
                          />
                          <Label className="text-sm">Mask field</Label>
                        </div>
                        {mapping.is_masked && (
                          <Input
                            placeholder="Mask pattern (e.g., EMP-***)"
                            value={mapping.mask_value || ''}
                            onChange={(e) => updateFieldMapping(mapping.id, { mask_value: e.target.value })}
                            className="text-sm"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={mapping.field_order}
                        onChange={(e) => updateFieldMapping(mapping.id, { field_order: parseInt(e.target.value) })}
                        className="w-16"
                        min={1}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(mapping.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Conditional Display Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Conditional Display Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Configure when certain fields should be displayed based on conditions.
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Select defaultValue="">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldMappings.map(mapping => (
                      <SelectItem key={mapping.id} value={mapping.id}>
                        {mapping.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select defaultValue="equals">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="empty">Is Empty</SelectItem>
                    <SelectItem value="not_empty">Not Empty</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input placeholder="Value..." className="flex-1" />
                
                <Button variant="outline" size="sm">
                  Add Rule
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Example: Show "Years of Experience" only when "Experience" section is not empty
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Field Mappings</Button>
      </div>
    </div>
  );
};

export default FieldMapper;
