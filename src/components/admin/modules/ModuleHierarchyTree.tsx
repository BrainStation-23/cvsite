import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Edit, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Module, SubModule } from '@/types';

interface ModuleHierarchyTreeProps {
  modules: (Module & { sub_modules: SubModule[] })[];
}

export const ModuleHierarchyTree: React.FC<ModuleHierarchyTreeProps> = ({ modules }) => {
  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <Card key={module.id} className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {module.icon && (
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <span className="text-sm">{module.icon}</span>
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={module.is_active ? 'default' : 'secondary'}>
                      {module.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Order: {module.display_order}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/modules/${module.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/modules/${module.id}/submodules`}>
                    <Settings className="h-4 w-4 mr-1" />
                    Sub-modules
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            {module.description && (
              <p className="text-muted-foreground mb-4">{module.description}</p>
            )}
            
            {module.sub_modules && module.sub_modules.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  Sub-modules ({module.sub_modules.length})
                </h4>
                {module.sub_modules.map((subModule) => (
                  <div 
                    key={subModule.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{subModule.name}</div>
                      {subModule.description && (
                        <div className="text-sm text-muted-foreground">
                          {subModule.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={subModule.is_active ? 'default' : 'secondary'}
                        >
                          {subModule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          Order: {subModule.display_order}
                        </Badge>
                        {subModule.table_names && subModule.table_names.length > 0 && (
                          <Badge variant="outline">
                            {subModule.table_names.length} tables
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No sub-modules configured</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link to={`/admin/modules/${module.id}/submodules`}>
                    Add Sub-modules
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {modules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No modules found</p>
        </div>
      )}
    </div>
  );
};