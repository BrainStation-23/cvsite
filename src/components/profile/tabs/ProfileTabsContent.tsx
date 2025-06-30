
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { GeneralInfoTab } from '../generalInfo/GeneralInfoTab';
import { SkillsTab } from '../skills/SkillsTab';
import { ExperienceTab } from '../experience/ExperienceTab';
import { EducationTab } from '../education/EducationTab';
import { TrainingTab } from '../training/TrainingTab';
import { AchievementsTab } from '../achievements/AchievementsTab';
import { ProjectsTab } from '../projects/ProjectsTab';
import { ServerSideJSONImportExport } from '../importExport/ServerSideJSONImportExport';

interface ProfileTabsContentProps {
  profileId?: string;
  onDataChange?: () => void;
}

export const ProfileTabsContent: React.FC<ProfileTabsContentProps> = ({ 
  profileId, 
  onDataChange 
}) => {
  return (
    <>
      <TabsContent value="general" className="mt-6">
        <GeneralInfoTab profileId={profileId} />
      </TabsContent>

      <TabsContent value="skills" className="mt-6">
        <SkillsTab profileId={profileId} />
      </TabsContent>

      <TabsContent value="experience" className="mt-6">
        <ExperienceTab profileId={profileId} />
      </TabsContent>

      <TabsContent value="education" className="mt-6">
        <EducationTab profileId={profileId} />
      </TabsContent>

      <TabsContent value="training" className="mt-6">
        <TrainingTab profileId={profileId} />
      </TabsContent>

      <TabsContent value="achievements" className="mt-6">
        <AchievementsTab profileId={profileId} />
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
        <ProjectsTab profileId={profileId} />
      </TabsContent>

      <TabsContent value="import-export" className="mt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Import/Export Profile Data</h2>
            <p className="text-muted-foreground mb-6">
              Import or export your complete profile data as JSON. All operations are processed securely on the server.
            </p>
          </div>
          
          <ServerSideJSONImportExport 
            profileId={profileId}
            onImportSuccess={onDataChange}
          />
        </div>
      </TabsContent>
    </>
  );
};
