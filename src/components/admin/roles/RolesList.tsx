import React, { useState } from 'react';
import { Copy, Edit, Lock, MoreVertical, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useRoles, useDeleteRole } from '@/hooks/rbac/useRoles';
import { useDuplicateRole } from '@/hooks/rbac/useDuplicateRole';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const RolesList: React.FC = () => {
  const navigate = useNavigate();
  const { data: roles, isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRole();
  const duplicateRoleMutation = useDuplicateRole();
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (roleToDelete) {
      await deleteRoleMutation.mutateAsync(roleToDelete);
      setRoleToDelete(null);
    }
  };

  const handleDuplicate = async (role: any) => {
    await duplicateRoleMutation.mutateAsync({
      sourceRoleId: role.id
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter out system roles for display
  //const filteredRoles = roles?.filter(role => !role.is_system_role) || [];
  const filteredRoles = roles;

  if (filteredRoles.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          You don't have any custom roles yet. 
          Create your first custom role to get started.
        </p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/admin/roles/create')}
        >
          Create Role
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRoles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {role.description || 'No description'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {role.is_system_role && (
                    <Badge variant="secondary">System</Badge>
                  )}
                  {role.is_sbu_bound && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" />
                      SBU Bound
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(role.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/roles/permissions/${role.id}`)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Permissions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleDuplicate(role)}
                        disabled={duplicateRoleMutation.isPending}
                        className="cursor-pointer"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      {!role.is_system_role && (
                        <DropdownMenuItem 
                          onClick={() => setRoleToDelete(role.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmationDialog
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone and will remove all user assignments."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
};