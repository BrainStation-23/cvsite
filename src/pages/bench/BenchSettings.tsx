import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import BillTypeCombobox from '@/components/resource-planning/BillTypeCombobox';
import { useBenchBillTypes } from '@/hooks/use-bench-bill-types';

export const BenchSettings: React.FC = () => {
  const [selectedBillType, setSelectedBillType] = useState<string | null>(null);
  const {
    benchBillTypes,
    isLoading,
    addBenchBillType,
    removeBenchBillType,
    isAddingBenchBillType,
    isRemovingBenchBillType,
  } = useBenchBillTypes();

  const handleAddBillType = () => {
    if (selectedBillType) {
      addBenchBillType(selectedBillType);
      setSelectedBillType(null);
    }
  };

  const handleRemoveBillType = (id: string) => {
    removeBenchBillType(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bench Settings</h2>
        <p className="text-muted-foreground">
          Configure bench management settings and notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bench Bill Types</CardTitle>
          <CardDescription>
            Manage bill types that can be used for bench resources. These bill types will be available when managing bench allocations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new bill type */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Add Bill Type
              </label>
              <BillTypeCombobox
                value={selectedBillType}
                onValueChange={setSelectedBillType}
                placeholder="Select a bill type to add..."
                disabled={isAddingBenchBillType}
              />
            </div>
            <Button
              onClick={handleAddBillType}
              disabled={!selectedBillType || isAddingBenchBillType}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Current bench bill types */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Current Bench Bill Types</h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Loading bench bill types...
              </div>
            ) : benchBillTypes.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No bench bill types configured yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {benchBillTypes.map((benchBillType) => (
                  <div
                    key={benchBillType.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      {benchBillType.bill_types && (
                        <>
                          <div
                            className="w-4 h-4 rounded-sm border"
                            style={{ backgroundColor: benchBillType.bill_types.color_code }}
                          />
                          <Badge variant="outline">
                            {benchBillType.bill_types.name}
                          </Badge>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBillType(benchBillType.id)}
                      disabled={isRemovingBenchBillType}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BenchSettings;
