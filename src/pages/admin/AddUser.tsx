
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UserForm from '@/components/admin/UserForm';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          employeeId: formData.employeeId,
          sbuId: formData.sbuId || null,
          expertiseId: formData.expertiseId || null,
          dateOfJoining: formData.dateOfJoining || null,
          careerStartDate: formData.careerStartDate || null
        }
      });

      if (error) throw error;

      toast({
        title: "User created successfully",
        description: `${formData.firstName} ${formData.lastName} has been added as ${formData.role}.`,
      });

      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error creating user',
        description: error.message || 'There was an error creating the user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">Add New User</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new user account</p>
          </div>
        </div>

        <UserForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          title="User Information"
          description="Fill in the details below to create a new user account"
        />
      </div>
    </DashboardLayout>
  );
};

export default AddUser;
