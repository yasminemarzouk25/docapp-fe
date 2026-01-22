import React, { useState, useEffect, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  ButtonGroup,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  CloseButton
} from '@chakra-ui/react';
import type { MultiValue } from 'react-select';

import MultiSelect, { type MultiSelectOption } from '../components/MultiSelect';
import PlaceholderArea from '../components/PlaceholderArea';
import TagBox from '../components/TagBox';

import { templateService, UserFieldsList } from '../services/templateService';
import { labelService } from '../services/labelService';
import { placeholderService } from '../services/placeholderService';

import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';

import {
  Tag,
  type Placeholder,
  type TagType,
  type DashedPlaceholder,
  type Tags,
  type AppTag,
  type TemplatePlaceholder
} from '../types/Placeholder';
import type { Template, TemplateSingle } from '../types/Template';
import type { TemplateUserField } from '../types/UserField';

const ConfigureTemplate: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { templateId } = useParams<{ templateId: string }>();
  const { alert, setAlert, handleError } = useErrorHandler(t);
  const { Loader, isLoading, setIsLoading } = useLoader();

  const [documentPlaceholders, setDocumentPlaceholders] = useState<
    DashedPlaceholder[]
  >([]);
  const [template, setTemplate] = useState<TemplateSingle | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<
    MultiValue<MultiSelectOption>
  >([]);

  const RETRIEVE_ALL_OPTION = {
    value: 'get-all',
    label: t('configureTemplate.retrieveAll')
  };

  const [mappedLabels, setMappedLabels] = useState<
    MultiValue<MultiSelectOption>
  >([RETRIEVE_ALL_OPTION]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tags, setTags] = useState<Tags>([...UserFieldsList]);

  const [isFilled, setIsFilled] = useState<boolean>(false);

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const goBackBtnColor = useColorModeValue('green.500', 'green.600');
  const qrCodeBtnColor = useColorModeValue('blue.500', 'blue.600');

  const documentContentBorderColor = useColorModeValue('gray.200', 'gray.700');

  const { Placeholder, UserField } = Tag;

  const isFirstOptionRetrieveAll = (
    selectedOptions: MultiValue<MultiSelectOption>
  ): boolean => {
    return selectedOptions.length > 0 && selectedOptions[0].value === 'get-all';
  };

  const isRetrieveAllSelected = (
    selectedOptions: MultiValue<MultiSelectOption>
  ): boolean => {
    return selectedOptions.some(({ value }) => value === 'get-all');
  };

  const updateIsFilled = (placeholders: DashedPlaceholder[]) => {
    setIsFilled(
      placeholders.length > 0 && placeholders.every((p) => p.target !== null)
    );
  };

  // Fetch placeholders based on the selected labels
  const fetchPlaceholders = async (
    newSelectedLabels: MultiValue<MultiSelectOption>
  ): Promise<Placeholder[]> => {
    let data: Placeholder[];
    const getAllFirst = isFirstOptionRetrieveAll(newSelectedLabels);
    if (getAllFirst) {
      const paginatedData = await placeholderService.getAll(false, 1, null);
      data = paginatedData.data;
    } else {
      data = await placeholderService.getByLabels(
        newSelectedLabels.map((option) => option.value)
      );
    }

    return data;
  };

  const handleLabelsChange = async (
    selectedOptions: MultiValue<MultiSelectOption>
  ) => {
    try {
      let newSelectedLabels: MultiValue<MultiSelectOption>;

      const getAllSelected = isRetrieveAllSelected(selectedOptions);
      const getAllFirst = isFirstOptionRetrieveAll(selectedOptions);

      if (selectedOptions.length > 1) {
        if (getAllSelected) {
          if (getAllFirst) {
            // Set labels without 'Retrieve All' option
            newSelectedLabels = selectedOptions.slice(1);
          } else {
            newSelectedLabels = [RETRIEVE_ALL_OPTION];
          }
        } else {
          newSelectedLabels = selectedOptions;
        }
      } else {
        newSelectedLabels = selectedOptions;
      }
      setSelectedLabels(newSelectedLabels);
      if (newSelectedLabels.length > 0) {
        const placeholders = await fetchPlaceholders(newSelectedLabels);
        const mappedPlaceholders = mapPlaceholdersToTags(placeholders);
        setTags([...UserFieldsList, ...mappedPlaceholders]);
      } else {
        setTags([...UserFieldsList]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const filterTagsByType = (tags: Tags, type: TagType) => {
    return tags.filter((tag) => tag.type === type);
  };

  // Function that receives tags and documentPlaceholders and return the tags that are not used in targets of documentPlaceholders
  const filterUnusedTags = (
    tags: Tags,
    documentPlaceholders: DashedPlaceholder[]
  ): Tags => {
    return tags.filter((tag) => {
      return !documentPlaceholders.some(
        (placeholder) => placeholder.target?.text === tag.text
      );
    });
  };

  // Function to update a placeholder by "name" it should receive a AppTag| null, search for that placeholder in documentPlaceholders and setDocumentPlaceholders
  const updatePlaceholderTarget = async (
    name: string,
    newTarget: AppTag | null
  ) => {
    const placeholder = documentPlaceholders.find((p) => p.name === name);
    try {
      setIsSubmitting(true);
      if (newTarget && placeholder && placeholder.target === null) {
        // ! Assignment
        // * Check if its a user field or a placeholder assignment
        if (newTarget.type === Tag.UserField) {
          const templateUserField: TemplateUserField = {
            templateId: templateId!,
            detectedPlaceholder: name,
            userField: newTarget.text
          };
          await templateService.assignUserField(templateUserField);
        } else {
          const templatePlaceholder: TemplatePlaceholder = {
            templateId: templateId!,
            detectedPlaceholder: name,
            placeholderId: newTarget.id
          };
          await templateService.assignPlaceholder(templatePlaceholder);
        }
        placeholder.target = newTarget;
      } else {
        // ! UnAssignment
        // * Check if its a user field or a placeholder unAssignment
        if (placeholder!.target!.type === Tag.UserField) {
          const templateUserField: TemplateUserField = {
            templateId: templateId!,
            detectedPlaceholder: name,
            userField: placeholder!.target!.text
          };
          await templateService.unAssignUserField(templateUserField);
        } else {
          const templatePlaceholder: TemplatePlaceholder = {
            templateId: templateId!,
            detectedPlaceholder: name,
            placeholderId: placeholder!.target!.id
          };
          await templateService.unAssignPlaceholder(templatePlaceholder);
        }
        placeholder!.target = null;
      }
      // Call updateIsFilled after any change
      updateIsFilled(documentPlaceholders);
    } catch (error) {
      handleError(error);
      // Reset the list
    } finally {
      setIsSubmitting(false);
    }
  };

  // Creates an array of document dashed placeholders zones from an array of detected placeholders.
  const mapPlaceholders = (
    detectedPlaceholdersString: string
  ): DashedPlaceholder[] => {
    const detectedPlaceholders = detectedPlaceholdersString.split(',');

    return detectedPlaceholders.map((placeholder) => ({
      name: placeholder,
      target: null
    }));
  };

  const mapPlaceholdersToTags = (placeholders: Placeholder[]): AppTag[] => {
    return placeholders.map((placeholder) => ({
      id: placeholder.id,
      text: placeholder.name,
      type: Tag.Placeholder
    }));
  };

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      if (!templateId) {
        throw new Error('Template ID is required.');
      }

      const fetchedTemplate = await templateService.getById(templateId);
      setTemplate(fetchedTemplate);

      // Set initial isFilled from backend
      setIsFilled(fetchedTemplate.isFilled);

      const documentPlaceholders = mapPlaceholders(
        fetchedTemplate.detectedPlaceholders
      );

      const hasRelatedPlaceholders =
        fetchedTemplate.relatedPlaceholders.length > 0;

      if (hasRelatedPlaceholders) {
        const placeholders = await placeholderService.getAll(false, 1, null);

        setTags([
          ...UserFieldsList,
          ...mapPlaceholdersToTags(placeholders.data)
        ]);

        const { relatedPlaceholders } = fetchedTemplate;
        // * Set the preAssigned placeholders into the documentPlaceholders targets.
        relatedPlaceholders.forEach((relatedPlaceholder) => {
          const placeholder = documentPlaceholders.find(
            (p) => p.name === relatedPlaceholder.detectedPlaceholder
          )!;
          placeholder.target = {
            id: relatedPlaceholder.placeholderId,
            text: relatedPlaceholder.placeholderName,
            type: Tag.Placeholder
          };
        });
      }

      const hasRelatedUserFields = fetchedTemplate.relatedUserFields.length > 0;
      if (hasRelatedUserFields) {
        // * Set the preAssigned user fields into the documentPlaceholders targets.
        fetchedTemplate.relatedUserFields.forEach((relatedUserField) => {
          const placeholder = documentPlaceholders.find(
            (p) => p.name === relatedUserField.detectedPlaceholder
          )!;
          placeholder.target = {
            id: '',
            text: relatedUserField.userFieldName,
            type: Tag.UserField
          };
        });
      }
      // Set the documentPlaceholders after the preAssignments
      setDocumentPlaceholders(documentPlaceholders);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      setIsLoading(true);
      const labelsResponse = await labelService.getAll(false, 1, null);
      const mappedOptions = labelsResponse.data.map((label) => ({
        value: label.name,
        label: label.name
      }));
      // Add "Retrieve All" option
      mappedOptions.unshift(RETRIEVE_ALL_OPTION);

      setMappedLabels(mappedOptions);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (template: Template): (ReactElement | string)[] => {
    const { templateContent } = template;
    const regex = /(\[[a-zA-Z][\w]{0,99}\])/g;
    const parts = templateContent.split(regex);

    const isPlaceholder = (part: string) => {
      return part.startsWith('[') && part.endsWith(']');
    };

    return parts.map((part, index) => {
      if (isPlaceholder(part)) {
        const placeholderName = part.slice(1, -1);

        const placeholder = documentPlaceholders.find(
          (p) => p.name === placeholderName
        );
        if (placeholder) {
          return (
            <PlaceholderArea
              key={index}
              placeholder={placeholder}
              updatePlaceholderTarget={updatePlaceholderTarget}
              isSubmitting={isSubmitting}
            />
          );
        }
      }

      return part;
    });
  };

  useEffect(() => {
    fetchTemplate();
    fetchLabels();

    // Cleanup function
    return () => {
      setTemplate(null);
      setDocumentPlaceholders([]);
      setTags([...UserFieldsList]);
      setSelectedLabels([]);
      setMappedLabels([RETRIEVE_ALL_OPTION]);
      setIsSubmitting(false);
      setAlert(null);
    };
  }, [templateId]);

  const redirectToQrCode = () => {
    if (isFilled === true) {
      navigate(`/app/configure-qr-code/${templateId}`);
    }
  };

  return (
    <Box
      maxW="100%"
      w="100%"
      dir={dir}
      cursor={isSubmitting ? 'wait' : 'default'}
      pt={6}
    >
      <Flex
        direction="column"
        gap="4"
        dir={dir}
        cursor={isSubmitting ? 'wait' : 'default'}
      >
        <Heading as="h4" size="md" mb={2}>
          {t('configureTemplate.pageTitle')}
        </Heading>
        {alert && (
          <Alert status={alert.status} my={4}>
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
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <TagBox
                height="120px"
                title={t('configureTemplate.placeholders')}
                // We filter the tags by type then we filter unused tags
                tags={filterUnusedTags(
                  filterTagsByType(tags, Placeholder),
                  documentPlaceholders
                )}
                colorScheme="cyan"
                hasScroll={true}
                isSubmitting={isSubmitting}
              >
                <MultiSelect
                  options={mappedLabels}
                  onChangeFn={handleLabelsChange}
                  value={selectedLabels}
                  placeholder={t('configureTemplate.selectLabels')}
                  isDisabled={isSubmitting}
                />
              </TagBox>
              <TagBox
                height="168px"
                title={t('configureTemplate.userFields')}
                // We filter the tags by type then we filter unused tags
                tags={filterUnusedTags(
                  filterTagsByType(tags, UserField),
                  documentPlaceholders
                )}
                colorScheme="blue"
                hasScroll={true}
                isSubmitting={isSubmitting}
              ></TagBox>
            </SimpleGrid>
            <Flex direction="column" gap="2" align="start">
              <Text fontSize="lg">
                {t('configureTemplate.documentContent')}
              </Text>
              <Box
                w="100%"
                h="300px"
                border="1px"
                borderColor={documentContentBorderColor}
                boxShadow="sm"
                p={4}
                overflowY="auto"
              >
                <Text fontSize="md" as="samp">
                  {template && renderContent(template)}
                </Text>
              </Box>
            </Flex>
            <HStack
              display="flex"
              justifyContent={isArabic ? 'start' : 'end'}
              p={2}
              spacing={4}
            >
              <ButtonGroup gap="2">
                <Link to="/app/documents">
                  <Button color={goBackBtnColor} border="1px">
                    {t('configureTemplate.buttons.goBack')}
                  </Button>
                </Link>
              </ButtonGroup>

              <ButtonGroup gap="2">
                <Button
                  color={qrCodeBtnColor}
                  border="1px"
                  isDisabled={!isFilled || isSubmitting}
                  onClick={redirectToQrCode}
                >
                  {t('configureTemplate.buttons.configureQrCode')}
                </Button>
              </ButtonGroup>
            </HStack>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default ConfigureTemplate;
