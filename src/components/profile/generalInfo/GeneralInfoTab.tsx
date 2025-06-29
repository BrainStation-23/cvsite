import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ProfileImageUpload } from './ProfileImageUpload';
import { DesignationCombobox } from '@/components/admin/designation/DesignationCombobox';
import { GeneralInfoTourButton } from './GeneralInfoTourButton';
import { Save } from 'lucide-react';

// Define this type consistently across all files
export interface GeneralInfoFormData {
  firstName: string;
  lastName: string;
  biography: string;
  profileImage?: string | null;
  currentDesignation?: string | null;
}

interface GeneralInfoTabProps {
  form: UseFormReturn<GeneralInfoFormData>;
  isEditing: boolean;
  profileId?: string;
  onImageUpdate: (imageUrl: string | null) => void;
  onSave?: (data: GeneralInfoFormData) => Promise<boolean>;
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
  // Use react-hook-form's built-in dirty/submitting state
  const { isDirty, isSubmitting } = form.formState;

  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const profileImage = form.watch('profileImage');
  
  const userName = `${firstName} ${lastName}`.trim() || 'User';


  const handleImageUpdate = async (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl);
    onImageUpdate(imageUrl);
    if (onSave) {
      try {
        await onSave(form.getValues());
      } catch (error) {
        console.error('Error saving profile image to general info:', error);
      }
    }
  };


  const handleSave = async () => {
    if (!onSave) return;
    const currentValues = form.getValues();
    try {
      await onSave(currentValues);
      // react-hook-form will reset isDirty after a successful submission if you use reset()
    } catch (error) {
      console.error('Error saving general info:', error);
    }
  }; 

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle>General Information</CardTitle>
          <GeneralInfoTourButton />
        </div>
        {isEditing && onSave && (
          <Button 
            onClick={handleSave}
            disabled={!isDirty || isSaving || isSubmitting}
            variant={isDirty ? "default" : "outline"}
            size="sm"
            className={isDirty ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving || isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isDirty && isEditing && (
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
                              data-tour="first-name-input"
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
                              data-tour="last-name-input"
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
                  name="currentDesignation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Designation</FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <div data-tour="designation-select">
                            <DesignationCombobox
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              placeholder="Select or add designation..."
                            />
                          </div>
                        ) : (
                          <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value || "No designation provided"}</div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            data-tour="biography"
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
