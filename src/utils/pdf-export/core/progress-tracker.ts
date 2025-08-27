
import { ProgressStep } from '../ui/ProgressDialog';

export interface ProgressCallback {
  (steps: ProgressStep[], progress: number): void;
}

export class ProgressTracker {
  private steps: ProgressStep[] = [
    { id: 'fetch-employee', label: 'Fetching employee data...', isComplete: false, isActive: false },
    { id: 'fetch-template', label: 'Loading CV template...', isComplete: false, isActive: false },
    { id: 'process-template', label: 'Processing template with employee data...', isComplete: false, isActive: false },
    { id: 'prepare-pdf', label: 'Preparing PDF export...', isComplete: false, isActive: false },
    { id: 'puppeteer-service', label: 'Generating PDF with service...', isComplete: false, isActive: false },
    { id: 'finalize', label: 'Finalizing download...', isComplete: false, isActive: false },
    { id: 'complete', label: 'Complete!', isComplete: false, isActive: false }
  ];

  private callback?: ProgressCallback;
  private currentStepIndex = -1;
  private usingFallback = false;

  constructor(callback?: ProgressCallback) {
    this.callback = callback;
  }

  setCallback(callback: ProgressCallback) {
    this.callback = callback;
  }

  enableFallbackMode() {
    if (!this.usingFallback) {
      this.usingFallback = true;
      // Update puppeteer-service step to show fallback
      const puppeteerStepIndex = this.steps.findIndex(step => step.id === 'puppeteer-service');
      if (puppeteerStepIndex !== -1) {
        this.steps[puppeteerStepIndex].label = 'Service unavailable, using fallback...';
        this.steps[puppeteerStepIndex].isComplete = true;
        this.steps[puppeteerStepIndex].isActive = false;
      }
      
      // Add fallback step if not exists
      const fallbackStepExists = this.steps.some(step => step.id === 'fallback-pdf');
      if (!fallbackStepExists) {
        const finalizeIndex = this.steps.findIndex(step => step.id === 'finalize');
        this.steps.splice(finalizeIndex, 0, {
          id: 'fallback-pdf',
          label: 'Generating PDF locally...',
          isComplete: false,
          isActive: false
        });
      }
      
      this.notifyProgress();
    }
  }

  startStep(stepId: string) {
    const stepIndex = this.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    // Mark current step as active
    this.steps.forEach((step, index) => {
      step.isActive = index === stepIndex;
    });

    this.currentStepIndex = stepIndex;
    this.notifyProgress();
  }

  completeStep(stepId: string) {
    const stepIndex = this.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    // Mark step as complete and no longer active
    this.steps[stepIndex].isComplete = true;
    this.steps[stepIndex].isActive = false;

    this.notifyProgress();
  }

  completeAll() {
    this.steps.forEach(step => {
      step.isComplete = true;
      step.isActive = false;
    });
    this.notifyProgress();
  }

  reset() {
    this.steps = [
      { id: 'fetch-employee', label: 'Fetching employee data...', isComplete: false, isActive: false },
      { id: 'fetch-template', label: 'Loading CV template...', isComplete: false, isActive: false },
      { id: 'process-template', label: 'Processing template with employee data...', isComplete: false, isActive: false },
      { id: 'prepare-pdf', label: 'Preparing PDF export...', isComplete: false, isActive: false },
      { id: 'puppeteer-service', label: 'Generating PDF with service...', isComplete: false, isActive: false },
      { id: 'finalize', label: 'Finalizing download...', isComplete: false, isActive: false },
      { id: 'complete', label: 'Complete!', isComplete: false, isActive: false }
    ];
    this.currentStepIndex = -1;
    this.usingFallback = false;
    this.notifyProgress();
  }

  private calculateProgress(): number {
    const completedSteps = this.steps.filter(step => step.isComplete).length;
    const totalSteps = this.steps.length;
    return (completedSteps / totalSteps) * 100;
  }

  private notifyProgress() {
    if (this.callback) {
      this.callback([...this.steps], this.calculateProgress());
    }
  }

  getSteps(): ProgressStep[] {
    return [...this.steps];
  }

  getProgress(): number {
    return this.calculateProgress();
  }
}
