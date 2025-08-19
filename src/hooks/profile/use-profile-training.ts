
import { useTraining } from './use-training';

export function useProfileTraining(profileId?: string) {
  const {
    trainings,
    isLoading,
    isSaving,
    saveTraining,
    updateTraining,
    deleteTraining
  } = useTraining(profileId);

  return {
    trainings,
    isLoading,
    isSaving,
    saveTraining,
    updateTraining,
    deleteTraining
  };
}
