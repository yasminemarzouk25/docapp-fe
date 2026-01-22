import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Stack,
  HStack,
  Heading,
  useBreakpointValue,
  useColorModeValue,
  ButtonGroup,
  Alert,
  AlertIcon,
  CloseButton,
  Text,
  useToast,
  Switch,
  Tooltip,
  Icon
} from '@chakra-ui/react';
import { QuestionIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

import FormField from '../components/FormField';
import FileUpload from '../components/FileUpload';
import { languageService } from '../services/languageService';
import type { Language } from '../types/Language';
import type { DetectedPlaceholders } from '../types/Placeholder';
import useErrorHandler from '../hooks/useErrorHandler';
import { templateService } from '../services/templateService';
import type { TemplateForm } from '../types/Template';
import IntegerInput from '../components/IntegerInput';

const AddTemplate: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const darkLightColor = useColorModeValue('#012C4A', '#DDD');
  const saveBtnColor = useColorModeValue('#38A169', '#2F855A');
  const validateBtnColor = useColorModeValue('gray.500', 'gray.400');
  const cancelBtnColor = useColorModeValue('blue.600', 'blue.400');
  const guidelinesColor = useColorModeValue('#bee3f8', 'gray.700');

  const { alert, setAlert, handleError } = useErrorHandler(t);
  const toast = useToast();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [placeholders, setPlaceholders] = useState<DetectedPlaceholders>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialTemplate: TemplateForm = {
    name: '',
    language: '',
    ref: 0,
    employeeRequestable: true
  };
  const [template, setTemplate] = useState(initialTemplate);

  const navigate = useNavigate();

  const fetchLanguages = async (
    paginate: boolean,
    page: number | null,
    limit: number | null
  ): Promise<void> => {
    try {
      const response = await languageService.getAll(paginate, page, limit);
      const { data } = response;
      setLanguages(data);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchLanguages(false, null, null);

    return () => {
      // Cleanup logic here
      setLanguages([]);
      setAlert(null);
      setFile(null);
      setPlaceholders([]);
      setSaveEnabled(false);
      setIsSubmitting(false);
    };
  }, []);

  const handleDrop = (acceptedFile: File) => {
    if (isSubmitting === false) {
      setFile(acceptedFile);
      setSaveEnabled(false);
    }
  };

  const handleValidateFile = async () => {
    try {
      setIsSubmitting(true);
      const placeholders = await templateService.validate(file!);
      setPlaceholders(placeholders);

      setSaveEnabled(true);
      setAlert({
        status: 'success',
        message: t('addTemplate.fileIsValid')
      });
    } catch (error) {
      handleError(error);
      setSaveEnabled(false);
      setPlaceholders([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof TemplateForm,
    isNumber = false
  ) => {
    const value = isNumber ? parseInt(e.target.value, 10) : e.target.value;
    const newTemplate = { ...template, [field]: value };
    setTemplate(newTemplate);
  };

  const handleSave = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', template.name);
      formData.append('languageCode', template.language);
      formData.append('ref', template.ref.toString());
      formData.append(
        'employeeRequestable',
        template.employeeRequestable.toString()
      );

      if (file !== null) {
        formData.append('file', file);
      }

      await templateService.create(formData);

      toast({
        title: t('addTemplate.addedSuccessfully'),
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
        containerStyle: {
          marginTop: '64px'
        }
      });

      // Navigate immediately after showing toast
      navigate('/app/documents');
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onIncrementDecrementRef = (value: number) => {
    const currentValue = template.ref || 0;
    const newValue = Math.max(currentValue + value, 0);
    const newTemplate = { ...template, ref: newValue };
    setTemplate(newTemplate);
  };

  const handleCancel = () => {
    setTemplate(initialTemplate);
    setFile(null);
    setPlaceholders([]);
    setSaveEnabled(false);
    setAlert(null);
  };

  const constraints = t('addTemplate.addTemplateConstraints')
    .split('\n')
    .map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));

  return (
    <Box maxW="100%" w="100%" dir={direction} pt={4}>
      <Box mt={2} mb={isMobile ? 4 : 0}>
        <Heading as="h4" size="md" mb={6} color={darkLightColor}>
          {t('addTemplate.pageTitle')}
        </Heading>
        <Alert
          status="info"
          alignItems="flex-start"
          p={2}
          mb={4}
          bg={guidelinesColor}
        >
          <AlertIcon mt={1} />
          {constraints}
        </Alert>
      </Box>
      <Box>
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
        <form>
          <Stack>
            <FormField
              label={t('addTemplate.templateName')}
              type="text"
              darkLightColor={darkLightColor}
              isMobile={isMobile}
              isRequired
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e, 'name')
              }
            />
            <FormControl isRequired>
              <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                {t('addTemplate.language')}
              </FormLabel>

              <Select
                placeholder={t('addTemplate.selectLanguage')}
                color={darkLightColor}
                onChange={(e) => handleChange(e, 'language')}
              >
                {languages.map((langue, idx) => (
                  <option value={langue.code} key={idx}>
                    {langue.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <IntegerInput
              name="ref"
              label={t('addTemplate.templateRefNumber')}
              isRequired={true}
              onChange={(e) => handleChange(e, 'ref', true)}
              onIncrementDecrement={onIncrementDecrementRef}
            />

            <FormControl mt={4}>
              <HStack spacing={2} align="center">
                <FormLabel color={darkLightColor} mb={0}>
                  {t('addTemplate.employeeRequestable')}
                </FormLabel>
                <Tooltip
                  label={t('addTemplate.employeeRequestableTooltip')}
                  placement="right"
                  hasArrow
                >
                  <span>
                    <Icon as={QuestionIcon} color="gray.500" boxSize={5} />
                  </span>
                </Tooltip>
              </HStack>
              <Switch
                mt={2}
                isChecked={template.employeeRequestable}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    employeeRequestable: e.target.checked
                  })
                }
                colorScheme="blue"
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>{t('addTemplate.uploadFile')}(.docx)</FormLabel>

              {/* map detected placeholders */}
              {placeholders.length > 0 && (
                <Text pb={4} mr={4} color="blue.500">
                  <Text as="span" fontWeight="bold">
                    {t('addTemplate.detectedPlaceholders')} :
                  </Text>
                  {placeholders.join(', ')}
                </Text>
              )}

              <FileUpload
                accept={{
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    ['.docx']
                }}
                maxSize={5000000} // 5MB
                disabled={isSubmitting}
                onDrop={handleDrop}
                expectedFileType="docx"
              />
            </FormControl>
            <HStack
              display="flex"
              justifyContent={isArabic ? 'start' : 'end'}
              p={2}
              spacing={4}
            >
              <ButtonGroup gap="2">
                <Button
                  color={cancelBtnColor}
                  border="1px"
                  type="reset"
                  isDisabled={isSubmitting}
                  onClick={handleCancel}
                >
                  {t('addTemplate.buttons.reset')}
                </Button>
                <Button
                  color={validateBtnColor}
                  border="1px"
                  type="button"
                  isLoading={isSubmitting}
                  isDisabled={!file}
                  onClick={handleValidateFile}
                >
                  {t('addTemplate.buttons.validate')}
                </Button>
                <Button
                  color={saveBtnColor}
                  border="1px"
                  type="submit"
                  isDisabled={!saveEnabled || isSubmitting}
                  onClick={handleSave}
                >
                  {t('addTemplate.buttons.save')}
                </Button>
              </ButtonGroup>
            </HStack>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default AddTemplate;
