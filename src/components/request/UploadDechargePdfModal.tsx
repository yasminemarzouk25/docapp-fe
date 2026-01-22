import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Heading,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  ModalCloseButton,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { requestService } from '../../services/requestService';

import type { Alert as AlertType } from '../../types/Alert';
import type { RequestResponse } from '../../types/Request';
import { BackendStep } from '../../types/Workflow';

import FileUpload from '../FileUpload';
import ConfirmModal from '../ConfirmModal';

interface UploadDechargePdfModalProps {
  selectedRequestId: string;
  updateStates: (
    _requestId: string,
    _updates: Partial<RequestResponse>
  ) => void;
  isOpen: boolean;
  onClose: () => void;
  setTableAlert: React.Dispatch<React.SetStateAction<AlertType | null>>;
  formAlert: AlertType | null;
  setFormAlert: Dispatch<SetStateAction<AlertType | null>>;
  handleFormError: (_error: unknown) => void;
}

const UploadDechargePdfModal: React.FC<UploadDechargePdfModalProps> = ({
  selectedRequestId,
  updateStates,
  isOpen,
  onClose,
  setTableAlert,
  formAlert,
  setFormAlert,
  handleFormError
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const darkLightColor = useColorModeValue('#012C4A', '#DDD');
  const uploadBtnColor = useColorModeValue('#38A169', '#2F855A');
  const cancelBtnColor = useColorModeValue('blue.600', 'blue.400');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    isOpen: isUploadModalOpen,
    onOpen: onUploadModalOpen,
    onClose: onUploadClose
  } = useDisclosure();

  const handleDrop = (acceptedFile: File) => {
    if (!isSubmitting) {
      setFile(acceptedFile);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setFormAlert(null);
    onClose();
  };

  const handleUpload = async () => {
    setIsSubmitting(true);
    try {
      if (file) {
        // Close are you sure modal
        onUploadClose();
        await requestService.uploadDechargePdf(selectedRequestId, file);
        setTableAlert({
          message: t('uploadDechargePdf.successMessage'),
          status: 'success'
        });
        updateStates(selectedRequestId, {
          workflowStep: BackendStep._COLLECTED
        });
        onClose();
        setFile(null);
      }
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        isCentered
        size={isMobile ? 'sm' : 'xl'}
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent dir={isArabic ? 'rtl' : 'ltr'}>
          <ModalHeader>
            <Heading as="h4" size="md" color={darkLightColor}>
              {t('uploadDechargePdf.modalTitle')}
            </Heading>
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody>
            {formAlert && (
              <Alert status={formAlert.status} mb={4}>
                <AlertIcon />
                {formAlert.message}
              </Alert>
            )}
            <FormControl isRequired mt={isMobile ? 2 : 4}>
              <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                {t('uploadDechargePdf.uploadFile')} (.pdf, .png, .jpg, .jpeg)
              </FormLabel>
              <FileUpload
                accept={{
                  'application/pdf': ['.pdf'],
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg']
                }}
                maxSize={5000000}
                disabled={isSubmitting}
                onDrop={handleDrop}
                expectedFileType="decharge"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter justifyContent={isArabic ? 'start' : 'end'}>
            <ButtonGroup gap="2">
              <Button
                color={cancelBtnColor}
                border="1px"
                w={{ base: 'full', md: 'auto' }}
                isDisabled={isSubmitting}
                onClick={handleCancel}
              >
                {t('uploadDechargePdf.cancelBtn')}
              </Button>
              <Button
                color={uploadBtnColor}
                border="1px"
                w={{ base: 'full', md: 'auto' }}
                isDisabled={!file || isSubmitting}
                isLoading={isSubmitting}
                loadingText={t('uploadDechargePdf.loading')}
                onClick={onUploadModalOpen}
              >
                {t('uploadDechargePdf.uploadBtn')}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmModal
        isOpen={isUploadModalOpen}
        onClose={onUploadClose}
        onConfirm={handleUpload}
        title={t('uploadDechargePdf.confirmUploadTitle')}
        message={t('uploadDechargePdf.confirmUploadMessage')}
        isArabic={isArabic}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default UploadDechargePdfModal;
