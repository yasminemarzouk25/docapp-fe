import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';

import ProgressWorkflow from './ProgressWorkflow';
import type { RequestResponse } from '../types/Request';
import { getSteps, getHrSteps } from '../types/Workflow';

interface WorkflowBoxProps {
  selectedRequest: RequestResponse | null;
  textColor: string;
  isArabic: boolean;
  isMobile: boolean | undefined;
  getWorkFlowBoxStyles: (_isMobile: boolean | undefined) => object;
  t: (_key: string) => string;
}

// * Component that either displays the workflow of a selected request or 'Select a request' placeholder message
const WorkflowBox: React.FC<WorkflowBoxProps> = ({
  selectedRequest,
  textColor,
  isArabic,
  isMobile,
  getWorkFlowBoxStyles,
  t
}) => {
  // Use HR workflow for administrative documents (employeeRequestable === false)
  const isHrDocument = selectedRequest?.employeeRequestable === false;
  const steps = isHrDocument ? getHrSteps() : getSteps();

  return selectedRequest ? (
    <Box
      color={textColor}
      textAlign="center"
      borderRadius="md"
      border="2px dashed"
      borderRight="none"
      borderLeft="none"
      {...getWorkFlowBoxStyles(isMobile)}
    >
      <ProgressWorkflow
        steps={steps}
        currentStep={selectedRequest.workflowStep}
        status={selectedRequest.status}
        isArabic={isArabic}
        isMobile={isMobile || false}
      />
    </Box>
  ) : (
    <Box
      p={4}
      height={isMobile ? '120px' : '90px'}
      color={textColor}
      textAlign="center"
      borderRadius="md"
      border="2px dashed"
      borderRight="none"
      borderLeft="none"
    >
      <TimeIcon mx={1} fontSize={23} my={1} />
      <Text fontSize="lg">{t('requestList.workflowPlaceholder')}</Text>
    </Box>
  );
};

export default WorkflowBox;
