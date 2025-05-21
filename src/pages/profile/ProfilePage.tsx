
import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Sample profile data - would come from Supabase in a real app
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    designation: 'Software Engineer',
    biography: 'Experienced software engineer with a focus on web technologies.',
    technicalSkills: [
      { id: '1', name: 'JavaScript', proficiency: 5 },
      { id: '2', name: 'React', proficiency: 4 },
      { id: '3', name: 'Node.js', proficiency: 4 }
    ],
    specializedSkills: [
      { id: '1', name: 'UI/UX Design', proficiency: 3 },
      { id: '2', name: 'Project Management', proficiency: 4 }
    ]
  });

  const handleUpdateProfile = () => {
    // This would update the profile in Supabase
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
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
              onClick={handleUpdateProfile}
              variant="default"
            >
              Save Changes
            </Button>
            <Button 
              onClick={() => setIsEditing(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50" 
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      />
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{profile.firstName}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50" 
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      />
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{profile.lastName}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <div className="mt-1 text-gray-900 dark:text-gray-100">{profile.email}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50" 
                        value={profile.designation}
                        onChange={(e) => setProfile({...profile, designation: e.target.value})}
                      />
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{profile.designation}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Biography</label>
                    {isEditing ? (
                      <textarea 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cvsite-teal focus:ring focus:ring-cvsite-teal focus:ring-opacity-50" 
                        rows={4}
                        value={profile.biography}
                        onChange={(e) => setProfile({...profile, biography: e.target.value})}
                      />
                    ) : (
                      <div className="mt-1 text-gray-900 dark:text-gray-100">{profile.biography}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.technicalSkills.map((skill) => (
                    <li key={skill.id} className="flex items-center justify-between">
                      <span>{skill.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i}
                            className={`w-6 h-6 rounded ${i < skill.proficiency ? 'bg-cvsite-teal' : 'bg-gray-200 dark:bg-gray-700'} mx-0.5`}
                          />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                {isEditing && (
                  <Button variant="outline" className="mt-4">
                    Add Skill
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Specialized Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.specializedSkills.map((skill) => (
                    <li key={skill.id} className="flex items-center justify-between">
                      <span>{skill.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i}
                            className={`w-6 h-6 rounded ${i < skill.proficiency ? 'bg-cvsite-teal' : 'bg-gray-200 dark:bg-gray-700'} mx-0.5`}
                          />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                {isEditing && (
                  <Button variant="outline" className="mt-4">
                    Add Specialized Skill
                  </Button>
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
                  <Button variant="outline">Add Experience</Button>
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
                  <Button variant="outline">Add Education</Button>
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
                  <Button variant="outline">Add Training</Button>
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
                  <Button variant="outline">Add Achievement</Button>
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
                  <Button variant="outline">Add Project</Button>
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
    </DashboardLayout>
  );
};

export default ProfilePage;
