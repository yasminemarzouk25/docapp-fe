import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ErrorPageProps {
  statusCode: number;
  errorTitle: string;
  errorDescription: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode,
  errorTitle,
  errorDescription
}) => {
  const { t } = useTranslation();
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box textAlign="center" py={10} px={6} mt={16}>
      <Heading display="inline-block" as="h2" size="2xl" color={textColor}>
        {statusCode}
      </Heading>
      <Text fontSize="18px" mt={3} mb={2} color={textColor}>
        {errorTitle}
      </Text>
      <Text mb={6} color={descriptionColor}>
        {errorDescription}
      </Text>
      <Link to="/app">
        <Button
          colorScheme="blue"
          bgGradient="linear(to-r, #3182CE, #2B6CB0)"
          color="white"
          _hover={{ bgGradient: 'linear(to-r, #2B6CB0, #2B6CB0)' }}
          _focus={{ outline: 'none' }}
          variant="solid"
        >
          {t('errorPage.goToHomeBtn')}
        </Button>
      </Link>
    </Box>
  );
};

export default ErrorPage;
