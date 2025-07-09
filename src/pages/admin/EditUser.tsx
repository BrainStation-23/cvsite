import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import UserForm from '@/components/admin/UserForm';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  employee_id: string;
  sbu_id: string | null;
  expertise_id: string | null;
  resource_type: string | null;
  date_of_joining: string | null;
  career_start_date: string | null;
  manager: string | null;
}

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    try {
      setIsLoadingUser(true);
      
      // Fetch user data from list_users RPC function
      const { data, error } = await supabase.rpc('list_users', {
        search_query: null,
        filter_role: null,
        page_number: 1,
        items_per_page: 1000,
        sort_by: 'email',
        sort_order: 'asc'
      });

      if (error) throw error;

      // Parse the JSON response properly
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      const users = response?.users || [];
      
      const user = users.find((u: any) => u.id === id);
      
      if (user) {
        setUserData({
          id: user.id,
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          role: user.role || 'employee',
          employee_id: user.employee_id || '',
          sbu_id: user.sbu_id || null,
          expertise_id: user.expertise_id || null,
          resource_type: user.resource_type || null,
          date_of_joining: user.date_of_joining || null,
          career_start_date: user.career_start_date || null,
          manager: user.manager || null
        });
      } else {
        toast({
          title: 'User not found',
          description: 'The requested user could not be found.',
          variant: 'destructive',
        });
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: 'Error loading user',
        description: 'There was an error loading the user data',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: {
          userId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          employeeId: formData.employeeId,
          sbuId: formData.sbuId || null,
          expertiseId: formData.expertiseId || null,
          resourceTypeId: formData.resourceTypeId || null,
          dateOfJoining: formData.dateOfJoining || null,
          careerStartDate: formData.careerStartDate || null,
          managerId: formData.managerId || null,
          password: formData.password || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "User updated successfully",
        description: `${formData.firstName} ${formData.lastName} has been updated.`,
      });

      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error updating user',
        description: error.message || 'There was an error updating the user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading user data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">User not found</div>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">Edit User</h1>
            <p className="text-gray-600 dark:text-gray-400">Update user account information</p>
          </div>
        </div>

        <UserForm
          initialData={{
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            role: userData.role,
            employeeId: userData.employee_id,
            sbuId: userData.sbu_id,
            expertiseId: userData.expertise_id,
            resourceTypeId: userData.resource_type,
            dateOfJoining: userData.date_of_joining || '',
            careerStartDate: userData.career_start_date || '',
            managerId: userData.manager
          }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEdit={true}
          title="User Information"
          description="Update the user details below"
        />
      </div>
    </DashboardLayout>
  );
};

export default EditUser;
