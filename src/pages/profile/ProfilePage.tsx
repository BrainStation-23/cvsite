
import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/use-profile';
import { Skill } from '@/types';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1 });
  
  const {
    isLoading,
    isSaving,
    generalInfo,
    technicalSkills,
    specializedSkills,
    saveGeneralInfo,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill
  } = useProfile();

  const form = useForm({
    defaultValues: {
      firstName: generalInfo.firstName,
      lastName: generalInfo.lastName,
      designation: generalInfo.designation || '',
      biography: generalInfo.biography || ''
    }
  });

  // Update form values when profile data changes
  React.useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName,
        lastName: generalInfo.lastName,
        designation: generalInfo.designation || '',
        biography: generalInfo.biography || ''
      });
    }
  }, [isLoading, generalInfo, form.reset]);

  const handleUpdateProfile = async (data: {
    firstName: string;
    lastName: string;
    designation: string;
    biography: string;
  }) => {
    const success = await saveGeneralInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      designation: data.designation || null,
      biography: data.biography || null
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAddTechnicalSkill = async () => {
    if (!newTechnicalSkill.name) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive"
      });
      return;
    }

    const success = await saveTechnicalSkill(newTechnicalSkill as Skill);
    if (success) {
      setNewTechnicalSkill({ name: '', proficiency: 1 });
    }
  };

  const handleAddSpecializedSkill = async () => {
    if (!newSpecializedSkill.name) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive"
      });
      return;
    }

    const success = await saveSpecializedSkill(newSpecializedSkill as Skill);
    if (success) {
      setNewSpecializedSkill({ name: '', proficiency: 1 });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">My Profile</h1>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              onClick={form.handleSubmit(handleUpdateProfile)}
              variant="default"
              disabled={isSaving || isLoading}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              onClick={() => setIsEditing(false)}
              variant="outline"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading profile information...</p>
        </div>
      ) : (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General Information</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input
                                {...field}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50"
                              />
                            ) : (
                              <div className="mt-1 text-gray-900 dark:text-gray-100">{field.value || "Not specified"}</div>
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
                        <FormItem className="md:col-span-2">
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
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Technical Skills</CardTitle>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-8" 
                      onClick={handleAddTechnicalSkill} disabled={!newTechnicalSkill.name}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Skill
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing && (
                    <div className="mb-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Input
                          placeholder="Skill name"
                          value={newTechnicalSkill.name}
                          onChange={(e) => setNewTechnicalSkill({...newTechnicalSkill, name: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm">Proficiency:</span>
                        <div className="flex flex-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setNewTechnicalSkill({...newTechnicalSkill, proficiency: i + 1})}
                              className={`w-6 h-6 rounded mx-0.5 transition-colors ${
                                i < newTechnicalSkill.proficiency 
                                  ? 'bg-cvsite-teal' 
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {technicalSkills.length > 0 ? (
                    <ul className="space-y-2">
                      {technicalSkills.map((skill) => (
                        <li key={skill.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span>{skill.name}</span>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-8 w-8 p-0"
                                onClick={() => deleteTechnicalSkill(skill.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i}
                                className={`w-6 h-6 rounded ${
                                  i < skill.proficiency 
                                    ? 'bg-cvsite-teal' 
                                    : 'bg-gray-200 dark:bg-gray-700'
                                } mx-0.5`}
                              />
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No technical skills added yet.
                      {isEditing && ' Fill in the form above to add your skills.'}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Specialized Skills</CardTitle>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-8" 
                      onClick={handleAddSpecializedSkill} disabled={!newSpecializedSkill.name}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Skill
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing && (
                    <div className="mb-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Input
                          placeholder="Skill name"
                          value={newSpecializedSkill.name}
                          onChange={(e) => setNewSpecializedSkill({...newSpecializedSkill, name: e.target.value})}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm">Proficiency:</span>
                        <div className="flex flex-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setNewSpecializedSkill({...newSpecializedSkill, proficiency: i + 1})}
                              className={`w-6 h-6 rounded mx-0.5 transition-colors ${
                                i < newSpecializedSkill.proficiency 
                                  ? 'bg-cvsite-teal' 
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {specializedSkills.length > 0 ? (
                    <ul className="space-y-2">
                      {specializedSkills.map((skill) => (
                        <li key={skill.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span>{skill.name}</span>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-8 w-8 p-0"
                                onClick={() => deleteSpecializedSkill(skill.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i}
                                className={`w-6 h-6 rounded ${
                                  i < skill.proficiency 
                                    ? 'bg-cvsite-teal' 
                                    : 'bg-gray-200 dark:bg-gray-700'
                                } mx-0.5`}
                              />
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No specialized skills added yet.
                      {isEditing && ' Fill in the form above to add your skills.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Work Experience</CardTitle>
                  {isEditing && (
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Experience
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No work experience added yet. 
                  {isEditing && ' Click "Add Experience" to add your work history.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Education</CardTitle>
                  {isEditing && (
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Education
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No education history added yet. 
                  {isEditing && ' Click "Add Education" to add your educational background.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Training & Certifications</CardTitle>
                  {isEditing && (
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Training
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No training or certifications added yet. 
                  {isEditing && ' Click "Add Training" to add your certifications.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Achievements</CardTitle>
                  {isEditing && (
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Achievement
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No achievements added yet. 
                  {isEditing && ' Click "Add Achievement" to add your professional accomplishments.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Projects</CardTitle>
                  {isEditing && (
                    <Button variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Project
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No projects added yet. 
                  {isEditing && ' Click "Add Project" to add projects you\'ve worked on.'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;
