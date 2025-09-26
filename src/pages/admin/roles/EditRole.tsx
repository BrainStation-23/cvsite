import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { RoleForm } from '@/components/admin/roles/RoleForm';
import { useRole } from '@/hooks/rbac/useRoles';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

const EditRole: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { roleId } = useParams<{ roleId: string }>();
  const { data: role, isLoading } = useRole(roleId!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/roles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/roles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Role not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-between">
          <div className='flex items-center gap-4'>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/roles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Role: {role.name}</h1>
            <p className="text-muted-foreground">
              Modify role configuration and permissions
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={() => navigate(`/admin/roles/permissions/${roleId}`)}>
          <Settings className="h-4 w-4 mr-2" />
          Permissions Settings
        </Button>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Update the role information and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm 
            key={roleId} // This forces a remount when roleId changes
            role={role} 
            onSuccess={() => {
              // Invalidate both the roles list and the specific role query
              if (roleId) {
                queryClient.invalidateQueries({ queryKey: ['roles'] });
                queryClient.invalidateQueries({ queryKey: ['role', roleId] });
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRole;