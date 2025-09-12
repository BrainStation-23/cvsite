
import { useReducer, useEffect, useCallback } from 'react';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  billing_percentage: number;
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

interface FormState {
  profileId: string | null;
  billTypeId: string | null;
  projectId: string | null;
  engagementPercentage: number;
  billingPercentage: number;
  releaseDate: string;
  engagementStartDate: string;
}

type FormAction =
  | { type: 'SET_PROFILE_ID'; payload: string | null }
  | { type: 'SET_BILL_TYPE_ID'; payload: string | null }
  | { type: 'SET_PROJECT_ID'; payload: string | null }
  | { type: 'SET_ENGAGEMENT_PERCENTAGE'; payload: number }
  | { type: 'SET_BILLING_PERCENTAGE'; payload: number }
  | { type: 'SET_RELEASE_DATE'; payload: string }
  | { type: 'SET_ENGAGEMENT_START_DATE'; payload: string }
  | { type: 'RESET_FORM'; payload: Partial<FormState> }
  | { type: 'INITIALIZE_FORM'; payload: FormState };

const initialState: FormState = {
  profileId: null,
  billTypeId: null,
  projectId: null,
  engagementPercentage: 100,
  billingPercentage: 0,
  releaseDate: '',
  engagementStartDate: '',
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_PROFILE_ID':
      return { ...state, profileId: action.payload };
    case 'SET_BILL_TYPE_ID':
      return { ...state, billTypeId: action.payload };
    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.payload };
    case 'SET_ENGAGEMENT_PERCENTAGE':
      return { ...state, engagementPercentage: action.payload };
    case 'SET_BILLING_PERCENTAGE':
      return { ...state, billingPercentage: action.payload };
    case 'SET_RELEASE_DATE':
      return { ...state, releaseDate: action.payload };
    case 'SET_ENGAGEMENT_START_DATE':
      return { ...state, engagementStartDate: action.payload };
    case 'RESET_FORM':
      return { ...initialState, ...action.payload };
    case 'INITIALIZE_FORM':
      return action.payload;
    default:
      return state;
  }
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
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Initialize form based on mode
  useEffect(() => {
    if (mode === 'edit' && item) {
      dispatch({
        type: 'INITIALIZE_FORM',
        payload: {
          profileId: item.profile_id,
          billTypeId: item.bill_type?.id || null,
          projectId: item.project?.id || null,
              engagementPercentage: item.engagement_percentage,
          billingPercentage: item.billing_percentage || 0,
          releaseDate: item.release_date || '',
          engagementStartDate: item.engagement_start_date || '',
        },
      });
    } else if (mode === 'create') {
      dispatch({
        type: 'RESET_FORM',
        payload: {
          profileId: preselectedProfileId || null,
        },
      });
    }
  }, [mode, item, preselectedProfileId]);

  // Action creators
  const setProfileId = useCallback((value: string | null) => {
    dispatch({ type: 'SET_PROFILE_ID', payload: value });
  }, []);

  const setBillTypeId = useCallback((value: string | null) => {
    dispatch({ type: 'SET_BILL_TYPE_ID', payload: value });
  }, []);

  const setProjectId = useCallback((value: string | null) => {
    dispatch({ type: 'SET_PROJECT_ID', payload: value });
  }, []);

  const setEngagementPercentage = useCallback((value: number) => {
    dispatch({ type: 'SET_ENGAGEMENT_PERCENTAGE', payload: value });
  }, []);

  const setBillingPercentage = useCallback((value: number) => {
    dispatch({ type: 'SET_BILLING_PERCENTAGE', payload: value });
  }, []);

  const setReleaseDate = useCallback((value: string) => {
    dispatch({ type: 'SET_RELEASE_DATE', payload: value });
  }, []);

  const setEngagementStartDate = useCallback((value: string) => {
    dispatch({ type: 'SET_ENGAGEMENT_START_DATE', payload: value });
  }, []);

  const resetForm = useCallback(() => {
    if (mode === 'create') {
      dispatch({
        type: 'RESET_FORM',
        payload: {
          profileId: preselectedProfileId || null,
        },
      });
    }
  }, [mode, preselectedProfileId]);

  const getFormData = useCallback(() => ({
    profile_id: state.profileId!,
    bill_type_id: state.billTypeId || undefined,
    project_id: state.projectId || undefined,
    engagement_percentage: state.engagementPercentage,
    billing_percentage: state.billingPercentage,
    release_date: state.releaseDate || undefined,
    engagement_start_date: state.engagementStartDate || undefined,
  }), [state]);

  return {
    profileId: state.profileId,
    setProfileId,
    billTypeId: state.billTypeId,
    setBillTypeId,
    projectId: state.projectId,
    setProjectId,
    engagementPercentage: state.engagementPercentage,
    setEngagementPercentage,
    billingPercentage: state.billingPercentage,
    setBillingPercentage,
    releaseDate: state.releaseDate,
    setReleaseDate,
    engagementStartDate: state.engagementStartDate,
    setEngagementStartDate,
    resetForm,
    getFormData,
  };
};
