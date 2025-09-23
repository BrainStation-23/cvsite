import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SBURestrictionSelector } from './SBURestrictionSelector';
import { Module, SubModule, PermissionType, RolePermission } from '@/types';

interface PermissionMatrixTableProps {
  modules: (Module & { sub_modules: SubModule[] })[];
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

export const PermissionMatrixTable: React.FC<PermissionMatrixTableProps> = ({
  modules,
  permissionTypes,
  permissions,
  onPermissionChange,
  isSBUBound,
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

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

  // Check module-level permission state (all/some/none of sub-modules have permission)
  const getModulePermissionState = (module: Module & { sub_modules: SubModule[] }, permissionTypeId: string) => {
    const subModulesWithPermission = module.sub_modules.filter(subModule =>
      hasPermission(module.id, subModule.id, permissionTypeId)
    );
    
    if (subModulesWithPermission.length === 0) return 'none';
    if (subModulesWithPermission.length === module.sub_modules.length) return 'all';
    return 'some';
  };

  const handleModulePermissionToggle = (module: Module & { sub_modules: SubModule[] }, permissionTypeId: string, checked: boolean) => {
    // Apply to all sub-modules
    module.sub_modules.forEach(subModule => {
      const currentSBUs = getPermissionSBUs(module.id, subModule.id, permissionTypeId);
      onPermissionChange(module.id, subModule.id, permissionTypeId, checked, currentSBUs);
    });
  };

  const handleSubModulePermissionToggle = (
    moduleId: string,
    subModuleId: string,
    permissionTypeId: string,
    checked: boolean
  ) => {
    const currentSBUs = getPermissionSBUs(moduleId, subModuleId, permissionTypeId);
    onPermissionChange(moduleId, subModuleId, permissionTypeId, checked, currentSBUs);
  };

  const handleSBUChange = (
    moduleId: string,
    subModuleId: string,
    permissionTypeId: string,
    sbuRestrictions: string[]
  ) => {
    onPermissionChange(moduleId, subModuleId, permissionTypeId, true, sbuRestrictions);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Module / Sub-module</TableHead>
            {permissionTypes.map((type) => (
              <TableHead key={type.id} className="text-center capitalize">
                {type.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            
            return (
              <React.Fragment key={module.id}>
                {/* Module Row */}
                <TableRow className="bg-muted/30 hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleModule(module.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                      {module.icon && <span className="text-base">{module.icon}</span>}
                      <span className="font-medium">{module.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {module.sub_modules.length} sub-modules
                      </Badge>
                    </div>
                  </TableCell>
                  {permissionTypes.map((type) => {
                    const state = getModulePermissionState(module, type.id);
                    return (
                      <TableCell key={type.id} className="text-center">
                        <Checkbox
                          checked={state === 'all'}
                          ref={(ref) => {
                            if (ref && 'indeterminate' in ref) {
                              (ref as any).indeterminate = state === 'some';
                            }
                          }}
                          onCheckedChange={(checked) =>
                            handleModulePermissionToggle(module, type.id, checked as boolean)
                          }
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Sub-module Rows */}
                {isExpanded && module.sub_modules.map((subModule) => (
                  <TableRow key={subModule.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3 ml-9">
                        {subModule.icon && <span className="text-sm">{subModule.icon}</span>}
                        <span className="text-sm">{subModule.name}</span>
                      </div>
                    </TableCell>
                    {permissionTypes.map((type) => {
                      const isChecked = hasPermission(module.id, subModule.id, type.id);
                      const sbuRestrictions = getPermissionSBUs(module.id, subModule.id, type.id);

                      return (
                        <TableCell key={type.id} className="text-center">
                          <div className="space-y-2">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleSubModulePermissionToggle(
                                  module.id,
                                  subModule.id,
                                  type.id,
                                  checked as boolean
                                )
                              }
                            />
                            {isChecked && isSBUBound && (
                              <div className="px-2">
                                <SBURestrictionSelector
                                  value={sbuRestrictions}
                                  onChange={(sbus) =>
                                    handleSBUChange(module.id, subModule.id, type.id, sbus)
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};