import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, FileText } from 'lucide-react';
import { icons } from 'lucide-react';
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

// Icon component to render Lucide icons dynamically
const DynamicIcon: React.FC<{ iconName?: string; className?: string }> = ({ iconName, className = "h-4 w-4" }) => {
  if (!iconName) return <FileText className={className} />;
  
  // Try to find the icon by name (case insensitive)
  const iconKey = Object.keys(icons).find(key => 
    key.toLowerCase() === iconName.toLowerCase().replace(/[-_]/g, '')
  );
  
  if (iconKey) {
    const IconComponent = icons[iconKey as keyof typeof icons] as React.ComponentType<{ className?: string }>;
    return <IconComponent className={className} />;
  }
  
  // Fallback icon
  return <FileText className={className} />;
};

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

  const handleSelectAllModule = (module: Module & { sub_modules: SubModule[] }, checked: boolean) => {
    // Apply to all permission types for all sub-modules
    module.sub_modules.forEach(subModule => {
      permissionTypes.forEach(permissionType => {
        const currentSBUs = getPermissionSBUs(module.id, subModule.id, permissionType.id);
        onPermissionChange(module.id, subModule.id, permissionType.id, checked, currentSBUs);
      });
    });
  };

  const handleSelectAllSubModule = (moduleId: string, subModuleId: string, checked: boolean) => {
    // Apply to all permission types for this sub-module
    permissionTypes.forEach(permissionType => {
      const currentSBUs = getPermissionSBUs(moduleId, subModuleId, permissionType.id);
      onPermissionChange(moduleId, subModuleId, permissionType.id, checked, currentSBUs);
    });
  };

  const getModuleSelectAllState = (module: Module & { sub_modules: SubModule[] }) => {
    let totalPermissions = 0;
    let grantedPermissions = 0;

    module.sub_modules.forEach(subModule => {
      permissionTypes.forEach(permissionType => {
        totalPermissions++;
        if (hasPermission(module.id, subModule.id, permissionType.id)) {
          grantedPermissions++;
        }
      });
    });

    if (grantedPermissions === 0) return 'none';
    if (grantedPermissions === totalPermissions) return 'all';
    return 'some';
  };

  const getSubModuleSelectAllState = (moduleId: string, subModuleId: string) => {
    const grantedPermissions = permissionTypes.filter(permissionType =>
      hasPermission(moduleId, subModuleId, permissionType.id)
    ).length;

    if (grantedPermissions === 0) return 'none';
    if (grantedPermissions === permissionTypes.length) return 'all';
    return 'some';
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[300px]">Module / Sub-module</TableHead>
            <TableHead className="w-20 text-center">Select All</TableHead>
            {permissionTypes.map((type) => (
              <TableHead key={type.id} className="w-20 text-center capitalize">
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
                    <DynamicIcon iconName={module.icon} className="h-4 w-4" />
                    <span className="font-medium">{module.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {module.sub_modules.length} sub-modules
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="w-20 text-center">
                  <Checkbox
                    checked={getModuleSelectAllState(module) === 'all'}
                    ref={(ref) => {
                      if (ref && 'indeterminate' in ref) {
                        (ref as any).indeterminate = getModuleSelectAllState(module) === 'some';
                      }
                    }}
                    onCheckedChange={(checked) =>
                      handleSelectAllModule(module, checked as boolean)
                    }
                  />
                </TableCell>
                {permissionTypes.map((type) => {
                  const state = getModulePermissionState(module, type.id);
                  return (
                    <TableCell key={type.id} className="w-20 text-center">
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
                      <DynamicIcon iconName={subModule.icon} className="h-3 w-3" />
                      <span className="text-sm">{subModule.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="w-20 text-center">
                    <Checkbox
                      checked={getSubModuleSelectAllState(module.id, subModule.id) === 'all'}
                      ref={(ref) => {
                        if (ref && 'indeterminate' in ref) {
                          (ref as any).indeterminate = getSubModuleSelectAllState(module.id, subModule.id) === 'some';
                        }
                      }}
                      onCheckedChange={(checked) =>
                        handleSelectAllSubModule(module.id, subModule.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  {permissionTypes.map((type) => {
                    const isChecked = hasPermission(module.id, subModule.id, type.id);
                    const sbuRestrictions = getPermissionSBUs(module.id, subModule.id, type.id);

                    return (
                      <TableCell key={type.id} className="w-20 text-center">
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