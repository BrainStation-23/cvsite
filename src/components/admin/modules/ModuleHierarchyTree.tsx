import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Edit, Settings, Plus, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Module, SubModule } from '@/types';
import * as LucideIcons from 'lucide-react';

interface ModuleHierarchyTreeProps {
  modules: (Module & { sub_modules: SubModule[] })[];
}

export const ModuleHierarchyTree: React.FC<ModuleHierarchyTreeProps> = ({ modules }) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map(m => m.id))
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <div className="w-5 h-5 rounded bg-muted" />;
    
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    if (!IconComponent) return <div className="w-5 h-5 rounded bg-muted" />;
    
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-3">
      {modules.map((module) => {
        const isExpanded = expandedModules.has(module.id);
        const hasSubModules = module.sub_modules && module.sub_modules.length > 0;

        return (
          <Card key={module.id} className="border-l-4 border-l-primary/20 hover:border-l-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Expand/Collapse Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleModule(module.id)}
                  >
                    {hasSubModules ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Module Icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border">
                    {renderIcon(module.icon)}
                  </div>

                  {/* Module Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl text-foreground">{module.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={module.is_active ? 'default' : 'secondary'} className="text-xs">
                          {module.is_active ? (
                            <><Eye className="w-3 h-3 mr-1" />Active</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" />Inactive</>
                          )}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          #{module.display_order}
                        </Badge>
                        {hasSubModules && (
                          <Badge variant="outline" className="text-xs">
                            {module.sub_modules.length} sub-modules
                          </Badge>
                        )}
                      </div>
                    </div>
                    {module.description && (
                      <p className="text-muted-foreground text-sm mt-1">{module.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/modules/${module.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/modules/${module.id}/submodules/create`}>
                      <Plus className="h-4 w-4 mr-1" />
                      Sub-modules
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Sub-modules */}
            {hasSubModules && isExpanded && (
              <CardContent className="pt-0">
                <div className="ml-14 space-y-2 border-l-2 border-muted pl-4">
                  {module.sub_modules.map((subModule, index) => (
                    <div 
                      key={subModule.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="w-6 h-6 rounded bg-secondary/20 flex items-center justify-center border">
                        {renderIcon('FileText')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{subModule.name}</h4>
                          <Badge variant={subModule.is_active ? 'default' : 'secondary'} className="text-xs">
                            {subModule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            #{subModule.display_order}
                          </Badge>
                        </div>
                        
                        {subModule.description && (
                          <p className="text-sm text-muted-foreground mt-1">{subModule.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          {subModule.table_names && subModule.table_names.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {subModule.table_names.length} tables
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/modules/${module.id}/submodules/${subModule.id}/edit`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}

            {/* Empty State for Sub-modules */}
            {!hasSubModules && isExpanded && (
              <CardContent className="pt-0">
                <div className="ml-14 text-center py-6 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">No sub-modules configured</p>
                  <Button variant="link" size="sm" asChild>
                    <Link to={`/admin/modules/${module.id}/submodules`}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add first sub-module
                    </Link>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
      
      {modules.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No modules found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first module</p>
            <Button asChild>
              <Link to="/admin/modules/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Module
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};