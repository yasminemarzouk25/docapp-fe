import React, {
  useEffect,
  useState,
  type ReactElement,
  type Dispatch,
  type SetStateAction
} from 'react';
import { useForm, Controller } from 'react-hook-form';

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormLabel,
  FormControl,
  FormErrorMessage,
  ButtonGroup,
  Textarea,
  Box,
  Alert,
  AlertIcon,
  Stack,
  Switch,
  useDisclosure,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LiaPenAltSolid } from 'react-icons/lia';
import { PiSignatureLight } from 'react-icons/pi';

import FormField from './FormField';
import ConfirmModal from './ConfirmModal';
import SingleSelect from './SingleSelect';
import PrioritySelect from './PrioritySelect';

import SignatureTypeBox from './request/SignatureTypeBox';

import { userService } from '../services/userService';
import { templateService } from '../services/templateService';
import { requestService } from '../services/requestService';

import type { ConnectedUser, User } from '../types/User';
import type { Template } from '../types/Template';
import { SignatureType, type AddRequestFormData } from '../types/Request';
import type { Alert as AlertType } from '../types/Alert';

import useLoader from '../hooks/useLoader';
import { addRequestValidationRules } from '../forms/addRequest';
import useErrorHandler from '../hooks/useErrorHandler';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  setTableAlert: React.Dispatch<React.SetStateAction<AlertType | null>>;
  formAlert: AlertType | null;
  setFormAlert: Dispatch<SetStateAction<AlertType | null>>;
  handleFormError: (_error: unknown) => void;
  createdForUser: ConnectedUser;
  refreshRequestsList: () => void;
}

const AddRequestModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  setTableAlert,
  formAlert,
  setFormAlert,
  handleFormError,
  createdForUser,
  refreshRequestsList
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const darkLightColor = useColorModeValue('#012C4A', '#DDD');
  const saveBtnColor = useColorModeValue('#38A169', '#2F855A');
  const cancelBtnColor = useColorModeValue('blue.600', 'blue.400');
  const { alert, setAlert } = useErrorHandler(t);

  const {
    isOpen: isConfirmModalOpen,
    onOpen: onSendModalOpen,
    onClose: onConfirmModalClose
  } = useDisclosure();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);

  const openAreYouSureModal = () => {
    setHasSubmittedOnce(true);

    if (!isValid) {
      setAlert({
        status: 'error',
        message: t('addRequest.invalidForm')
      });

      handleSubmit(onSubmit, () => {})();

      return;
    }
    onSendModalOpen();
  };

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<AddRequestFormData>({
    defaultValues: {
      summary: '',
      createdFor: createdForUser.id,
      department: '',
      description: '',
      hrHandler: '',
      priority: null,
      templateId: '',
      signatureType: SignatureType._NONE,
      includeQrCode: false
    },
    mode: 'onChange'
  });

  const validationRules = addRequestValidationRules(t);

  // ! Start HR Users
  const { isLoading: isLoadingHrUsers, setIsLoading: setIsLoadingHrUsers } =
    useLoader({});
  const [hrUsers, setHrUsers] = useState<User[]>([]);

  const fetchHrUsers = async () => {
    try {
      setIsLoadingHrUsers(true);
      const data = await userService.getByRole('HR');
      setHrUsers(data);
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsLoadingHrUsers(false);
    }
  };
  // ! End HR Users

  // ! Start Templates
  const { isLoading: isLoadingTemplates, setIsLoading: setIsLoadingTemplates } =
    useLoader();
  const [templates, setTemplates] = useState<Template[]>([]);
  const fetchTemplates = async (): Promise<void> => {
    try {
      setIsLoadingTemplates(true);
      const { data } = await templateService.getAll(false, 1, null);
      setTemplates(data);
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };
  // ! End Templates

  useEffect(() => {
    fetchHrUsers();
    fetchTemplates();
  }, []);

  const resetFormAndAlert = (): void => {
    setFormAlert(null);
    setAlert(null);
    setHasSubmittedOnce(false);
    reset({
      summary: '',
      createdFor: createdForUser.id,
      department: '',
      description: '',
      hrHandler: '',
      priority: null,
      templateId: '',
      signatureType: SignatureType._NONE,
      includeQrCode: false
    });
  };

  const closeRequestModal = () => {
    resetFormAndAlert();
    onClose();
  };

  // Handle signature type selection
  const handleSignatureTypeSelect = (signatureType: SignatureType) => {
    setValue('signatureType', signatureType, { shouldValidate: true });
  };

  const onSubmit = async (data: AddRequestFormData) => {
    try {
      setFormAlert(null);
      // Close the confirm modal
      onConfirmModalClose();
      setIsSubmitting(true);

      await requestService.create(data);
      refreshRequestsList();
      setTableAlert({
        status: 'success',
        message: t('addRequest.successMessage')
      });

      resetFormAndAlert();
      onClose();
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = () => {
    setHasSubmittedOnce(true);
    handleSubmit(onSubmit, () => {
      // This callback runs when validation fails
      // The errors will be displayed and the button will be disabled
    })();
  };

  const renderFormAlert = (alert: AlertType | null): ReactElement | null =>
    alert && (
      <Alert status={alert.status} alignItems="flex-start" mb={4}>
        <AlertIcon />
        {alert.message}
      </Alert>
    );

  const isModalLoading = isSubmitting || isLoadingHrUsers || isLoadingTemplates;
  const watchedSignatureType = watch('signatureType');

  // Button should be enabled initially, then disabled only after first submit attempt if form is invalid
  const isSubmitButtonDisabled =
    isModalLoading || isSubmitting || (hasSubmittedOnce && !isValid);

  const getErrorBorderColor = (hasError: boolean): string | undefined => {
    return hasError ? 'red.500' : undefined;
  };

  useEffect(() => {
    // Set default values explicitly using setValue when modal opens
    if (isOpen) {
      setValue('summary', '');
      setValue('createdFor', createdForUser.id);
      setValue('department', '');
      setValue('description', '');
      setValue('hrHandler', '');
      setValue('priority', null);
      setValue('templateId', '');
      setValue('signatureType', SignatureType._NONE);
      setValue('includeQrCode', false);
    }
  }, [isOpen, createdForUser.id, setValue]);

  return (
    <>
      <Modal
        isCentered
        onClose={closeRequestModal}
        isOpen={isOpen}
        motionPreset="slideInBottom"
        closeOnOverlayClick={false}
        closeOnEsc={false}
        size={isMobile ? 'sm' : 'xl'}
      >
        <ModalOverlay />
        <ModalContent
          px={isMobile ? 0 : 8}
          dir={isArabic ? 'rtl' : 'ltr'}
          maxHeight="80vh"
          maxW={{ base: '95vw', md: '600px', lg: '700px' }}
        >
          <ModalHeader>{t('addRequest.requestTitle')}</ModalHeader>
          <ModalCloseButton isDisabled={isModalLoading || isSubmitting} />
          <ModalBody p={2} overflowY="auto">
            {formAlert
              ? renderFormAlert(formAlert)
              : !isValid && renderFormAlert(alert)}

            <Box mb={4}>
              <Controller
                name="summary"
                control={control}
                rules={validationRules.summary}
                render={({ field }) => (
                  <FormField
                    label={t('requestModal.summary')}
                    type="text"
                    darkLightColor={darkLightColor}
                    isMobile={isMobile}
                    isRequired
                    value={field.value}
                    onChange={field.onChange}
                    isDisabled={isSubmitting}
                    error={errors.summary?.message}
                    focusBorderColor={getErrorBorderColor(
                      Boolean(errors.summary)
                    )}
                  />
                )}
              />
            </Box>

            <Controller
              name="description"
              control={control}
              rules={validationRules.description}
              render={({ field }) => (
                <FormControl
                  isRequired
                  mb={4}
                  isDisabled={isSubmitting}
                  isInvalid={Boolean(errors.description)}
                >
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('requestModal.description')}
                  </FormLabel>
                  <Textarea
                    size="sm"
                    focusBorderColor={getErrorBorderColor(
                      Boolean(errors.description)
                    )}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {errors.description && (
                    <FormErrorMessage>
                      {errors.description.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="hrHandler"
              control={control}
              rules={validationRules.hrHandler}
              render={({ field }) => (
                <FormControl
                  isRequired
                  mb={4}
                  isDisabled={isSubmitting || isLoadingHrUsers}
                  isInvalid={Boolean(errors.hrHandler)}
                >
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('requestModal.hrHandler')}
                  </FormLabel>
                  <SingleSelect
                    placeholder={t('requestModal.hrHandler')}
                    value={field.value}
                    options={hrUsers.map((user) => ({
                      value: user.id,
                      label: `${user.firstName} ${user.lastName}`
                    }))}
                    onChange={field.onChange}
                    isDisabled={isSubmitting || isLoadingHrUsers}
                    isLoading={isLoadingHrUsers}
                    isInvalid={Boolean(errors.hrHandler)}
                  />
                  {errors.hrHandler && (
                    <FormErrorMessage>
                      {errors.hrHandler.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="createdFor"
              control={control}
              render={() => (
                <FormField
                  label={t('requestModal.createdFor')}
                  type="text"
                  darkLightColor={darkLightColor}
                  value={createdForUser.fullname}
                  isMobile={isMobile}
                  isRequired
                  onChange={() => {}}
                  isDisabled={isSubmitting}
                  isReadOnly
                />
              )}
            />

            <Controller
              name="department"
              control={control}
              rules={validationRules.department}
              render={({ field }) => (
                <FormControl
                  isRequired
                  mt={4}
                  mb={4}
                  isDisabled={isSubmitting}
                  isInvalid={Boolean(errors.department)}
                >
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('addRequest.department')}
                  </FormLabel>
                  <SingleSelect
                    placeholder={t('addRequest.departmentPlaceholder')}
                    value={field.value}
                    options={[
                      {
                        value: '01',
                        label: t('addRequest.departments.general')
                      },
                      { value: '02', label: t('addRequest.departments.hr') },
                      { value: '03', label: t('addRequest.departments.tech') },
                      {
                        value: '04',
                        label: t('addRequest.departments.quality')
                      },
                      {
                        value: '05',
                        label: t('addRequest.departments.development')
                      }
                    ]}
                    onChange={field.onChange}
                    isDisabled={isSubmitting}
                    isInvalid={Boolean(errors.department)}
                  />
                  {errors.department && (
                    <FormErrorMessage>
                      {errors.department.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="priority"
              control={control}
              rules={validationRules.priority}
              render={({ field }) => (
                <FormControl
                  isRequired
                  mb={4}
                  isDisabled={isSubmitting}
                  isInvalid={Boolean(errors.priority)}
                >
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('addRequest.priority')}
                  </FormLabel>
                  <PrioritySelect
                    placeholder={t('addRequest.priorityPlaceholder')}
                    value={field.value?.toString() || ''}
                    onChange={(value) => {
                      if (value === '') {
                        field.onChange(null);
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
                    isDisabled={isSubmitting}
                    isInvalid={Boolean(errors.priority)}
                  />
                  {errors.priority && (
                    <FormErrorMessage>
                      {errors.priority.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="templateId"
              control={control}
              rules={validationRules.templateId}
              render={({ field }) => (
                <FormControl
                  isRequired
                  mb={4}
                  isDisabled={isSubmitting || isLoadingTemplates}
                  isInvalid={Boolean(errors.templateId)}
                >
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('requestModal.typeDocument')}
                  </FormLabel>
                  <SingleSelect
                    placeholder={t('requestModal.typeDocument')}
                    value={field.value}
                    options={templates.map((t) => ({
                      value: t.id,
                      label: t.name
                    }))}
                    onChange={field.onChange}
                    isDisabled={isSubmitting || isLoadingTemplates}
                    isLoading={isLoadingTemplates}
                    isInvalid={Boolean(errors.templateId)}
                  />
                  {errors.templateId && (
                    <FormErrorMessage>
                      {errors.templateId.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            />

            {/* QR Code Switch */}
            <Controller
              name="includeQrCode"
              control={control}
              render={({ field }) => (
                <FormControl mt={4} mb={4} isRequired isDisabled={isSubmitting}>
                  <FormLabel>{t('editRequest.includeQrCode')}</FormLabel>
                  <Switch isChecked={field.value} onChange={field.onChange} />
                </FormControl>
              )}
            />

            {/* Signature Type Selection */}
            <Controller
              name="signatureType"
              control={control}
              rules={validationRules.signatureType}
              render={() => (
                <FormControl
                  isRequired
                  mb={4}
                  isDisabled={isSubmitting}
                  isInvalid={Boolean(errors.signatureType)}
                >
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('requestModal.signatureType')}
                  </FormLabel>
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    spacing={4}
                    mt={4}
                    width="100%"
                  >
                    <SignatureTypeBox
                      icon={LiaPenAltSolid}
                      title={t('requestModal.handSignature')}
                      signatureType={SignatureType._HANDWRITTEN}
                      selectedType={watchedSignatureType}
                      onClick={() =>
                        handleSignatureTypeSelect(SignatureType._HANDWRITTEN)
                      }
                      isDisabled={isSubmitting}
                      darkLightColor={darkLightColor}
                      hasError={Boolean(errors.signatureType)}
                    />

                    <SignatureTypeBox
                      icon={PiSignatureLight}
                      title={t('requestModal.digitalSignature')}
                      signatureType={SignatureType._DIGITAL}
                      selectedType={watchedSignatureType}
                      onClick={() =>
                        handleSignatureTypeSelect(SignatureType._DIGITAL)
                      }
                      isDisabled={isSubmitting}
                      darkLightColor={darkLightColor}
                      hasError={Boolean(errors.signatureType)}
                    />
                  </Stack>
                  {errors.signatureType && (
                    <FormErrorMessage>
                      {errors.signatureType.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
            />
          </ModalBody>
          <ModalFooter>
            <ButtonGroup gap="2">
              <Button
                color={cancelBtnColor}
                border="1px"
                type="reset"
                onClick={closeRequestModal}
                isDisabled={isModalLoading || isSubmitting}
              >
                {t('addRequest.buttons.cancel')}
              </Button>
              <Button
                color={saveBtnColor}
                border="1px"
                type="submit"
                onClick={openAreYouSureModal}
                isDisabled={isSubmitButtonDisabled}
                isLoading={isSubmitting}
                loadingText="Saving..."
              >
                {t('addRequest.buttons.send')}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={onConfirmModalClose}
        onConfirm={handleFormSubmit}
        title={t('addRequest.confirmSendTitle')}
        message={t('addRequest.confirmSend')}
        isArabic={isArabic}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default AddRequestModal;
