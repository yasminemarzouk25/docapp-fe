import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  ButtonGroup,
  CloseButton,
  HStack,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { TabKey } from '../components/TabsComponent';
import PlaceholderInput from '../components/PlaceholderInput';
import ConfirmModal from '../components/ConfirmModal';

import { filledValueService } from '../services/filledValueService';
import { templateService } from '../services/templateService';
import { requestService } from '../services/requestService';

import useLoader from '../hooks/useLoader';
import useErrorHandler from '../hooks/useErrorHandler';
import type {
  FilledValue,
  FilledValueSingleItemsItem
} from '../types/FilledValue';
import type { TemplateSingle } from '../types/Template';

interface Params {
  [key: string]: string | undefined;
  requestId: string;
  templateId: string;
}

const renderTemplateContent = (
  content: string,
  placeholders: FilledValueSingleItemsItem[],
  handleChange: (_name: string, _value: string) => void
) => {
  const regex = /\[([^[\]]{1,100})\]/;

  return content.split(regex).map((item, index) => {
    const placeholder = placeholders.find(
      (fp) => fp.detectedPlaceholder.toLowerCase() === item.toLowerCase()
    );

    return placeholder ? (
      <PlaceholderInput
        key={index}
        placeholderName={placeholder.detectedPlaceholder}
        placeholderValue={placeholder.value}
        onChange={handleChange}
      />
    ) : (
      item
    );
  });
};

