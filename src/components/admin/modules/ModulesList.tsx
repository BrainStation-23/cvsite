import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Settings, Trash2, Users } from 'lucide-react';
import { Module, SubModule } from '@/types';
import { useDeleteModule } from '@/hooks/rbac/useModules';

interface ModulesListProps {
  modules: (Module & { sub_modules: SubModule[] })[];
}

export const ModulesList: React.FC<ModulesListProps> = ({ modules }) => {
  const deleteModule = useDeleteModule();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      await deleteModule.mutateAsync(id);
    }
  };

  return (
    <div className="grid gap-4">
      {modules.map((module) => (
        <Card key={module.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              {module.icon && (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">{module.icon}</span>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/modules/${module.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Module
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/admin/modules/${module.id}/submodules`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Sub-modules
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleDelete(module.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Module
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          
          <CardContent>
            {module.description && (
              <p className="text-muted-foreground mb-4">{module.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {module.sub_modules?.length || 0} sub-modules
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/modules/${module.id}/submodules`}>
                  View Sub-modules
                </Link>
              </Button>
            </div>
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