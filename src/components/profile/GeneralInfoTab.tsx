import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import ProfileImageUpload from './ProfileImageUpload';

// Define this type consistently across all files
export interface GeneralInfoFormData {
  firstName: string;
  lastName: string;
  biography: string;
  profileImage?: string | null;
}

interface GeneralInfoTabProps {
  form: UseFormReturn<GeneralInfoFormData>;
  isEditing: boolean;
  profileId?: string;
  onImageUpdate: (imageUrl: string | null) => void;
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ 
  form, 
  isEditing, 
  profileId,
  onImageUpdate 
}) => {
  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const profileImage = form.watch('profileImage');
  
  const userName = `${firstName} ${lastName}`.trim() || 'User';

  const handleImageUpdate = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl);
    onImageUpdate(imageUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            {/* Two Column Layout: Image Left, Form Fields Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Image Section - Left Column */}
              <div className="lg:col-span-1">
                <ProfileImageUpload
                  currentImageUrl={profileImage}
                  profileId={profileId}
                  onImageUpdate={handleImageUpdate}
                  isEditing={isEditing}
                  userName={userName}
                />
              </div>

              {/* Form Fields Section - Right Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Input
                              {...field}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50"
                            />
                          ) : (
                            <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value}</div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Input
                              {...field}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50"
                            />
                          ) : (
                            <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value}</div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">Biography</FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <Textarea
                            {...field}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50"
                          />
                        ) : (
                          <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value || "No biography provided"}</div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
