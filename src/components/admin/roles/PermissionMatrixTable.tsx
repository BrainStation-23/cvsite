import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
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
const DynamicIcon: React.FC<{ iconName?: string; className?: string }> = ({
  iconName,
  className = 'h-4 w-4',
}) => {
  if (!iconName) return <FileText className={className} />;

  // Try to find the icon by name (case insensitive)
  const iconKey = Object.keys(icons).find(
    (key) => key.toLowerCase() === iconName.toLowerCase().replace(/[-_]/g, '')
  );

  if (iconKey) {
    const IconComponent = icons[iconKey as keyof typeof icons] as React.ComponentType<{
      className?: string;
    }>;
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

  // Identify the "read" permission (id cached for quick checks)
  const readPermission = permissionTypes.find(
    (p) => p.name?.toLowerCase() === 'read' || p.id?.toLowerCase() === 'read'
  );
  const readPermissionId = readPermission?.id;

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const hasPermission = (
    moduleId: string,
    subModuleId?: string,
    permissionTypeId?: string
  ) =>
    permissions.some(
      (p) =>
        p.module_id === moduleId &&
        p.sub_module_id === subModuleId &&
        (!permissionTypeId || p.permission_type_id === permissionTypeId)
    );

  const getPermissionSBUs = (
    moduleId: string,
    subModuleId?: string,
    permissionTypeId?: string
  ) => {
    const permission = permissions.find(
      (p) =>
        p.module_id === moduleId &&
        p.sub_module_id === subModuleId &&
        (!permissionTypeId || p.permission_type_id === permissionTypeId)
    );
    return permission?.sbu_restrictions || [];
  };

  const getModulePermissionState = (
    module: Module & { sub_modules: SubModule[] },
    permissionTypeId: string
  ) => {
    const count = module.sub_modules.filter((sm) =>
      hasPermission(module.id, sm.id, permissionTypeId)
    ).length;
    if (count === 0) return 'none';
    if (count === module.sub_modules.length) return 'all';
    return 'some';
  };

  // NEW: helper – does any non-read permission exist for a sub-module
  const hasAnyNonReadPermission = (moduleId: string, subModuleId: string) =>
    permissionTypes.some(
      (pt) =>
        pt.id !== readPermissionId && hasPermission(moduleId, subModuleId, pt.id)
    );

  // NEW: helper – does any non-read permission exist inside module
  const moduleHasAnyNonRead = (module: Module & { sub_modules: SubModule[] }) =>
    module.sub_modules.some((sm) => hasAnyNonReadPermission(module.id, sm.id));

  const handleModulePermissionToggle = (
    module: Module & { sub_modules: SubModule[] },
    permissionTypeId: string,
    checked: boolean
  ) => {
    // If toggling non-read ON -> also force read ON
    const forceRead = checked && readPermissionId && permissionTypeId !== readPermissionId;
    module.sub_modules.forEach((subModule) => {
      const currentSBUs = getPermissionSBUs(module.id, subModule.id, permissionTypeId);
      onPermissionChange(module.id, subModule.id, permissionTypeId, checked, currentSBUs);
      if (forceRead && !hasPermission(module.id, subModule.id, readPermissionId)) {
        const readSBUs = getPermissionSBUs(module.id, subModule.id, readPermissionId);
        onPermissionChange(module.id, subModule.id, readPermissionId, true, readSBUs);
      }
    });
    // If trying to uncheck read while other permissions exist -> ignore
    if (
      !checked &&
      readPermissionId &&
      permissionTypeId === readPermissionId &&
      moduleHasAnyNonRead(module)
    ) {
      // Re-force read ON
      module.sub_modules.forEach((sm) => {
        const readSBUs = getPermissionSBUs(module.id, sm.id, readPermissionId);
        onPermissionChange(module.id, sm.id, readPermissionId, true, readSBUs);
      });
    }
  };

  const handleSubModulePermissionToggle = (
    moduleId: string,
    subModuleId: string,
    permissionTypeId: string,
    checked: boolean
  ) => {
    // If toggling a non-read permission ON -> ensure read ON & locked
    if (checked && readPermissionId && permissionTypeId !== readPermissionId) {
      if (!hasPermission(moduleId, subModuleId, readPermissionId)) {
        const readSBUs = getPermissionSBUs(moduleId, subModuleId, readPermissionId);
        onPermissionChange(moduleId, subModuleId, readPermissionId, true, readSBUs);
      }
    }

    // Prevent unchecking read if any other permission still active
    if (
      !checked &&
      readPermissionId &&
      permissionTypeId === readPermissionId &&
      hasAnyNonReadPermission(moduleId, subModuleId)
    ) {
      return; // block
    }

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

  const handleSelectAllModule = (
    module: Module & { sub_modules: SubModule[] },
    checked: boolean
  ) => {
    // NEW: When unchecking, do a two-phase removal: first non-read, then read.
    if (!checked) {
      module.sub_modules.forEach((subModule) => {
        // First remove all non-read permissions
        permissionTypes
          .filter((pt) => pt.id !== readPermissionId)
          .forEach((pt) => {
            const currentSBUs = getPermissionSBUs(module.id, subModule.id, pt.id);
            onPermissionChange(module.id, subModule.id, pt.id, false, currentSBUs);
          });
        // Then remove read (now no non-read remain, so no lock condition)
        if (readPermissionId) {
          const readSBUs = getPermissionSBUs(
            module.id,
            subModule.id,
            readPermissionId
          );
            onPermissionChange(
              module.id,
              subModule.id,
              readPermissionId,
              false,
              readSBUs
            );
        }
      });
      return;
    }

    // (Original logic for checking all)
    module.sub_modules.forEach((subModule) => {
      permissionTypes.forEach((pt) => {
        const currentSBUs = getPermissionSBUs(module.id, subModule.id, pt.id);
        onPermissionChange(module.id, subModule.id, pt.id, true, currentSBUs);
      });
      if (readPermissionId) {
        const readSBUs = getPermissionSBUs(module.id, subModule.id, readPermissionId);
        onPermissionChange(module.id, subModule.id, readPermissionId, true, readSBUs);
      }
    });
  };

  const handleSelectAllSubModule = (
    moduleId: string,
    subModuleId: string,
    checked: boolean
  ) => {
    // NEW: Two-phase removal when unchecking
    if (!checked) {
      // First remove non-read
      permissionTypes
        .filter((pt) => pt.id !== readPermissionId)
        .forEach((pt) => {
          const currentSBUs = getPermissionSBUs(moduleId, subModuleId, pt.id);
          onPermissionChange(moduleId, subModuleId, pt.id, false, currentSBUs);
        });
      // Then remove read
      if (readPermissionId) {
        const readSBUs = getPermissionSBUs(moduleId, subModuleId, readPermissionId);
        onPermissionChange(moduleId, subModuleId, readPermissionId, false, readSBUs);
      }
      return;
    }

    // (Original logic for checking all)
    permissionTypes.forEach((pt) => {
      const currentSBUs = getPermissionSBUs(moduleId, subModuleId, pt.id);
      onPermissionChange(moduleId, subModuleId, pt.id, true, currentSBUs);
    });
    if (readPermissionId) {
      const readSBUs = getPermissionSBUs(moduleId, subModuleId, readPermissionId);
      onPermissionChange(moduleId, subModuleId, readPermissionId, true, readSBUs);
    }
  };

  const getModuleSelectAllState = (module: Module & { sub_modules: SubModule[] }) => {
    let total = 0;
    let granted = 0;
    module.sub_modules.forEach((sm) => {
      permissionTypes.forEach((pt) => {
        total++;
        if (hasPermission(module.id, sm.id, pt.id)) granted++;
      });
    });
    if (granted === 0) return 'none';
    if (granted === total) return 'all';
    return 'some';
  };

  const getSubModuleSelectAllState = (moduleId: string, subModuleId: string) => {
    const granted = permissionTypes.filter((pt) =>
      hasPermission(moduleId, subModuleId, pt.id)
    ).length;
    if (granted === 0) return 'none';
    if (granted === permissionTypes.length) return 'all';
    return 'some';
  };

  // ==== GLOBAL "ALL" STATE HELPERS (NEW) =====================================
  const totalPermissionCells = modules.reduce(
    (acc, m) => acc + m.sub_modules.length * permissionTypes.length,
    0
  );
  const grantedPermissionCells = permissions.length;
  const globalAllState =
    grantedPermissionCells === 0
      ? 'none'
      : grantedPermissionCells === totalPermissionCells
      ? 'all'
      : 'some';

  const handleGlobalToggle = (checked: boolean) => {
    // When setting ALL: grant every permission (including read)
    // When clearing ALL: remove every permission (including read)
    modules.forEach((m) =>
      m.sub_modules.forEach((sm) =>
        permissionTypes.forEach((pt) => {
          const currentSBUs = getPermissionSBUs(m.id, sm.id, pt.id);
          onPermissionChange(m.id, sm.id, pt.id, checked, currentSBUs);
        })
      )
    );
  };
  // ===========================================================================

  return (
    <div className="space-y-3">
      <Table className="table-fixed border rounded-md overflow-hidden">
        <TableHeader>
          <TableRow className="bg-muted/60 text-xs">
            <TableHead className="min-w-[240px] py-2">
              Module / Sub-module
            </TableHead>

            {/* GLOBAL ALL CHECKBOX (replaces static label) */}
            <TableHead className="w-16 text-center py-2" title="Toggle all permissions">
              <Checkbox
                className="h-5 w-5"
                checked={globalAllState === 'all'}
                ref={(ref) => {
                  if (ref && 'indeterminate' in ref) {
                    (ref as any).indeterminate = globalAllState === 'some';
                  }
                }}
                onCheckedChange={(checked) => handleGlobalToggle(checked as boolean)}
              />
            </TableHead>

            {permissionTypes.map((type) => (
              <TableHead
                key={type.id}
                className="w-16 text-center capitalize py-2 text-xs"
                title={type.name}
              >
                {type.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.flatMap((module) => {
            const isExpanded = expandedModules.has(module.id);
            const collapsedHasSelections =
              !isExpanded &&
              module.sub_modules.some((sm) =>
                permissionTypes.some((pt) =>
                  hasPermission(module.id, sm.id, pt.id)
                )
              );

            return [
              <TableRow
                key={module.id}
                className="bg-gradient-to-r from-muted/80 via-muted/50 to-muted/30 hover:from-muted/70 hover:via-muted/40 hover:to-muted/20 border-b"
              >
                <TableCell className="py-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleModule(module.id)}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <DynamicIcon iconName={module.icon} className="h-4 w-4" />
                    <span className="font-medium text-sm">{module.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {module.sub_modules.length}
                    </Badge>
                    {collapsedHasSelections && (
                      <span
                        className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse"
                        title="Some sub-module permissions selected"
                      />
                    )}
                  </div>
                </TableCell>

                {/* MODULE-LEVEL ALL */}
                <TableCell className="w-16 text-center">
                  <Checkbox
                    className="h-5 w-5"
                    checked={getModuleSelectAllState(module) === 'all'}
                    ref={(ref) => {
                      if (ref && 'indeterminate' in ref) {
                        (ref as any).indeterminate =
                          getModuleSelectAllState(module) === 'some';
                      }
                    }}
                    onCheckedChange={(checked) =>
                      handleSelectAllModule(module, checked as boolean)
                    }
                  />
                </TableCell>

                {permissionTypes.map((type) => {
                  const state = getModulePermissionState(module, type.id);
                  const isReadCell = type.id === readPermissionId;
                  const lockRead = isReadCell && moduleHasAnyNonRead(module);
                  return (
                    <TableCell key={type.id} className="w-16 text-center">
                      <Checkbox
                        className="h-5 w-5"
                        checked={state === 'all' || (isReadCell && lockRead)}
                        ref={(ref) => {
                          if (ref && 'indeterminate' in ref) {
                            (ref as any).indeterminate =
                              !lockRead && state === 'some';
                          }
                        }}
                        disabled={lockRead}
                        onCheckedChange={(checked) =>
                          handleModulePermissionToggle(
                            module,
                            type.id,
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                  );
                })}
              </TableRow>,
              ...(isExpanded
                ? module.sub_modules.map((subModule) => {
                    const subHasNonRead = hasAnyNonReadPermission(
                      module.id,
                      subModule.id
                    );
                    return (
                      <TableRow
                        key={subModule.id}
                        className="hover:bg-muted/20 text-xs"
                      >
                        <TableCell className="py-1">
                          <div className="flex items-center gap-2 ml-8">
                            <DynamicIcon
                              iconName={subModule.icon}
                              className="h-3 w-3 opacity-70"
                            />
                            <span className="text-[12px]">
                              {subModule.name}
                            </span>
                          </div>
                        </TableCell>
                        {/* SUB-MODULE ALL */}
                        <TableCell className="w-16 text-center">
                          <Checkbox
                            className="h-4 w-4"
                            checked={
                              getSubModuleSelectAllState(
                                module.id,
                                subModule.id
                              ) === 'all'
                            }
                            ref={(ref) => {
                              if (ref && 'indeterminate' in ref) {
                                (ref as any).indeterminate =
                                  getSubModuleSelectAllState(
                                    module.id,
                                    subModule.id
                                  ) === 'some';
                              }
                            }}
                            onCheckedChange={(checked) =>
                              handleSelectAllSubModule(
                                module.id,
                                subModule.id,
                                checked as boolean
                              )
                            }
                          />
                        </TableCell>
                        {permissionTypes.map((type) => {
                          const isChecked = hasPermission(
                            module.id,
                            subModule.id,
                            type.id
                          );
                          const isRead = type.id === readPermissionId;
                          const subHasNonRead = hasAnyNonReadPermission(
                            module.id,
                            subModule.id
                          );
                          const lockRead = isRead && subHasNonRead;
                          const sbuRestrictions = getPermissionSBUs(
                            module.id,
                            subModule.id,
                            type.id
                          );
                          return (
                            <TableCell
                              key={type.id}
                              className="w-16 text-center relative py-1"
                            >
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  className="h-4 w-4"
                                  checked={isChecked || (isRead && lockRead)}
                                  disabled={lockRead}
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
                                  <div className="absolute left-[44px]">
                                    <SBURestrictionSelector
                                      compact
                                      value={sbuRestrictions}
                                      onChange={(sbus) =>
                                        handleSBUChange(
                                          module.id,
                                          subModule.id,
                                          type.id,
                                          sbus
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                : []),
            ];
          })}
        </TableBody>
      </Table>
    </div>
  );
};
