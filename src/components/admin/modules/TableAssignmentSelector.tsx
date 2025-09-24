import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Search, Database } from 'lucide-react';
import { useAvailableTables } from '@/hooks/rbac/useModules';

interface TableAssignmentSelectorProps {
  value: string[];
  onChange: (tables: string[]) => void;
}

export const TableAssignmentSelector: React.FC<TableAssignmentSelectorProps> = ({
  value = [],
  onChange,
}) => {
  const [customTable, setCustomTable] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: availableTables = [], isLoading } = useAvailableTables();

  const filteredTables = availableTables.filter(table =>
    table.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTableToggle = (tableName: string, checked: boolean) => {
    if (checked) {
      onChange([...value, tableName]);
    } else {
      onChange(value.filter(t => t !== tableName));
    }
  };

  const handleAddCustomTable = () => {
    if (customTable.trim() && !value.includes(customTable.trim())) {
      onChange([...value, customTable.trim()]);
      setCustomTable('');
    }
  };

  const handleRemoveTable = (tableName: string) => {
    onChange(value.filter(t => t !== tableName));
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading available tables...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Selected tables */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Tables</h4>
          <div className="flex flex-wrap gap-2">
            {value.map((tableName) => (
              <Badge key={tableName} variant="default" className="px-2 py-1">
                <Database className="h-3 w-3 mr-1" />
                {tableName}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => handleRemoveTable(tableName)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Available Tables</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-48 overflow-y-auto">
          {filteredTables.map((tableName) => (
            <div key={tableName} className="flex items-center space-x-2">
              <Checkbox
                id={`table-${tableName}`}
                checked={value.includes(tableName)}
                onCheckedChange={(checked) => 
                  handleTableToggle(tableName, checked as boolean)
                }
              />
              <label 
                htmlFor={`table-${tableName}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Database className="h-3 w-3" />
                {tableName}
              </label>
            </div>
          ))}
          
          {filteredTables.length === 0 && searchQuery && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tables found matching "{searchQuery}"
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add custom table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Add Custom Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter table name..."
              value={customTable}
              onChange={(e) => setCustomTable(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTable()}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomTable}
              disabled={!customTable.trim() || value.includes(customTable.trim())}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};