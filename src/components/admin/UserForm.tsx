
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Lock, IdCard, Building, Calendar, Briefcase } from 'lucide-react';
import { UserRole } from '@/types';
import SbuCombobox from './user/SbuCombobox';
import ExpertiseCombobox from './user/ExpertiseCombobox';
import ResourceTypeCombobox from './user/ResourceTypeCombobox';
import DatePicker from './user/DatePicker';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
  employeeId: string;
  sbuId: string | null;
  expertiseId: string | null;
  resourceTypeId: string | null;
  dateOfJoining: string;
  careerStartDate: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading: boolean;
  isEdit?: boolean;
  title: string;
  description: string;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading,
  isEdit = false,
  title,
  description
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: initialData.email || '',
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    role: initialData.role || 'employee',
    password: initialData.password || '',
    employeeId: initialData.employeeId || '',
    sbuId: initialData.sbuId || null,
    expertiseId: initialData.expertiseId || null,
    resourceTypeId: initialData.resourceTypeId || null,
    dateOfJoining: initialData.dateOfJoining || '',
    careerStartDate: initialData.careerStartDate || ''
  });

  const handleInputChange = (field: keyof UserFormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            {title}
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User size={18} />
                <h3 className="text-lg font-medium">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={16} />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock size={16} />
                    {isEdit ? 'New Password (Optional)' : 'Password *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
                    required={!isEdit}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Professional Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={18} />
                <h3 className="text-lg font-medium">Professional Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="flex items-center gap-2">
                    <IdCard size={16} />
                    Employee ID *
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder="Enter employee ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Building size={16} />
                    Role *
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sbu" className="flex items-center gap-2">
                    <Building size={16} />
                    SBU (Optional)
                  </Label>
                  <SbuCombobox
                    value={formData.sbuId}
                    onValueChange={(value) => handleInputChange('sbuId', value)}
                    placeholder="Select SBU..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise" className="flex items-center gap-2">
                    <Briefcase size={16} />
                    Expertise (Optional)
                  </Label>
                  <ExpertiseCombobox
                    value={formData.expertiseId}
                    onValueChange={(value) => handleInputChange('expertiseId', value)}
                    placeholder="Select expertise..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resourceType" className="flex items-center gap-2">
                    <Briefcase size={16} />
                    Resource Type (Optional)
                  </Label>
                  <ResourceTypeCombobox
                    value={formData.resourceTypeId}
                    onValueChange={(value) => handleInputChange('resourceTypeId', value)}
                    placeholder="Select resource type..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Career Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} />
                <h3 className="text-lg font-medium">Career Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <DatePicker
                    value={formData.dateOfJoining}
                    onChange={(value) => handleInputChange('dateOfJoining', value)}
                    placeholder="Select joining date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerStartDate">Career Start Date</Label>
                  <DatePicker
                    value={formData.careerStartDate}
                    onChange={(value) => handleInputChange('careerStartDate', value)}
                    placeholder="Select career start date"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update User' : 'Create User')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
