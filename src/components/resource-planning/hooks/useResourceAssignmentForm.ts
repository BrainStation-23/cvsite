import { useState, useEffect, useCallback, useMemo } from 'react';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  release_date: string;
  engagement_start_date: string;
  bill_type: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    project_name: string;
  } | null;
}

interface UseResourceAssignmentFormProps {
  mode: 'create' | 'edit';
  preselectedProfileId?: string | null;
  item?: ResourcePlanningData;
}

export const useResourceAssignmentForm = ({
  mode,
  preselectedProfileId,
  item,
}: UseResourceAssignmentFormProps) => {
  // Memoize initial values to prevent unnecessary re-initialization
  const initialValues = useMemo(() => ({
    profileId: mode === 'edit' ? item?.profile_id : preselectedProfileId,
    billTypeId: item?.bill_type?.id || null,
    projectId: item?.project?.id || null,
    engagementPercentage: item?.engagement_percentage || 100,
    releaseDate: item?.release_date || '',
    engagementStartDate: item?.engagement_start_date || '',
  }), [mode, item?.profile_id, item?.bill_type?.id, item?.project?.id, item?.engagement_percentage, item?.release_date, item?.engagement_start_date, preselectedProfileId]);

  const [profileId, setProfileId] = useState<string | null>(initialValues.profileId || null);
  const [billTypeId, setBillTypeId] = useState<string | null>(initialValues.billTypeId);
  const [projectId, setProjectId] = useState<string | null>(initialValues.projectId);
  const [engagementPercentage, setEngagementPercentage] = useState<number>(initialValues.engagementPercentage);
  const [releaseDate, setReleaseDate] = useState<string>(initialValues.releaseDate);
  const [engagementStartDate, setEngagementStartDate] = useState<string>(initialValues.engagementStartDate);

  // Create a key to track when we should reset the form
  const formKey = useMemo(() => {
    if (mode === 'edit' && item) {
      return `edit-${item.id}`;
    } else if (mode === 'create') {
      return `create-${preselectedProfileId || 'new'}`;
    }
    return 'default';
  }, [mode, item?.id, preselectedProfileId]);

  const [lastFormKey, setLastFormKey] = useState<string>(formKey);

  // Reset form when switching between different contexts
  useEffect(() => {
    if (formKey !== lastFormKey) {
      console.log('Form key changed, resetting form:', { formKey, lastFormKey, preselectedProfileId, mode });
      
      if (mode === 'edit' && item) {
        setProfileId(item.profile_id);
        setBillTypeId(item.bill_type?.id || null);
        setProjectId(item.project?.id || null);
        setEngagementPercentage(item.engagement_percentage);
        setReleaseDate(item.release_date || '');
        setEngagementStartDate(item.engagement_start_date || '');
      } else if (mode === 'create') {
        setProfileId(preselectedProfileId || null);
        setBillTypeId(null);
        setProjectId(null);
        setEngagementPercentage(100);
        setReleaseDate('');
        setEngagementStartDate('');
      }
      
      setLastFormKey(formKey);
    }
  }, [formKey, lastFormKey, mode, item, preselectedProfileId]);

  const resetForm = useCallback(() => {
    if (mode === 'create') {
      // Keep preselected profile if it exists, otherwise clear it
      if (!preselectedProfileId) {
        setProfileId(null);
      }
      setBillTypeId(null);
      setProjectId(null);
      setEngagementPercentage(100);
      setReleaseDate('');
      setEngagementStartDate('');
    }
  }, [mode, preselectedProfileId]);

  const getFormData = useCallback(() => ({
    profile_id: profileId!,
    bill_type_id: billTypeId || undefined,
    project_id: projectId || undefined,
    engagement_percentage: engagementPercentage,
    release_date: releaseDate || undefined,
    engagement_start_date: engagementStartDate || undefined,
  }), [profileId, billTypeId, projectId, engagementPercentage, releaseDate, engagementStartDate]);

  return {
    profileId,
    setProfileId,
    billTypeId,
    setBillTypeId,
    projectId,
    setProjectId,
    engagementPercentage,
    setEngagementPercentage,
    releaseDate,
    setReleaseDate,
    engagementStartDate,
    setEngagementStartDate,
    resetForm,
    getFormData,
  };
};
