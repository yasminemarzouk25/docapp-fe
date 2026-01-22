import React from 'react';
import { Box, Step, StepSeparator, StepTitle } from '@chakra-ui/react';
import CustomStepIndicator from './CustomStepIndicator';
import type { WorkflowStep } from '../types/Workflow';
import type { Status } from '../types/Request';

interface StepItemProps {
  index: number;
  currentStep: number;
  status: Status;
  isArabic: boolean;
  step: WorkflowStep;
  getStepColor: (_index: number) => string;
}

const StepItem: React.FC<StepItemProps> = ({
  index,
  currentStep,
  status,
  isArabic,
  step,
  getStepColor
}) => {
  return (
    <Step
      style={{
        cursor: index <= currentStep ? 'auto' : 'not-allowed'
      }}
    >
      <CustomStepIndicator
        index={index}
        currentStep={currentStep}
        status={status}
      />
      <Box
        flexShrink="0"
        p={2}
        borderRadius="md"
        dir={isArabic ? 'rtl' : 'ltr'}
        color={getStepColor(index)}
      >
        <StepTitle
          style={{
            fontSize: '16px',
            fontWeight: index === currentStep ? 'bold' : 'normal'
          }}
        >
          {step.title}
        </StepTitle>
        <Box fontSize="14px">{step.description}</Box>
      </Box>
      <StepSeparator />
    </Step>
  );
};

export default StepItem;
