import React from 'react';
import {
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  useColorModeValue
} from '@chakra-ui/react';
import { Status } from '../types/Request';

interface CustomStepIndicatorProps {
  index: number;
  currentStep: number;
  status: Status;
}

type StepStatusType =
  | 'completed'
  | 'active'
  | 'inactive'
  | 'rejected'
  | 'pending';

const CustomStepIndicator: React.FC<CustomStepIndicatorProps> = ({
  index,
  currentStep,
  status
}) => {
  const colors = {
    completed: {
      bg: useColorModeValue('green.500', 'green.300'),
      text: 'white'
    },
    active: {
      bg: useColorModeValue('blue.300', 'blue.600'),
      text: useColorModeValue('white', 'black')
    },
    rejected: {
      bg: useColorModeValue('red.500', 'red.300'),
      text: useColorModeValue('white', 'black')
    },
    inactive: {
      bg: useColorModeValue('gray.400', 'gray.600'),
      text: useColorModeValue('gray.600', 'white')
    },
    pending: {
      bg: useColorModeValue('orange.500', 'orange.300'),
      text: useColorModeValue('white', 'black')
    }
  };

  const determineStepStatus = (): StepStatusType => {
    if (index < currentStep) {
      return 'completed';
    }

    if (index > currentStep) {
      return 'inactive';
    }

    if (index + 1 === 3) {
      switch (status) {
        case Status._APPROVED:
          return 'completed';
        case Status._REJECTED:
          return 'rejected';
        default:
          return 'pending';
      }
    }

    if (index === currentStep) {
      return 'active';
    }

    return 'inactive';
  };

  const stepStatus = determineStepStatus();
  const { bg, text } = colors[stepStatus];

  return (
    <StepIndicator
      backgroundColor={`${bg} !important`}
      borderColor={`${bg} !important`}
      color={text}
    >
      <StepStatus
        complete={<StepIcon />}
        incomplete={<StepNumber />}
        active={<StepNumber />}
      />
    </StepIndicator>
  );
};

export default CustomStepIndicator;
