import i18n from 'i18next';

export interface WorkflowStep {
  title: string;
  description: string;
  backendSteps: BackendStep[];
}

export enum BackendStep {
  _CREATED = 'Created',
  _GENERATED = 'Generated',
  _ASSIGNED_TO_REVIEWER = 'AssignedToReviewer',
  _REVIEWED = 'Reviewed',
  _SIGNED = 'Signed',
  _COLLECTED = 'Collected'
}
const {
  _CREATED,
  _GENERATED,
  _ASSIGNED_TO_REVIEWER,
  _REVIEWED,
  _SIGNED,
  _COLLECTED
} = BackendStep;

export const getSteps = () => {
  const ALL_STEPS: WorkflowStep[] = [
    {
      title: 'Created',
      description: i18n.t('workflowProgress.created'),
      backendSteps: [_CREATED]
    },
    {
      title: 'Generated',
      description: i18n.t('workflowProgress.generated'),
      backendSteps: [_GENERATED]
    },
    {
      title: 'In Review',
      description: i18n.t('workflowProgress.inReview'),
      backendSteps: [_ASSIGNED_TO_REVIEWER, _REVIEWED]
    },
    {
      title: 'Signed',
      description: i18n.t('workflowProgress.signed'),
      backendSteps: [_SIGNED]
    },
    {
      title: 'Collected',
      description: i18n.t('workflowProgress.collected'),
      backendSteps: [_COLLECTED]
    }
  ];

  return ALL_STEPS;
};

// HR Administrative Documents workflow steps
export const getHrSteps = () => {
  const HR_STEPS: WorkflowStep[] = [
    {
      title: 'Created',
      description: i18n.t('workflowProgress.created'),
      backendSteps: [_CREATED]
    },
    {
      title: 'Generated',
      description: i18n.t('workflowProgress.generated'),
      backendSteps: [_GENERATED]
    },
    {
      title: 'Scanned',
      description: i18n.t('workflowProgress.scanned'),
      backendSteps: [_SIGNED]
    },
    {
      title: 'Collected',
      description: i18n.t('workflowProgress.collected'),
      backendSteps: [_COLLECTED]
    }
  ];

  return HR_STEPS;
};