const GenerateDocument: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const darkLightColor = useColorModeValue('#012C4A', '#DDD');
  const goBackBtnColor = useColorModeValue('#38A169', '#2F855A');
  const saveBtnColor = useColorModeValue('gray.500', 'gray.400');
  const colorBorder = useColorModeValue('gray.100', 'gray.700');

  // Integrate get filled values by request ID
  const navigate = useNavigate();
  const { alert, setAlert, handleError } = useErrorHandler(t);
  const {
    isLoading: isFilledValueLoading,
    setIsLoading: setIsFilledValueLoading,
    Loader
  } = useLoader();

  const { isLoading: isTemplateLoading, setIsLoading: setIsTemplateLoading } =
    useLoader();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentTemplate, setRecentTemplate] = useState<TemplateSingle | null>();
  const [filledValues, setFilledValues] = useState<FilledValue | null>();

  const { requestId, templateId } = useParams<Params>();

  // Changed from single timeout to Map of timeouts for each field
  const [typingTimeouts, setTypingTimeouts] = useState<
    // eslint-disable-next-line no-undef
    Map<string, NodeJS.Timeout>
  >(new Map());

  const getFilledValueByRequestId = async () => {
    try {
      setIsFilledValueLoading(true);
      const data = await filledValueService.getByRequestId(requestId!);
      setFilledValues(data);
      if (data.templateId !== templateId) {
        setAlert({
          status: 'error',
          message:
            'The provided template ID does not match the expected template ID.'
        });
        navigate('/*');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsFilledValueLoading(false);
    }
  };

  const getTemplateById = async () => {
    try {
      setIsTemplateLoading(true);
      const template = await templateService.getById(templateId!);
      setRecentTemplate(template);
    } catch (error) {
      handleError(error);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  useEffect(() => {
    getFilledValueByRequestId();
    getTemplateById();

    return () => {
      setRecentTemplate(null);
      setFilledValues(null);
      setAlert(null);
    };
  }, [requestId, templateId]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      setTypingTimeouts(new Map());
    };
  }, []);

  const handleChange = async (name: string, value: string) => {
    // Update the state immediately
    setFilledValues((prev) => {
      if (!prev) return prev;
      const updatedItems = prev.items.map((item) => {
        if (item.detectedPlaceholder.toLowerCase() === name.toLowerCase()) {
          return { ...item, value };
        }

        return item;
      });

      return { ...prev, items: updatedItems };
    });

    // Clear the previous timeout for this specific field if it exists
    const fieldKey = name.toLowerCase();
    const existingTimeout = typingTimeouts.get(fieldKey);

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set a new timeout for this specific field
    const newTimeout = setTimeout(async () => {
      try {
        const { placeholderId, userFieldId } = getFilledValuePayload(
          recentTemplate!,
          name
        );

        // Only save if value is not empty
        if (value && value.trim() !== '') {
          await filledValueService.save(
            value,
            requestId!,
            placeholderId,
            userFieldId
          );
        }

        // Remove the timeout from the map since it has executed
        setTypingTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fieldKey);

          return newMap;
        });
      } catch (error) {
        handleError(error);
        // Remove the timeout from the map even if there was an error
        setTypingTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fieldKey);

          return newMap;
        });
      }
    }, 2000); // 2 seconds delay

    // Update the timeouts map with the new timeout
    setTypingTimeouts((prev) => {
      const newMap = new Map(prev);
      newMap.set(fieldKey, newTimeout);

      return newMap;
    });
  };

  // Function that receives a template and a detectedPlaceholder name and returns placeholderId or userFieldId
  const getFilledValuePayload = (
    template: TemplateSingle,
    name: string
  ): {
    placeholderId: string | null;
    userFieldId: string | null;
  } => {
    const placeholder = template?.relatedPlaceholders.find(
      (p) => p.detectedPlaceholder === name
    );

    const userField = template?.relatedUserFields.find(
      (u) => u.detectedPlaceholder === name
    );

    return {
      placeholderId: placeholder?.placeholderId || null,
      userFieldId: userField?.id || null
    };
  };

  const saveDocument = async () => {
    try {
      setIsSubmitting(true);
      await requestService.generate(requestId!);
      navigate('/app/requests?tab=' + TabKey._Assigned);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Box maxW="100%" w="100%" dir={dir} pt={4} mt={2}>
      <Heading as="h4" size="md" mb={6} color={darkLightColor}>
        {t('generateDocument.pageTitle')}
      </Heading>
      {alert && (
        <Alert
          status={alert.status}
          alignItems="flex-start"
          pt={2}
          mb={4}
          dir={dir}
        >
          <AlertIcon />
          {alert.message}
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setAlert(null)}
          />
        </Alert>
      )}
      {isTemplateLoading || isFilledValueLoading ? (
        <Loader />
      ) : (
        recentTemplate &&
        filledValues && (
          <>
            <TableContainer mb={4} maxWidth="100%">
              <Table
                variant="simple"
                border="1px"
                borderColor={colorBorder}
                overflow="auto"
              >
                <Thead background={colorBorder}>
                  {!isMobile && (
                    <Tr>
                      <Th>
                        <InfoIcon mx={1} />- {t('generateDocument.userName')}:
                      </Th>
                      <Th>
                        <InfoIcon mx={1} />- {t('generateDocument.requestN')} :
                      </Th>
                      <Th>
                        <InfoIcon mx={1} />-{' '}
                        {t('generateDocument.documentType')} :
                      </Th>
                      <Th>
                        <InfoIcon mx={1} />-{' '}
                        {t('generateDocument.dateCreation')} :
                      </Th>
                    </Tr>
                  )}
                </Thead>
                <Tbody>
                  {isMobile ? (
                    <Tr>
                      <Td p={2}>
                        <Box
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          <Text as="span" fontWeight="bold">
                            {t('generateDocument.userName')}:
                          </Text>
                          {filledValues.createdFor.fullname}
                        </Box>

                        <Box
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          <Text as="span" fontWeight="bold">
                            {t('generateDocument.requestN')} :
                          </Text>
                          -
                        </Box>

                        <Box
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          <Text as="span" fontWeight="bold">
                            {t('generateDocument.documentType')} :
                          </Text>
                          {filledValues.createdFor.fullname}
                        </Box>

                        <Box
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          <Text as="span" fontWeight="bold">
                            {t('generateDocument.dateCreation')}:
                          </Text>
                          {new Date(
                            filledValues.requestDate
                          ).toLocaleDateString('en-US')}
                        </Box>
                      </Td>
                    </Tr>
                  ) : (
                    <Tr>
                      <Td>{filledValues.createdFor.fullname}</Td>
                      <Td>-</Td>
                      <Td>{recentTemplate.name}</Td>
                      <Td>
                        {new Date(filledValues.requestDate).toLocaleDateString(
                          'en-US'
                        )}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            <Text>{t('generateDocument.documentContent')}</Text>

            <Box
              w="100%"
              h="300px"
              border="1px"
              borderColor={colorBorder}
              boxShadow="sm"
              p={4}
              overflowY="auto"
              mb={2}
            >
              <Text fontSize="md" letterSpacing={2} lineHeight={4}>
                {recentTemplate &&
                  renderTemplateContent(
                    recentTemplate.templateContent,
                    filledValues.items,
                    handleChange
                  )}
              </Text>
            </Box>
            <HStack
              display="flex"
              justifyContent={isArabic ? 'start' : 'end'}
              p={2}
              spacing={4}
            >
              <ButtonGroup gap="2" isDisabled={isSubmitting}>
                <Link to="/app/requests/assigned">
                  <Button color={goBackBtnColor} border="1px">
                    {t('configureTemplate.buttons.goBack')}
                  </Button>
                </Link>
                <Button color={saveBtnColor} border="1px" onClick={onOpen}>
                  {t('generateDocument.buttons.generate')}
                </Button>
              </ButtonGroup>
            </HStack>

            {isOpen && (
              <ConfirmModal
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={saveDocument}
                title={t('generateDocument.confirmGenerateTitle')}
                message={t('generateDocument.confirmGenerateMessage')}
                isArabic={isArabic}
                isSubmitting={isSubmitting}
              />
            )}
          </>
        )
      )}
    </Box>
  );
};

export default GenerateDocument;
