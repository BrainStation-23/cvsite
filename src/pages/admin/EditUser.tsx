
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/types';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import { useUserManagement } from '@/hooks/use-user-management';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { updateUser, isLoading } = useUserManagement();
  const { toast } = useToast();
  
  const [editUser, setEditUser] = useState({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    role: '' as UserRole,
    employeeId: '',
    sbuId: null as string | null,
    password: '',
    dateOfJoining: '',
    careerStartDate: '',
    expertise: null as string | null,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        navigate('/admin/user-management');
        return;
      }

      try {
        // Fetch user details from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles!inner(role),
            sbus(name)
          `)
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Fetch auth user details
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError) throw authError;

        setEditUser({
          id: profile.id,
          email: authUser.user.email || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: (profile.user_roles[0]?.role || 'employee') as UserRole,
          employeeId: profile.employee_id || '',
          sbuId: profile.sbu_id,
          password: '',
          dateOfJoining: profile.date_of_joining || '',
          careerStartDate: profile.career_start_date || '',
          expertise: profile.expertise,
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: 'Error loading user',
          description: 'Failed to load user details',
          variant: 'destructive',
        });
        navigate('/admin/user-management');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    const success = await updateUser(userId, {
      id: editUser.id,
      email: editUser.email,
      firstName: editUser.firstName,
      lastName: editUser.lastName,
      role: editUser.role,
      employeeId: editUser.employeeId,
      sbuId: editUser.sbuId,
      password: editUser.password || undefined,
      dateOfJoining: editUser.dateOfJoining || undefined,
      careerStartDate: editUser.careerStartDate || undefined,
      expertise: editUser.expertise || undefined,
    });
    
    if (success) {
      navigate('/admin/user-management');
    }
  };

  const isFormValid = editUser.email && editUser.firstName && editUser.lastName && editUser.employeeId;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/user-management')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to User Management
          </Button>
          <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">
            Edit User
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    value={editUser.employeeId}
                    onChange={(e) => setEditUser({ ...editUser, employeeId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={editUser.firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={editUser.lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(value) => setEditUser({ ...editUser, role: value as UserRole })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sbu">SBU</Label>
                  <SbuCombobox
                    value={editUser.sbuId}
                    onValueChange={(value) => setEditUser({ ...editUser, sbuId: value })}
                    placeholder="Select SBU..."
                  />
                </div>
              </div>

              {/* New Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={editUser.dateOfJoining}
                    onChange={(e) => setEditUser({ ...editUser, dateOfJoining: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="careerStartDate">Career Start Date</Label>
                  <Input
                    id="careerStartDate"
                    type="date"
                    value={editUser.careerStartDate}
                    onChange={(e) => setEditUser({ ...editUser, careerStartDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Textarea
                  id="expertise"
                  value={editUser.expertise || ''}
                  onChange={(e) => setEditUser({ ...editUser, expertise: e.target.value || null })}
                  placeholder="Enter expertise areas..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                <Input
                  id="password"
                  type="password"
                  value={editUser.password}
                  onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  placeholder="Enter new password to change"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/user-management')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating User...
                    </>
                  ) : (
                    'Update User'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditUser;
