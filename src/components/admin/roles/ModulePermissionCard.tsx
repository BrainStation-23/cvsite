import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SBURestrictionSelector } from './SBURestrictionSelector';
import { Module, SubModule, PermissionType, RolePermission } from '@/types';

interface ModulePermissionCardProps {
  module: Module & { sub_modules: SubModule[] };
  permissionTypes: PermissionType[];
  permissions: Omit<RolePermission, 'id' | 'created_at' | 'updated_at' | 'role_id'>[];
  onPermissionChange: (
    moduleId: string,
    subModuleId: string | undefined,
    permissionTypeId: string,
    granted: boolean,
    sbuRestrictions?: string[]
  ) => void;
  isSBUBound: boolean;
}

export const ModulePermissionCard: React.FC<ModulePermissionCardProps> = ({
  module,
  permissionTypes,
  permissions,
  onPermissionChange,
  isSBUBound,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasPermission = (moduleId: string, subModuleId?: string, permissionTypeId?: string) => {
    return permissions.some(p => 
      p.module_id === moduleId && 
      p.sub_module_id === subModuleId &&
      (!permissionTypeId || p.permission_type_id === permissionTypeId)
    );
  };

  const getPermissionSBUs = (moduleId: string, subModuleId?: string, permissionTypeId?: string) => {
    const permission = permissions.find(p => 
      p.module_id === moduleId && 
      p.sub_module_id === subModuleId &&
      (!permissionTypeId || p.permission_type_id === permissionTypeId)
    );
    return permission?.sbu_restrictions || [];
  };

  const handlePermissionToggle = (
    moduleId: string, 
    subModuleId: string | undefined, 
    permissionTypeId: string, 
    checked: boolean
  ) => {
    const currentSBUs = getPermissionSBUs(moduleId, subModuleId, permissionTypeId);
    onPermissionChange(moduleId, subModuleId, permissionTypeId, checked, currentSBUs);
  };

  const handleSBUChange = (
    moduleId: string, 
    subModuleId: string | undefined, 
    permissionTypeId: string, 
    sbuRestrictions: string[]
  ) => {
    onPermissionChange(moduleId, subModuleId, permissionTypeId, true, sbuRestrictions);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {module.icon && <span className="text-lg">{module.icon}</span>}
                <span>{module.name}</span>
                <Badge variant="outline">{module.sub_modules.length} sub-modules</Badge>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Module-level permissions */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-3">Module-level Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {permissionTypes.map((type) => {
                  const isChecked = hasPermission(module.id, undefined, type.id);
                  const sbuRestrictions = getPermissionSBUs(module.id, undefined, type.id);
                  
                  return (
                    <div key={type.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${module.id}-${type.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handlePermissionToggle(module.id, undefined, type.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`${module.id}-${type.id}`}
                          className="text-sm font-medium capitalize cursor-pointer"
                        >
                          {type.name}
                        </label>
                      </div>
                      {isChecked && isSBUBound && (
                        <SBURestrictionSelector
                          value={sbuRestrictions}
                          onChange={(sbus) => handleSBUChange(module.id, undefined, type.id, sbus)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-module permissions */}
            {module.sub_modules.map((subModule) => (
              <div key={subModule.id} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  {subModule.name}
                  {subModule.table_names && subModule.table_names.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Tables: {subModule.table_names.join(', ')}
                    </Badge>
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {permissionTypes.map((type) => {
                    const isChecked = hasPermission(module.id, subModule.id, type.id);
                    const sbuRestrictions = getPermissionSBUs(module.id, subModule.id, type.id);
                    
                    return (
                      <div key={type.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${module.id}-${subModule.id}-${type.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handlePermissionToggle(module.id, subModule.id, type.id, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={`${module.id}-${subModule.id}-${type.id}`}
                            className="text-sm font-medium capitalize cursor-pointer"
                          >
                            {type.name}
                          </label>
                        </div>
                        {isChecked && isSBUBound && (
                          <SBURestrictionSelector
                            value={sbuRestrictions}
                            onChange={(sbus) => handleSBUChange(module.id, subModule.id, type.id, sbus)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};