
import { ValidationProgress } from '../../types';

export class ProgressManager {
  private setProgress: (progress: ValidationProgress[]) => void;
  private progressState: ValidationProgress[] = [];

  constructor(setProgress: (progress: ValidationProgress[]) => void) {
    this.setProgress = setProgress;
    this.initializeProgress();
  }

  private initializeProgress() {
    this.progressState = [
      {
        id: 'background',
        label: 'Analyzing background',
        status: 'pending'
      },
      {
        id: 'posture',
        label: 'Checking posture',
        status: 'pending'
      },
      {
        id: 'closeup',
        label: 'Validating image composition',
        status: 'pending'
      }
    ];
    this.setProgress([...this.progressState]);
  }

  updateProgress(
    stepId: string, 
    status: 'pending' | 'running' | 'completed' | 'failed',
    passed?: boolean,
    details?: string,
    subtaskId?: string
  ) {
    const stepIndex = this.progressState.findIndex(step => step.id === stepId);
    
    if (stepIndex !== -1) {
      this.progressState[stepIndex] = {
        ...this.progressState[stepIndex],
        status,
        passed,
        details
      };
      
      this.setProgress([...this.progressState]);
    }
  }
}
