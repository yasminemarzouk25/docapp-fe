import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface FormSectionProps {
  title: string;
  isMobile: boolean;
  darkLightColor: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  isMobile,
  darkLightColor
}) => (
  <Box my={isMobile ? 4 : 0}>
    <Text fontSize="md" fontWeight="semibold" color={darkLightColor}>
      {title}
    </Text>
    <Box display="flex" alignItems="center">
      <Box flex="1" borderBottom="1px solid #b7b7b7" />
      <Box flex={isMobile ? '4' : '1'} borderBottom="1px solid #E2E8F0" />
    </Box>
  </Box>
);

export default FormSection;
