
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

interface EmployeeGeneralInfo {
  firstName: string;
  lastName: string;
  biography: string | null;
  profileImage: string | null;
}

export function useEmployeeProfile(profileId: string) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [generalInfo, setGeneralInfo] = useState<EmployeeGeneralInfo>({
    firstName: '',
    lastName: '',
    biography: null,
    profileImage: null
  });
  const [technicalSkills, setTechnicalSkills] = useState<Skill[]>([]);
  const [specializedSkills, setSpecializedSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!profileId) return;

    const fetchEmployeeProfile = async () => {
      setIsLoading(true);
      
      try {
        // Fetch general information
        const { data: generalData, error: generalError } = await supabase
          .from('general_information')
          .select('*')
          .eq('profile_id', profileId)
          .maybeSingle();

        if (generalError) throw generalError;

        if (generalData) {
          setGeneralInfo({
            firstName: generalData.first_name || '',
            lastName: generalData.last_name || '',
            biography: generalData.biography,
            profileImage: generalData.profile_image
          });
        }

        // Fetch technical skills
        const { data: techSkillsData, error: techSkillsError } = await supabase
          .from('technical_skills')
          .select('*')
          .eq('profile_id', profileId);

        if (techSkillsError) throw techSkillsError;

        if (techSkillsData) {
          setTechnicalSkills(techSkillsData.map(skill => ({
            id: skill.id,
            name: skill.name,
            proficiency: skill.proficiency
          })));
        }

        // Fetch specialized skills
        const { data: specSkillsData, error: specSkillsError } = await supabase
          .from('specialized_skills')
          .select('*')
          .eq('profile_id', profileId);

        if (specSkillsError) throw specSkillsError;

        if (specSkillsData) {
          setSpecializedSkills(specSkillsData.map(skill => ({
            id: skill.id,
            name: skill.name,
            proficiency: skill.proficiency
          })));
        }

        // Fetch experiences
        const { data: expData, error: expError } = await supabase
          .from('experiences')
          .select('*')
          .eq('profile_id', profileId)
          .order('start_date', { ascending: false });

        if (expError) throw expError;

        if (expData) {
          setExperiences(expData.map(exp => ({
            id: exp.id,
            companyName: exp.company_name,
            designation: exp.designation || '',
            description: exp.description || '',
            startDate: new Date(exp.start_date),
            endDate: exp.end_date ? new Date(exp.end_date) : undefined,
            isCurrent: exp.is_current || false
          })));
        }

        // Fetch education
        const { data: eduData, error: eduError } = await supabase
          .from('education')
          .select('*')
          .eq('profile_id', profileId)
          .order('start_date', { ascending: false });

        if (eduError) throw eduError;

        if (eduData) {
          setEducation(eduData.map(edu => ({
            id: edu.id,
            university: edu.university,
            degree: edu.degree || '',
            department: edu.department || undefined,
            gpa: edu.gpa || undefined,
            startDate: new Date(edu.start_date),
            endDate: edu.end_date ? new Date(edu.end_date) : undefined,
            isCurrent: edu.is_current || false
          })));
        }

        // Fetch trainings
        const { data: trainingData, error: trainingError } = await supabase
          .from('trainings')
          .select('*')
          .eq('profile_id', profileId)
          .order('certification_date', { ascending: false });

        if (trainingError) throw trainingError;

        if (trainingData) {
          setTrainings(trainingData.map(training => ({
            id: training.id,
            title: training.title,
            provider: training.provider,
            description: training.description || '',
            date: new Date(training.certification_date),
            certificateUrl: training.certificate_url
          })));
        }

        // Fetch achievements
        const { data: achievementData, error: achievementError } = await supabase
          .from('achievements')
          .select('*')
          .eq('profile_id', profileId)
          .order('date', { ascending: false });

        if (achievementError) throw achievementError;

        if (achievementData) {
          setAchievements(achievementData.map(achievement => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            date: new Date(achievement.date)
          })));
        }

        // Fetch projects
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('profile_id', profileId)
          .order('start_date', { ascending: false });

        if (projectError) throw projectError;

        if (projectData) {
          setProjects(projectData.map(project => ({
            id: project.id,
            name: project.name,
            role: project.role,
            description: project.description,
            startDate: new Date(project.start_date),
            endDate: project.end_date ? new Date(project.end_date) : undefined,
            isCurrent: project.is_current || false,
            technologiesUsed: project.technologies_used || [],
            url: project.url
          })));
        }

      } catch (error) {
        console.error('Error fetching employee profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load employee profile',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [profileId, toast]);

  return {
    isLoading,
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects
  };
}
