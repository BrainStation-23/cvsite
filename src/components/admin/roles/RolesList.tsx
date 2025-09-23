import React, { useState } from 'react';
import { Edit, Shield, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useRoles, useDeleteRole } from '@/hooks/rbac/useRoles';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (roleToDelete) {
      await deleteRoleMutation.mutateAsync(roleToDelete);
      setRoleToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No custom roles found</h3>
        <p className="text-muted-foreground">
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
          {roles.map((role) => (
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
                    <Badge variant="outline">SBU Bound</Badge>
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
                    <Shield className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!role.is_system_role && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRoleToDelete(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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