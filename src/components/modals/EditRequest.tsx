import React, {
  useEffect,
  useState,
  type ReactElement,
  type Dispatch,
  type SetStateAction
} from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  FormLabel,
  FormControl,
  useBreakpointValue,
  useColorModeValue,
  ButtonGroup,
  Textarea,
  Box,
  Alert,
  AlertIcon,
  useDisclosure,
  Switch,
  Collapse,
  Text,
  Flex,
  Icon,
  Stack
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LiaPenAltSolid } from 'react-icons/lia';
import { PiSignatureLight } from 'react-icons/pi';
import { ChevronRightIcon, ChevronDownIcon } from '@chakra-ui/icons';

import useLoader from '../../hooks/useLoader';

import SignatureTypeBox from '../request/SignatureTypeBox';
import FormField from '../FormField';
import ConfirmModal from '../ConfirmModal';

import { userService } from '../../services/userService';
import { templateService } from '../../services/templateService';
import { requestService } from '../../services/requestService';

import type { User } from '../../types/User';
import type { Template } from '../../types/Template';
import type { Alert as AlertType } from '../../types/Alert';
import {
  SignatureType,
  type RequestResponse,
  type UpdateRequest
} from '../../types/Request';

interface EditRequestProps {
  isOpen: boolean;
  onClose: () => void;
  setTableAlert: Dispatch<SetStateAction<AlertType | null>>;
  formAlert: AlertType | null;
  setFormAlert: Dispatch<SetStateAction<AlertType | null>>;
  setSelectedRequest: Dispatch<SetStateAction<RequestResponse | null>>;
  handleFormError: (_error: unknown) => void;
  selectedRequest: RequestResponse;
  refreshRequestsList: () => void;
}

