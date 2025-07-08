
import { ValidationProgress } from '../../types';

export class ProgressManager {
  private progress: ValidationProgress[] = [];
  private updateCallback: (progress: ValidationProgress[]) => void;

  constructor(updateCallback: (progress: ValidationProgress[]) => void) {
    this.updateCallback = updateCallback;
    this.initializeProgress();
  }

  private initializeProgress() {
    this.progress = [
      { id: 'background', label: 'Checking background quality', status: 'pending' },
      { id: 'posture', label: 'Analyzing posture and positioning', status: 'pending' },
      { id: 'closeup', label: 'Checking if image is a close-up shot', status: 'pending' },
      { id: 'expression', label: 'Analyzing facial expression', status: 'pending' },
      {
        id: 'azure',
        label: 'Verifying facial features and composition',
        status: 'pending',
        subtasks: [
          { id: 'not_group', label: 'Not a group photo', status: 'pending' },
          { id: 'face_centered', label: 'Face is centered', status: 'pending' },
          { id: 'no_accessories', label: 'No sunglasses or hat', status: 'pending' },
        ]
      },
    ];
    this.updateCallback([...this.progress]);
  }

  updateProgress(
    id: string,
    status: ValidationProgress['status'],
    passed?: boolean,
    details?: string,
    subtaskId?: string
  ) {
    this.progress = this.progress.map(item => {
      if (item.id !== id) return item;
      
      if (subtaskId && item.subtasks) {
        return {
          ...item,
          subtasks: item.subtasks.map(sub =>
            sub.id === subtaskId
              ? { ...sub, status, passed, details }
              : sub
          )
        };
      }
      
      return { ...item, status, passed, details };
    });
    
    this.updateCallback([...this.progress]);
  }
}
