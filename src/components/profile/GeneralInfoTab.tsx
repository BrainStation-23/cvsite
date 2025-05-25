import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ProfileImageUpload } from './ProfileImageUpload';
import { User, FileText } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Profile Image Section */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <User className="h-5 w-5 text-cvsite-teal" />
            Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <ProfileImageUpload
            currentImageUrl={profileImage}
            profileId={profileId}
            onImageUpdate={handleImageUpdate}
            isEditing={isEditing}
            userName={userName}
          />
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-cvsite-teal" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        First Name
                      </FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <Input
                            {...field}
                            className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-cvsite-teal focus:ring-2 focus:ring-cvsite-teal/20 rounded-lg transition-all duration-200"
                            placeholder="Enter your first name"
                          />
                        ) : (
                          <div className="h-12 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center">
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {field.value || 'Not provided'}
                            </span>
                          </div>
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
                      <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        {isEditing ? (
                          <Input
                            {...field}
                            className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-cvsite-teal focus:ring-2 focus:ring-cvsite-teal/20 rounded-lg transition-all duration-200"
                            placeholder="Enter your last name"
                          />
                        ) : (
                          <div className="h-12 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center">
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {field.value || 'Not provided'}
                            </span>
                          </div>
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
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Professional Biography
                    </FormLabel>
                    <FormControl>
                      {isEditing ? (
                        <Textarea
                          {...field}
                          rows={5}
                          className="border-2 border-gray-200 dark:border-gray-600 focus:border-cvsite-teal focus:ring-2 focus:ring-cvsite-teal/20 rounded-lg transition-all duration-200 resize-none"
                          placeholder="Tell us about your professional background, experience, and goals..."
                        />
                      ) : (
                        <div className="min-h-[120px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                            {field.value || 'No biography provided yet. Click "Edit Profile" to add your professional story.'}
                          </p>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
