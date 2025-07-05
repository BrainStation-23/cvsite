
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { addUser, isLoading } = useUserManagement();
  
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'employee' as UserRole,
    password: '',
    employeeId: '',
    sbuId: null as string | null,
    dateOfJoining: '',
    careerStartDate: '',
    expertise: null as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await addUser({
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      password: newUser.password,
      employeeId: newUser.employeeId,
      sbuId: newUser.sbuId,
      dateOfJoining: newUser.dateOfJoining || undefined,
      careerStartDate: newUser.careerStartDate || undefined,
      expertise: newUser.expertise || undefined,
    });
    
    if (success) {
      navigate('/admin/user-management');
    }
  };

  const isFormValid = newUser.email && newUser.firstName && newUser.lastName && 
                     newUser.password && newUser.employeeId;

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
            Add New User
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
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    value={newUser.employeeId}
                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
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
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
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
                    value={newUser.sbuId}
                    onValueChange={(value) => setNewUser({ ...newUser, sbuId: value })}
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
                    value={newUser.dateOfJoining}
                    onChange={(e) => setNewUser({ ...newUser, dateOfJoining: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="careerStartDate">Career Start Date</Label>
                  <Input
                    id="careerStartDate"
                    type="date"
                    value={newUser.careerStartDate}
                    onChange={(e) => setNewUser({ ...newUser, careerStartDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Textarea
                  id="expertise"
                  value={newUser.expertise || ''}
                  onChange={(e) => setNewUser({ ...newUser, expertise: e.target.value || null })}
                  placeholder="Enter expertise areas..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
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
                      Creating User...
                    </>
                  ) : (
                    'Create User'
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

export default AddUser;
