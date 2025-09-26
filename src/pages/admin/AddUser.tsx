
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const { error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          employeeId: formData.employeeId,
          sbuId: formData.sbuId || null,
          expertiseId: formData.expertiseId || null,
          resourceTypeId: formData.resourceTypeId || null,
          dateOfJoining: formData.dateOfJoining || null,
          careerStartDate: formData.careerStartDate || null
        }
      });

      if (error) throw error;

      toast({
        title: "User created successfully",
        description: `${formData.firstName} ${formData.lastName} has been added as ${formData.role}.`,
      });

      navigate('/users');
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
    <div>
      <div className="space-y-6">
        <UserForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          title="User Information"
          description="Fill in the details below to create a new user account"
        />
      </div>
    </div>
  );
};

export default AddUser;
