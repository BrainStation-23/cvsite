import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { RolesList } from '@/components/admin/roles/RolesList';

const RoleManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage custom roles and their permissions across the system
          </p>
        </div>
        <Button onClick={() => navigate('/admin/roles/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>
            Configure custom roles with granular permissions and SBU restrictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolesList />
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;