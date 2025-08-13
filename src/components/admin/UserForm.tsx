import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface UserFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  title: string;
  description: string;
  user?: any;
  isEdit?: boolean;
  initialData?: any;
}

const roleOptions = [
  { value: 'employee', label: 'Employee' },
  { value: 'admin', label: 'Admin' },
  { value: 'sbu_lead', label: 'SBU Lead' },
];

const UserForm: React.FC<UserFormProps> = ({ onSubmit, isLoading, title, description, user, initialData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [sbuList, setSbuList] = useState<any[]>([]);
  const [expertiseList, setExpertiseList] = useState<any[]>([]);
  const [resourceTypeList, setResourceTypeList] = useState<any[]>([]);
  const [dateOfJoining, setDateOfJoining] = useState<Date | undefined>(
    (user?.dateOfJoining || initialData?.dateOfJoining) ? new Date(user?.dateOfJoining || initialData?.dateOfJoining) : undefined
  );
  const [careerStartDate, setCareerStartDate] = useState<Date | undefined>(
    (user?.careerStartDate || initialData?.careerStartDate) ? new Date(user?.careerStartDate || initialData?.careerStartDate) : undefined
  );

  const formData = user || initialData || {};

  const form = useForm({
    defaultValues: {
      firstName: formData?.firstName || '',
      lastName: formData?.lastName || '',
      email: formData?.email || '',
      password: '',
      role: formData?.role || 'employee',
      employeeId: formData?.employeeId || '',
      sbuId: formData?.sbuId || '',
      expertiseId: formData?.expertiseId || '',
      resourceTypeId: formData?.resourceTypeId || '',
      dateOfJoining: formData?.dateOfJoining || null,
      careerStartDate: formData?.careerStartDate || null
    }
  });

  useEffect(() => {
    const fetchLists = async () => {
      // Fetch SBU List
      const { data: sbuData, error: sbuError } = await supabase
        .from('sbus')
        .select('id, name');

      if (sbuError) {
        console.error("Error fetching SBU list:", sbuError);
      } else {
        setSbuList(sbuData);
      }

      // Fetch Expertise List
      const { data: expertiseData, error: expertiseError } = await supabase
        .from('expertise_types')
        .select('id, name');

      if (expertiseError) {
        console.error("Error fetching Expertise list:", expertiseError);
      } else {
        setExpertiseList(expertiseData);
      }

      // Fetch Resource Type List
      const { data: resourceTypeData, error: resourceTypeError } = await supabase
        .from('resource_types')
        .select('id, name');

      if (resourceTypeError) {
        console.error("Error fetching Resource Type list:", resourceTypeError);
      } else {
        setResourceTypeList(resourceTypeData);
      }
    };

    fetchLists();
  }, []);

  const onSubmitHandler = async (data: any) => {
    // Format dates to 'yyyy-MM-dd'
    const formattedData = {
      ...data,
      dateOfJoining: dateOfJoining ? format(dateOfJoining, 'yyyy-MM-dd') : null,
      careerStartDate: careerStartDate ? format(careerStartDate, 'yyyy-MM-dd') : null
    };

    await onSubmit(formattedData);
  };

  const handleDateOfJoiningSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setDateOfJoining(date);
    } else {
      setDateOfJoining(undefined);
    }
  };

  const handleCareerStartDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setCareerStartDate(date);
    } else {
      setCareerStartDate(undefined);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Invalid email format',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!user && !initialData && (
              <FormField
                control={form.control}
                name="password"
                rules={{ required: 'Password is required', minLength: 6 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Password"
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          type="button"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Employee ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sbuId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategic Business Unit (SBU)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select SBU" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sbuList.map((sbu) => (
                        <SelectItem key={sbu.id} value={sbu.id}>
                          {sbu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expertiseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expertise</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Expertise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expertiseList.map((expertise) => (
                        <SelectItem key={expertise.id} value={expertise.id}>
                          {expertise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resourceTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Resource Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resourceTypeList.map((resourceType) => (
                        <SelectItem key={resourceType.id} value={resourceType.id}>
                          {resourceType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Date of Joining</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateOfJoining && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfJoining ? format(dateOfJoining, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfJoining}
                      onSelect={handleDateOfJoiningSelect}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>

              <FormItem>
                <FormLabel>Career Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !careerStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {careerStartDate ? format(careerStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={careerStartDate}
                      onSelect={handleCareerStartDateSelect}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            </div>

            <Button disabled={isLoading} className="w-full" type="submit">
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
