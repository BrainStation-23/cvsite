import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { RoleForm } from '@/components/admin/roles/RoleForm';

const CreateRole: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/roles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Role</h1>
          <p className="text-muted-foreground">
            Define a new custom role with specific permissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Configure the basic information and permissions for the new role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRole;