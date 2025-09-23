import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2, Database } from 'lucide-react';
import { SubModule } from '@/types';
import { useDeleteSubModule } from '@/hooks/rbac/useModules';

interface SubModulesListProps {
  subModules: SubModule[];
  moduleId: string;
}

export const SubModulesList: React.FC<SubModulesListProps> = ({ subModules, moduleId }) => {
  const deleteSubModule = useDeleteSubModule();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sub-module? This action cannot be undone.')) {
      await deleteSubModule.mutateAsync(id);
    }
  };

  return (
    <div className="grid gap-4">
      {subModules.map((subModule) => (
        <Card key={subModule.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">{subModule.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={subModule.is_active ? 'default' : 'secondary'}>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/modules/${moduleId}/submodules/${subModule.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Sub-module
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleDelete(subModule.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Sub-module
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          
          <CardContent>
            {subModule.description && (
              <p className="text-muted-foreground mb-4">{subModule.description}</p>
            )}
            
            {subModule.table_names && subModule.table_names.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Associated Tables
                </h4>
                <div className="flex flex-wrap gap-1">
                  {subModule.table_names.map((tableName) => (
                    <Badge key={tableName} variant="secondary" className="text-xs">
                      {tableName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {subModules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sub-modules found</p>
          <Button variant="link" asChild className="mt-2">
            <Link to={`/admin/modules/${moduleId}/submodules/create`}>
              Create your first sub-module
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};