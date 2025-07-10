
import { useState, useEffect } from 'react';

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
  const [profileId, setProfileId] = useState<string | null>(
    preselectedProfileId || item?.profile_id || null
  );
  const [billTypeId, setBillTypeId] = useState<string | null>(
    item?.bill_type?.id || null
  );
  const [projectId, setProjectId] = useState<string | null>(
    item?.project?.id || null
  );
  const [engagementPercentage, setEngagementPercentage] = useState<number>(
    item?.engagement_percentage || 100
  );
  const [releaseDate, setReleaseDate] = useState<string>(
    item?.release_date || ''
  );
  const [engagementStartDate, setEngagementStartDate] = useState<string>(
    item?.engagement_start_date || ''
  );

  // Update form when preselectedProfileId changes
  useEffect(() => {
    if (preselectedProfileId && mode === 'create') {
      setProfileId(preselectedProfileId);
    }
  }, [preselectedProfileId, mode]);

  // Update form when item changes (for edit mode)
  useEffect(() => {
    if (item && mode === 'edit') {
      setProfileId(item.profile_id);
      setBillTypeId(item.bill_type?.id || null);
      setProjectId(item.project?.id || null);
      setEngagementPercentage(item.engagement_percentage);
      setReleaseDate(item.release_date || '');
      setEngagementStartDate(item.engagement_start_date || '');
    }
  }, [item, mode]);

  const resetForm = () => {
    if (mode === 'create') {
      if (!preselectedProfileId) {
        setProfileId(null);
      }
      setBillTypeId(null);
      setProjectId(null);
      setEngagementPercentage(100);
      setReleaseDate('');
      setEngagementStartDate('');
    }
  };

  const getFormData = () => ({
    profile_id: profileId!,
    bill_type_id: billTypeId || undefined,
    project_id: projectId || undefined,
    engagement_percentage: engagementPercentage,
    release_date: releaseDate || undefined,
    engagement_start_date: engagementStartDate || undefined,
  });

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
