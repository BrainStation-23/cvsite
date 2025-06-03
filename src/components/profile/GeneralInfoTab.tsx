
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ProfileImageUpload } from './ProfileImageUpload';
import { Save } from 'lucide-react';

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
  onSave?: (data: GeneralInfoFormData) => Promise<void>;
  isSaving?: boolean;
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ 
  form, 
  isEditing, 
  profileId,
  onImageUpdate,
  onSave,
  isSaving = false
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [initialValues, setInitialValues] = useState<GeneralInfoFormData | null>(null);

  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const biography = form.watch('biography');
  const profileImage = form.watch('profileImage');
  
  const userName = `${firstName} ${lastName}`.trim() || 'User';

  // Track initial values and changes
  useEffect(() => {
    if (!initialValues) {
      const currentValues = {
        firstName,
        lastName,
        biography,
        profileImage
      };
      setInitialValues(currentValues);
    } else {
      // Check if any values have changed
      const currentValues = {
        firstName,
        lastName,
        biography,
        profileImage
      };
      
      const hasChanged = JSON.stringify(currentValues) !== JSON.stringify(initialValues);
      setHasChanges(hasChanged);
    }
  }, [firstName, lastName, biography, profileImage, initialValues]);

  const handleImageUpdate = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl);
    onImageUpdate(imageUrl);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    const currentValues = form.getValues();
    try {
      await onSave(currentValues);
      // Update initial values after successful save
      setInitialValues(currentValues);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving general info:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>General Information</CardTitle>
        {isEditing && onSave && (
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            variant={hasChanges ? "default" : "outline"}
            size="sm"
            className={hasChanges ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {hasChanges && isEditing && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              You have unsaved changes. Please save your changes to avoid losing them.
            </p>
          </div>
        )}
        
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