const EditRequest: React.FC<EditRequestProps> = ({
  isOpen,
  onClose,
  setTableAlert,
  formAlert,
  setFormAlert,
  setSelectedRequest,
  handleFormError,
  selectedRequest,
  refreshRequestsList
}) => {
  const {
    isOpen: isSendModalOpen,
    onOpen: onSendModalOpen,
    onClose: onSendClose
  } = useDisclosure();

  const { isOpen: isCollapseOpen, onToggle: onCollapseToggle } =
    useDisclosure();

  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const darkLightColor = useColorModeValue('#012C4A', '#DDD');
  const saveBtnColor = useColorModeValue('#38A169', '#2F855A');
  const cancelBtnColor = useColorModeValue('blue.600', 'blue.400');
  const collapseBorderColor = useColorModeValue('gray.200', 'gray.500');
  const disabledBg = useColorModeValue('gray.100', 'gray.600');
  const disabledText = useColorModeValue('gray.600', 'gray.400');
  const disabledBorder = useColorModeValue('gray.300', 'gray.600');

  const [requestData, setRequestData] = useState<UpdateRequest>(() => ({
    hrHandler: selectedRequest.hrHandler.id,
    includeQrCode: Boolean(selectedRequest.includeQrCode),
    status: selectedRequest.status,
    templateId: selectedRequest.template.id,
    signatureType: selectedRequest.signatureType
  }));

  useEffect(() => {
    setRequestData({
      hrHandler: selectedRequest.hrHandler.id,
      includeQrCode: Boolean(selectedRequest.includeQrCode),
      status: selectedRequest.status,
      templateId: selectedRequest.template.id,
      signatureType: selectedRequest.signatureType
    });
  }, [selectedRequest]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ! Start HR Users
  const [hrUsers, setHrUsers] = useState<User[]>([]);
  const { isLoading: isLoadingHr, setIsLoading: setIsLoadingHr } = useLoader();

  const fetchHrUsers = async (): Promise<void> => {
    try {
      setIsLoadingHr(true);
      const data = await userService.getByRole('HR');
      setHrUsers(data);
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsLoadingHr(false);
    }
  };
  // ! End HR Users

  // ! Start Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const { isLoading: isLoadingTemplates, setIsLoading: setIsLoadingTemplates } =
    useLoader();

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

  const renderTemplateOptions = (): ReactElement[] => {
    return templates.map((template) => (
      <option key={template.id} value={template.id}>
        {template.name}
      </option>
    ));
  };
  // ! End Templates

  const renderUsersOptions = (users: User[]): ReactElement[] => {
    return users.map((user) => (
      <option key={user.id} value={user.id}>
        {user.firstName} {user.lastName}
      </option>
    ));
  };

  const resetFormAndAlert = (): void => {
    setFormAlert(null);
  };

  const closeRequestModal = () => {
    resetFormAndAlert();
    onClose();
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      // * Close are you sure modal
      onSendClose();
      await requestService.update(selectedRequest.id, requestData);
      setTableAlert({
        status: 'success',
        message: t('editRequest.successMessage')
      });
      refreshRequestsList();
      closeRequestModal();
      setSelectedRequest(null);
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormAlert = (): ReactElement | null =>
    formAlert && (
      <Alert status={formAlert.status} alignItems="flex-start" mb={4}>
        <AlertIcon />
        {formAlert.message}
      </Alert>
    );

  const isModalLoading = isSubmitting || isLoadingHr || isLoadingTemplates;

  useEffect(() => {
    fetchTemplates();
    fetchHrUsers();
  }, [handleFormError, setIsLoadingTemplates, setIsLoadingHr]);

  const getPriorityLabel = (priority: number): string => {
    const priorityMap: { [key: number]: string } = {
      6: t('addRequest.priorityOptions.urgent'),
      5: t('addRequest.priorityOptions.highest'),
      4: t('addRequest.priorityOptions.high'),
      3: t('addRequest.priorityOptions.medium'),
      2: t('addRequest.priorityOptions.low'),
      1: t('addRequest.priorityOptions.lowest')
    };

    return priorityMap[priority];
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: keyof UpdateRequest
  ) => {
    const { value } = e.target;
    setRequestData((prev: UpdateRequest) => ({
      ...prev,
      [field]: value
    }));
  };

  const getModalContentStyles = (isMobile: boolean) => ({
    px: isMobile ? 0 : 8,
    pr: isMobile ? 0 : 4,
    dir: isArabic ? 'rtl' : 'ltr'
  });

  // Handle signature type selection
  const handleSignatureTypeSelect = (signatureType: SignatureType) => {
    setRequestData((prev) => ({
      ...prev,
      signatureType
    }));
  };

  const isDisabled = isSubmitting || isModalLoading;

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
          {...getModalContentStyles(isMobile)}
          pl={4}
          maxHeight="80vh"
        >
          <ModalHeader pl={isMobile ? 2 : 4}>
            {t('editRequest.modalTitle')}
          </ModalHeader>
          <ModalCloseButton isDisabled={isDisabled} />
          <ModalBody p={2} overflowY="auto" pr={6}>
            {renderFormAlert()}

            <Flex
              align="center"
              justify="flex-start"
              mb={4}
              cursor="pointer"
              onClick={onCollapseToggle}
            >
              <Icon
                as={isCollapseOpen ? ChevronDownIcon : ChevronRightIcon}
                color={darkLightColor}
                mr={2}
              />
              <Text fontSize="medium" fontWeight="bold" color={darkLightColor}>
                {t('editRequest.requestDetails')}
              </Text>
            </Flex>

            <Collapse in={isCollapseOpen}>
              <Box
                mb={4}
                p={4}
                border="1px"
                borderColor={collapseBorderColor}
                borderRadius="md"
              >
                <Box mb={4}>
                  <FormField
                    label={t('requestModal.summary')}
                    type="text"
                    darkLightColor={darkLightColor}
                    isMobile={isMobile}
                    onChange={() => {}}
                    value={selectedRequest.summary}
                    isReadOnly
                  />
                </Box>
                <FormControl
                  mb={4}
                  cursor={isModalLoading ? 'wait' : 'default'}
                >
                  <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                    {t('requestModal.description')}
                  </FormLabel>
                  <Textarea
                    value={selectedRequest.description}
                    size="sm"
                    cursor="not-allowed"
                    resize="none"
                    isReadOnly
                    bg={disabledBg}
                    color={disabledText}
                    borderColor={disabledBorder}
                    userSelect="none"
                    onFocus={(e) => {
                      e.target.blur();
                    }}
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormField
                    label={t('editRequest.createdBy')}
                    type="text"
                    darkLightColor={darkLightColor}
                    isMobile={isMobile}
                    onChange={() => {}}
                    value={selectedRequest.createdBy.name}
                    isReadOnly
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormField
                    label={t('requestList.createdFor')}
                    type="text"
                    darkLightColor={darkLightColor}
                    isMobile={isMobile}
                    onChange={() => {}}
                    value={selectedRequest.createdFor.name}
                    isReadOnly
                  />
                </FormControl>

                <FormControl mb={4} isDisabled={isDisabled}>
                  <FormField
                    label={t('requestModal.priority')}
                    type="text"
                    darkLightColor={darkLightColor}
                    isMobile={isMobile}
                    onChange={() => {}}
                    value={getPriorityLabel(selectedRequest.priority)}
                    isReadOnly
                  />
                </FormControl>
              </Box>
            </Collapse>

            <FormControl
              mb={4}
              isDisabled={isLoadingHr || isDisabled}
              isRequired
            >
              <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                {t('requestModal.hrHandler')}
              </FormLabel>
              <Select
                color={darkLightColor}
                name="hrHandler"
                onChange={(e) => handleChange(e, 'hrHandler')}
                value={requestData.hrHandler}
                cursor={isLoadingHr ? 'wait !important' : 'default'}
                isDisabled={isLoadingHr || isDisabled}
              >
                {renderUsersOptions(hrUsers)}
              </Select>
            </FormControl>

            <FormControl mb={4} isDisabled={isLoadingTemplates} isRequired>
              <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                {t('requestModal.typeDocument')}
              </FormLabel>
              <Select
                color={darkLightColor}
                name="template"
                value={requestData.templateId}
                onChange={(e) => handleChange(e, 'templateId')}
                cursor={isLoadingTemplates ? 'wait !important' : 'default'}
                isDisabled={isDisabled}
              >
                {renderTemplateOptions()}
              </Select>
            </FormControl>
            <FormControl mt={4} mb={4} isRequired isDisabled={isDisabled}>
              <FormLabel>{t('editRequest.includeQrCode')}</FormLabel>
              <Switch
                isChecked={Boolean(requestData.includeQrCode)}
                onChange={(e) => {
                  setRequestData((prev) => ({
                    ...prev,
                    includeQrCode: e.target.checked
                  }));
                }}
              />
            </FormControl>

            {/* Signature Type Selection */}
            <FormControl isRequired mb={4} isDisabled={isDisabled}>
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
                  selectedType={requestData.signatureType}
                  onClick={() =>
                    handleSignatureTypeSelect(SignatureType._HANDWRITTEN)
                  }
                  isDisabled={isDisabled}
                  darkLightColor={darkLightColor}
                  hasError={false}
                />

                <SignatureTypeBox
                  icon={PiSignatureLight}
                  title={t('requestModal.digitalSignature')}
                  signatureType={SignatureType._DIGITAL}
                  selectedType={requestData.signatureType}
                  onClick={() =>
                    handleSignatureTypeSelect(SignatureType._DIGITAL)
                  }
                  isDisabled={isDisabled}
                  darkLightColor={darkLightColor}
                  hasError={false}
                />
              </Stack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup gap="2">
              <Button
                color={cancelBtnColor}
                border="1px"
                type="reset"
                onClick={onClose}
                isDisabled={isDisabled}
              >
                {t('requestModal.cancelBtn')}
              </Button>
              <Button
                color={saveBtnColor}
                border="1px"
                type="submit"
                onClick={() => onSendModalOpen()}
                isDisabled={isDisabled}
                isLoading={isSubmitting}
                loadingText="Saving..."
              >
                {t('requestModal.saveBtn')}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmModal
        isOpen={isSendModalOpen}
        onClose={onSendClose}
        onConfirm={onSubmit}
        title={t('editRequest.confirmUpdateTitle')}
        message={t('editRequest.confirmUpdateMessage')}
        isArabic={isArabic}
        isSubmitting={isSubmitting || isModalLoading}
      />
    </>
  );
};

export default EditRequest;
