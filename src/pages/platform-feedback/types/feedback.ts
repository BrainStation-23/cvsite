export type FeedbackType = 'bug' | 'feature';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface BaseFeedback {
  id?: string;
  type: FeedbackType;
  title: string;
  description?: string;
  status?: 'open' | 'in-review' | 'planned' | 'in-progress' | 'completed' | 'wont-fix';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: UserInfo;
}

export interface BugReport extends Omit<BaseFeedback, 'type'> {
  type: 'bug';
  pageUrl: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  environment?: {
    browser: string;
    os: string;
    device: string;
  };
}

export interface FeatureRequest extends Omit<BaseFeedback, 'type'> {
  type: 'feature';
  area: string;
  userStory: {
    as: string;
    want: string;
    soThat: string;
  };
  benefit: string;
  references?: string[];
}

export type Feedback = BugReport | FeatureRequest;
