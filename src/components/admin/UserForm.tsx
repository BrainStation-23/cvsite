
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Lock, IdCard, Building, Calendar, Briefcase, UserCheck, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { UserRole } from '@/types';
import SbuCombobox from './user/SbuCombobox';
import ExpertiseCombobox from './user/ExpertiseCombobox';
import ResourceTypeCombobox from './user/ResourceTypeCombobox';
import DatePicker from './user/DatePicker';
import { ProfileCombobox } from './user/ProfileCombobox';

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
  managerId: string | null;
  dateOfBirth: string;
  resignationDate: string;
  exitDate: string;
  active: boolean;
  hasOverhead: boolean;
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
  console.log('=== UserForm Debug ===');
  console.log('Initial data received:', initialData);
  console.log('Manager ID from initial data:', initialData.managerId);
  console.log('Expertise ID from initial data:', initialData.expertiseId);
  console.log('Resource Type ID from initial data:', initialData.resourceTypeId);

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
    careerStartDate: initialData.careerStartDate || '',
    managerId: initialData.managerId || null,
    dateOfBirth: initialData.dateOfBirth || '',
    resignationDate: initialData.resignationDate || '',
    exitDate: initialData.exitDate || '',
    active: initialData.active ?? true,
    hasOverhead: initialData.hasOverhead ?? true
  });

  console.log('Form data state after initialization:', formData);
  console.log('Manager ID in form state:', formData.managerId);
  console.log('Expertise ID in form state:', formData.expertiseId);
  console.log('Resource Type ID in form state:', formData.resourceTypeId);

  const handleInputChange = (field: keyof UserFormData, value: string | boolean | null) => {
    console.log(`=== UserForm Field Change ===`);
    console.log(`Field: ${field}, New Value:`, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Updated form data:', newData);
      return newData;
    });
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
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck size={18} />
                <h3 className="text-lg font-medium">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <DatePicker
                    value={formData.dateOfBirth}
                    onChange={(value) => handleInputChange('dateOfBirth', value)}
                    placeholder="Select date of birth"
                  />
                </div>
              </div>
            </div>

            <Separator />

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
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
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
                  <Label htmlFor="manager" className="flex items-center gap-2">
                    <User size={16} />
                    Manager (Optional)
                  </Label>
                  <ProfileCombobox
                    value={formData.managerId}
                    onValueChange={(value) => handleInputChange('managerId', value)}
                    placeholder="Select manager..."
                    label="Manager"
                  />
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

            <Separator />

            {/* Employment Status Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={18} />
                <h3 className="text-lg font-medium">Employment Status</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(value) => handleInputChange('active', value)}
                  />
                  <Label htmlFor="active">Active Employee</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="hasOverhead"
                    checked={formData.hasOverhead}
                    onCheckedChange={(value) => handleInputChange('hasOverhead', value)}
                  />
                  <Label htmlFor="hasOverhead">Has Overhead</Label>
                </div>
              </div>
            </div>

            {!formData.active && (
              <>
                <Separator />
                
                {/* Exit Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={18} />
                    <h3 className="text-lg font-medium">Exit Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="resignationDate">Resignation Date</Label>
                      <DatePicker
                        value={formData.resignationDate}
                        onChange={(value) => handleInputChange('resignationDate', value)}
                        placeholder="Select resignation date"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exitDate">Exit Date</Label>
                      <DatePicker
                        value={formData.exitDate}
                        onChange={(value) => handleInputChange('exitDate', value)}
                        placeholder="Select exit date"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

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
