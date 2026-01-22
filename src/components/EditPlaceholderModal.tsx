import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  VStack,
  ButtonGroup,
  useColorModeValue,
  useBreakpointValue,
  ModalOverlay,
  Alert,
  AlertIcon,
  CloseButton,
  FormErrorMessage
} from '@chakra-ui/react';
import type { MultiValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

import CreatableMultiSelect, {
  type CreatableMultiSelectOption
} from './CreatableMultiSelect';
import { placeholderService } from '../services/placeholderService';
import { labelService } from '../services/labelService';

import useLoader from '../hooks/useLoader';
import useErrorHandler from '../hooks/useErrorHandler';

import type { Label } from '../types/Label';
import {
  editPlaceholderValidationRules,
  type EditPlaceholderFormData
} from '../forms/editPlaceholder';

interface EditPlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshPlaceholdersList: () => void;
  placeholderId: string;
  setEditSuccessMessage: (_message: string | null) => void;
}

const EditPlaceholderModal: React.FC<EditPlaceholderModalProps> = ({
  isOpen,
  onClose,
  refreshPlaceholdersList,
  placeholderId,
  setEditSuccessMessage
}) => {
  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);
  const { isLoading, setIsLoading } = useLoader();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<
    MultiValue<CreatableMultiSelectOption>
  >([]);
  const [originalValues, setOriginalValues] = useState<EditPlaceholderFormData>(
    {
      placeholderName: '',
      selectedLabels: []
    }
  );

  const isArabic = i18n.language === 'ar';
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const saveBtnColor = useColorModeValue('blue.600', 'blue.400');
  const cancelBtnColor = useColorModeValue('#9b9b9b', '#9b9b9b');

  const validationRules = editPlaceholderValidationRules(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch
  } = useForm<EditPlaceholderFormData>({
    mode: 'onChange',
    defaultValues: {
      placeholderName: '',
      selectedLabels: []
    }
  });

  const mapStringsToLabels = (labels: string[]): Label[] => {
    return labels.map((label) => ({ name: label }));
  };

  const fetchPlaceholderAndLabels = async () => {
    try {
      setIsLoading(true);

      const [placeholder, labelsResponse] = await Promise.all([
        placeholderService.getById(placeholderId),
        labelService.getAll(false, 1, null)
      ]);

      // Set form values using React Hook Form
      setValue('placeholderName', placeholder.name);

      const mappedLabels = labelService.mapLabelsToSelectOptions(
        mapStringsToLabels(placeholder.labels)
      );
      setValue('selectedLabels', [...mappedLabels]);

      // Save original values for dirty check
      setOriginalValues({
        placeholderName: placeholder.name,
        selectedLabels: [...mappedLabels]
      });

      const mappedOptions = labelService.mapLabelsToSelectOptions(
        labelsResponse.data
      );
      setOptions(mappedOptions);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditPlaceholderFormData) => {
    try {
      setIsSubmitting(true);
      const mappedLabels = labelService.mapOptionsToRequestLabels(
        data.selectedLabels
      );
      const placeholder = await placeholderService.getById(placeholderId);

      const hasChanges =
        data.placeholderName !== placeholder.name ||
        JSON.stringify(mappedLabels) !== JSON.stringify(placeholder.labels);

      if (hasChanges) {
        await placeholderService.update(
          placeholderId,
          data.placeholderName,
          mappedLabels
        );
        setEditSuccessMessage(t('editPlaceholder.successMessage'));
        refreshPlaceholdersList();
      }
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    onClose();
    setAlert(null);
    reset();
  };

  const handleChange = (
    selectedOptions: MultiValue<CreatableMultiSelectOption>
  ) => {
    setValue('selectedLabels', [...selectedOptions]);
  };

  // Watch form values for dirty check
  const watchedValues = watch();

  // Helper to compare arrays of options by value/label
  const areOptionsEqual = (a: any[], b: any[]) => {
    if (a.length !== b.length) return false;

    return a.every(
      (opt, idx) => opt.value === b[idx]?.value && opt.label === b[idx]?.label
    );
  };

  const isDirty =
    watchedValues.placeholderName !== originalValues.placeholderName ||
    !areOptionsEqual(
      watchedValues.selectedLabels || [],
      originalValues.selectedLabels || []
    );

  useEffect(() => {
    if (isOpen) {
      fetchPlaceholderAndLabels();
    }

    return () => {
      setOptions([]);
      reset();
      setAlert(null);
    };
  }, [isOpen, placeholderId]);

  const getErrorBorderColor = (hasError: boolean): string | undefined => {
    return hasError ? 'red.500' : undefined;
  };

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={closeModal}
      motionPreset="slideInBottom"
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size={isMobile ? 'sm' : 'xl'}
    >
      <ModalOverlay />
      <ModalContent
        px={isMobile ? 0 : 9}
        dir={isArabic ? 'rtl' : 'ltr'}
        maxHeight="80vh"
      >
        <ModalHeader>{t('editPlaceholder.title')}</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting || isLoading} />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
            <VStack spacing={4} align="stretch">
              {alert && (
                <Alert
                  status={alert.status}
                  my={4}
                  dir={isArabic ? 'rtl' : 'ltr'}
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

              <FormControl
                isDisabled={isSubmitting || isLoading}
                isInvalid={Boolean(errors.placeholderName)}
              >
                <FormLabel>{t('editPlaceholder.name')}</FormLabel>
                <Controller
                  name="placeholderName"
                  control={control}
                  rules={validationRules.placeholderName}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t('editPlaceholder.placeholderInputName')}
                      focusBorderColor={getErrorBorderColor(
                        Boolean(errors.placeholderName)
                      )}
                      cursor={isLoading ? 'wait !important' : 'default'}
                    />
                  )}
                />
                <FormErrorMessage>
                  {errors.placeholderName?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                isDisabled={isSubmitting || isLoading}
                cursor={isLoading ? 'wait !important' : 'default'}
              >
                <FormLabel>{t('editPlaceholder.labels')}</FormLabel>
                <Controller
                  name="selectedLabels"
                  control={control}
                  render={({ field }) => (
                    <CreatableMultiSelect
                      options={options}
                      isMulti
                      value={field.value}
                      onChangeFn={handleChange}
                      isClearable
                      placeholder={t('editPlaceholder.selectOrCreateLabels')}
                      isDisabled={isSubmitting || isLoading}
                    />
                  )}
                />
                <FormErrorMessage>
                  {errors.selectedLabels?.message}
                </FormErrorMessage>
              </FormControl>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup gap="2">
            <Button
              color={cancelBtnColor}
              border="1px"
              onClick={closeModal}
              isDisabled={isSubmitting || isLoading}
            >
              {t('editPlaceholder.cancel')}
            </Button>
            <Button
              color={saveBtnColor}
              border="1px"
              onClick={handleSubmit(onSubmit)}
              isDisabled={isSubmitting || isLoading || !isValid || !isDirty}
            >
              {t('editPlaceholder.save')}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPlaceholderModal;
