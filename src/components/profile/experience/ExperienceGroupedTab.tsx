import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { CompanyExperienceCard } from './CompanyExperienceCard';
import { useExperienceGrouped } from '@/hooks/profile/use-experience-grouped';
import { Experience } from '@/types';
import { ExperienceTourButton } from './ExperienceTourButton';

interface ExperienceGroupedTabProps {
  isEditing: boolean;
  isSaving: boolean;
  profileId?: string;
  onAddNew?: () => void;
  onEditExperience?: (experience: any) => void;
  onDeleteExperience?: (id: string) => Promise<boolean>;
}

export const ExperienceGroupedTab: React.FC<ExperienceGroupedTabProps> = ({
  isEditing,
  isSaving,
  profileId,
  onAddNew,
  onEditExperience,
  onDeleteExperience
}) => {
  const { groupedExperiences, isLoading, formatDuration, refetch } = useExperienceGrouped(profileId);

  const handleEditPosition = (position: any) => {
    // Convert position data to Experience format for editing
    const experience: Experience = {
      id: position.id,
      companyName: groupedExperiences.find(comp => 
        comp.positions.some(pos => pos.id === position.id)
      )?.company_name || '',
      designation: position.designation,
      description: position.description || '',
      startDate: new Date(position.start_date),
      endDate: position.end_date ? new Date(position.end_date) : undefined,
      isCurrent: position.is_current
    };
    onEditExperience?.(experience);
  };

  const handleDeletePosition = async (positionId: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      const success = await onDeleteExperience?.(positionId);
      if (success) {
        refetch();
      }
      return success || false;
    }
    return false;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <p>Loading experience information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle>Work Experience</CardTitle>
            <ExperienceTourButton />
          </div>
          {isEditing && (
            <Button variant="outline" onClick={onAddNew} data-tour="add-experience-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {groupedExperiences.length > 0 ? (
          <div className="space-y-6">
            {groupedExperiences.map((companyData, index) => (
              <CompanyExperienceCard
                key={`${companyData.company_name}-${index}`}
                companyData={companyData}
                isEditing={isEditing}
                formatDuration={formatDuration}
                onEditPosition={handleEditPosition}
                onDeletePosition={handleDeletePosition}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8" data-tour="experience-empty-state">
            No work experience added yet. 
            {isEditing && ' Click "Add Experience" to add your work history.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
