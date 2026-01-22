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
import useLoader from '../hooks/useLoader';
import { labelService } from '../services/labelService';
import useErrorHandler from '../hooks/useErrorHandler';
import {
  addPlaceholderValidationRules,
  type AddPlaceholderFormData
} from '../forms/addPlaceholder';

interface AddPlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshPlaceholdersList: () => void;
}

const AddPlaceholderModal: React.FC<AddPlaceholderModalProps> = ({
  isOpen,
  onClose,
  refreshPlaceholdersList
}) => {
  const { t, i18n } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);
  const { Loader, isLoading, setIsLoading } = useLoader();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [options, setOptions] = useState<
    MultiValue<CreatableMultiSelectOption>
  >([]);

  const isArabic = i18n.language === 'ar';
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const saveBtnColor = useColorModeValue('blue.600', 'blue.400');
  const cancelBtnColor = useColorModeValue('#9b9b9b', '#9b9b9b');

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
    setValue
  } = useForm<AddPlaceholderFormData>({
    defaultValues: {
      placeholderName: '',
      selectedLabels: []
    }
  });

  const validationRules = addPlaceholderValidationRules(t);

  const fetchLabels = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { data } = await labelService.getAll(false, 1, null);
      const mappedOptions = labelService.mapLabelsToSelectOptions(data);
      setOptions(mappedOptions);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();

    return () => {
      setOptions([]);
    };
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        placeholderName: '',
        selectedLabels: []
      });
      setAlert(null);
    }
  }, [isOpen, reset, setAlert]);

  const onSubmit = async (data: AddPlaceholderFormData) => {
    try {
      setIsSubmitting(true);
      const mappedLabels = labelService.mapOptionsToRequestLabels(
        data.selectedLabels
      );
      await placeholderService.create(data.placeholderName, mappedLabels);
      refreshPlaceholdersList();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    reset();
    setAlert(null);
    onClose();
  };

  const handleLabelsChange = (
    selectedOptions: MultiValue<CreatableMultiSelectOption>
  ) => {
    setValue('selectedLabels', [...selectedOptions]);
  };

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
        <ModalHeader>{t('addPlaceholder.title')}</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
          <ModalBody>
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

            <VStack spacing={4} align="stretch">
              <FormControl
                isRequired
                isInvalid={Boolean(errors.placeholderName)}
              >
                <FormLabel>{t('addPlaceholder.name')}</FormLabel>
                <Controller
                  name="placeholderName"
                  control={control}
                  rules={validationRules.placeholderName}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t('addPlaceholder.placeholderInputName')}
                      focusBorderColor={getErrorBorderColor(
                        Boolean(errors.placeholderName)
                      )}
                    />
                  )}
                />
                <FormErrorMessage>
                  {errors.placeholderName?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>{t('addPlaceholder.labels')}</FormLabel>
                {isLoading ? (
                  <Loader />
                ) : (
                  <Controller
                    name="selectedLabels"
                    control={control}
                    render={({ field: { value } }) => (
                      <CreatableMultiSelect
                        options={options}
                        isMulti
                        value={value}
                        onChangeFn={handleLabelsChange}
                        isClearable
                        placeholder={t('addPlaceholder.selectOrCreateLabels')}
                      />
                    )}
                  />
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup gap="2">
              <Button
                color={cancelBtnColor}
                border="1px"
                type="button"
                w={{ base: 'full', md: 'auto' }}
                onClick={closeModal}
                isDisabled={isSubmitting}
              >
                {t('addPlaceholder.cancel')}
              </Button>
              <Button
                color={saveBtnColor}
                border="1px"
                type="submit"
                w={{ base: 'full', md: 'auto' }}
                isDisabled={
                  isSubmitting ||
                  (Object.keys(errors).length > 0 && isSubmitted)
                }
                isLoading={isSubmitting}
              >
                {t('addPlaceholder.add')}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddPlaceholderModal;
