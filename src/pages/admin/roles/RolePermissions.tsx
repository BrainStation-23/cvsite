import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { PermissionMatrix } from '@/components/admin/roles/PermissionMatrix';
import { useRole } from '@/hooks/rbac/useRoles';
import { Skeleton } from '@/components/ui/skeleton';

const RolePermissions: React.FC = () => {
  const navigate = useNavigate();
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
            <Skeleton className="h-96 w-full" />
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
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/roles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Permissions: {role.name}
            </h1>
            <p className="text-muted-foreground">
              Configure detailed permissions for this role
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/admin/roles/edit/${roleId}`)}>
          <Settings className="h-4 w-4 mr-2" />
          Role Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Grant or revoke permissions for each module and sub-module. 
            {role.is_sbu_bound && ' SBU restrictions can be applied per permission.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionMatrix roleId={roleId!} role={role} />
        </CardContent>
      </Card>
    </div>
  );
};

export default RolePermissions;