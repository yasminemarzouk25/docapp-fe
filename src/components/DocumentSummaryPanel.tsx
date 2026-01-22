import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  VStack,
  Button,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
  Icon,
  Spinner
} from '@chakra-ui/react';
import { PiMagicWandDuotone } from 'react-icons/pi';

interface DocumentSummaryPanelProps {
  summary: string | null;
  isSummarizing: boolean;
  summaryError: string | null;
  isMobile: boolean;
  onSummarize: () => void;
  isDisabled?: boolean;
}

const DocumentSummaryPanel: React.FC<DocumentSummaryPanelProps> = ({
  summary,
  isSummarizing,
  summaryError,
  isMobile,
  onSummarize,
  isDisabled = false
}) => {
  const { t } = useTranslation();

  const summaryIconBtnColor = useColorModeValue('blue.500', 'blue.400');
  const summaryBtnColor = useColorModeValue('blue.400', 'blue.500');
  const summaryBtnHover = useColorModeValue('blue.500', 'blue.600');

  // Generate Document Summary
  const summeryCardBorderColor = useColorModeValue('gray.200', 'gray.500');
  const generateTitle = useColorModeValue('gray.700', 'gray.200');
  const generateDesc = useColorModeValue('gray.500', 'gray.400');

  const summaryContainerBg = useColorModeValue('gray.50', 'gray.800');
  const summaryContainerBorderColor = useColorModeValue('gray.200', 'gray.700');
  const summaryTextColor = useColorModeValue('gray.700', 'gray.200');

  const renderFormattedSummary = (summary: string) => {
    // Split by line, preserve empty lines
    return summary.split('\n').map((line, idx) => {
      // If the line is empty, render a <br />
      if (line.trim() === '') {
        return <br key={idx} />;
      }
      // Replace **bold** with <b>bold</b>
      const parts = [];
      let lastIdx = 0;
      const boldRegex = /\*\*(.+?)\*\*/g;
      let match;
      let partIdx = 0;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) {
          parts.push(line.substring(lastIdx, match.index));
        }
        parts.push(<b key={`b-${idx}-${partIdx++}`}>{match[1]}</b>);
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < line.length) {
        parts.push(line.substring(lastIdx));
      }

      return (
        <span key={idx}>
          {parts.length > 0 ? parts : line}
          <br />
        </span>
      );
    });
  };

  return (
    <Box
      minH={isMobile ? '400px' : '500px'}
      border="1px"
      borderColor={summeryCardBorderColor}
      overflowY="hidden"
      borderRadius="md"
    >
      {!summary && !isSummarizing && !summaryError && (
        <VStack spacing={6} justify="center" h="400px">
          <Icon
            as={PiMagicWandDuotone}
            w={16}
            h={16}
            color={summaryIconBtnColor}
          />
          <VStack spacing={3}>
            <Text fontSize="xl" fontWeight="semibold" color={generateTitle}>
              {t('validateRequest.noSummary')}
            </Text>
            <Text
              fontSize="md"
              color={generateDesc}
              textAlign="center"
              maxW="400px"
            >
              {t('validateRequest.noSummaryDesc')}
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={PiMagicWandDuotone} />}
            bg={summaryBtnColor}
            color="white"
            _hover={{ bg: summaryBtnHover }}
            size={{ base: 'md', md: 'lg' }}
            fontSize={{ base: 'md', md: 'lg' }}
            px={{ base: 6, md: 8 }}
            py={{ base: 3, md: 4 }}
            minW={{ base: '140px', md: '180px' }}
            onClick={onSummarize}
            borderRadius="lg"
            fontWeight="semibold"
            _active={{ transform: 'scale(0.98)' }}
            isDisabled={isDisabled}
          >
            {t('validateRequest.generateSummary')}
          </Button>
        </VStack>
      )}

      {isSummarizing && (
        <VStack spacing={6} justify="center" h="400px">
          <Spinner size="xl" color={summaryBtnColor} thickness="4px" />
          <VStack spacing={2}>
            <Text fontSize="lg" fontWeight="semibold" color={summaryBtnColor}>
              {t('validateRequest.summarizing')}
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              {t('validateRequest.summarizingDesc')}
            </Text>
          </VStack>
        </VStack>
      )}

      {summaryError && (
        <VStack spacing={6} justify="center" h="400px">
          <Alert status="error" borderRadius="md" maxW="400px">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">
                {t('validateRequest.summaryErrorTitle')}
              </Text>
              <Text fontSize="sm">{summaryError}</Text>
            </VStack>
          </Alert>
          <Button
            leftIcon={<Icon as={PiMagicWandDuotone} />}
            bg={summaryBtnColor}
            color="white"
            _hover={{ bg: summaryBtnHover }}
            onClick={onSummarize}
            isDisabled={isDisabled}
          >
            {t('validateRequest.retryGeneration')}
          </Button>
        </VStack>
      )}

      {summary && (
        <Box
          bg={summaryContainerBg}
          border="1px"
          borderColor={summaryContainerBorderColor}
          borderRadius="lg"
          p={6}
          maxH={isMobile ? '400px' : '500px'}
          overflowY="auto"
        >
          <Text fontSize="md" lineHeight="1.7" color={summaryTextColor}>
            {renderFormattedSummary(summary)}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default DocumentSummaryPanel;
