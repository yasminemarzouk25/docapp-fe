import React from 'react';
import { Stack, Stepper, useColorModeValue, useSteps } from '@chakra-ui/react';
import StepItem from './StepItem';
import { Status } from '../types/Request';
import type { BackendStep, WorkflowStep } from '../types/Workflow';

interface ProgressWorkflowProps {
  steps: WorkflowStep[];
  currentStep: BackendStep;
  status: Status;
  isArabic: boolean;
  isMobile: boolean;
}

const ProgressWorkflow: React.FC<ProgressWorkflowProps> = ({
  steps,
  currentStep,
  status,
  isArabic,
  isMobile
}) => {
  // Determine currentStepNumber by checking the existence of the currentStep in the steps array in backendSteps
  const currentStepNumber = steps.findIndex((step) =>
    step.backendSteps.includes(currentStep)
  );
  const { activeStep } = useSteps({
    index: currentStepNumber,
    count: steps.length
  });

  const activeStepColor = useColorModeValue('blue.400', 'blue.500');
  const completedColor = useColorModeValue('green.500', 'green.300');
  const inactiveColor = useColorModeValue('gray.400', 'gray.600');
  const rejectedColor = useColorModeValue('red.500', 'red.300');
  const pendingColor = useColorModeValue('orange.500', 'orange.300');

  const getStepColor = (index: number) => {
    if (index < currentStepNumber) {
      return completedColor;
    }

    if (index > currentStepNumber) {
      return inactiveColor;
    }

    if (index + 1 === 3) {
      // For InReview step
      switch (status) {
        case Status._APPROVED:
          return completedColor;
        case Status._REJECTED:
          return rejectedColor;
        default:
          return pendingColor;
      }
    }

    return index === currentStepNumber ? activeStepColor : inactiveColor;
  };

  return (
    <Stack>
      <Stepper
        index={activeStep}
        p={isMobile ? '3' : '2'}
        size="sm"
        colorScheme="green"
        dir={isArabic ? 'rtl' : 'ltr'}
        justifyContent={isMobile ? 'center' : undefined}
      >
        {isMobile ? (
          <StepItem
            index={currentStepNumber}
            currentStep={currentStepNumber}
            status={status}
            isArabic={isArabic}
            step={steps[currentStepNumber]}
            getStepColor={getStepColor}
          />
        ) : (
          steps.map((step, index) => (
            <StepItem
              key={index}
              index={index}
              currentStep={currentStepNumber}
              status={status}
              isArabic={isArabic}
              step={step}
              getStepColor={getStepColor}
            />
          ))
        )}
      </Stepper>
    </Stack>
  );
};

export default ProgressWorkflow;
