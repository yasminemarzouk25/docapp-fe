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

import { userService } from '../../services/userService';
import type { Alert as AlertType } from '../../types/Alert';

import FileUpload from '../FileUpload';
import ConfirmModal from '../ConfirmModal';

interface UploadSignatureProps {
  signerId: string;
  refreshSignersList: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  setTableAlert: React.Dispatch<React.SetStateAction<AlertType | null>>;
  modalAlert: AlertType | null;
  setModalAlert: Dispatch<SetStateAction<AlertType | null>>;
  handleModalError: (_error: unknown) => void;
}

const UploadSignature: React.FC<UploadSignatureProps> = ({
  signerId,
  refreshSignersList,
  isOpen,
  onClose,
  setTableAlert,
  modalAlert,
  setModalAlert,
  handleModalError
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
    setModalAlert(null);
    onClose();
  };

  const handleUpload = async () => {
    setIsSubmitting(true);
    try {
      // * TODO Remove the if condition when frontend validation is done
      if (file) {
        // Close are you sure modal
        onUploadClose();
        await userService.uploadSignature(signerId, file);
        setTableAlert({
          message: t('signatureModal.successMessage'),
          status: 'success'
        });
        refreshSignersList();
        onClose();
        setFile(null);
      }
    } catch (error) {
      handleModalError(error);
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
              {t('signatureModal.title')}
            </Heading>
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody>
            {modalAlert && (
              <Alert status={modalAlert.status} mb={4}>
                <AlertIcon />
                {modalAlert.message}
              </Alert>
            )}
            <FormControl isRequired mt={isMobile ? 2 : 4}>
              <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
                {t('signatureModal.description')}
              </FormLabel>
              <FileUpload
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg']
                }}
                maxSize={5000000} // 5MB
                disabled={isSubmitting}
                onDrop={handleDrop}
                expectedFileType="image"
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
                {t('signatureModal.cancelBtn')}
              </Button>
              <Button
                color={uploadBtnColor}
                border="1px"
                w={{ base: 'full', md: 'auto' }}
                isDisabled={!file || isSubmitting}
                isLoading={isSubmitting}
                loadingText={t('signatureModal.loading')}
                onClick={onUploadModalOpen}
              >
                {t('signatureModal.uploadBtn')}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmModal
        isOpen={isUploadModalOpen}
        onClose={onUploadClose}
        onConfirm={handleUpload}
        title={t('signatureModal.confirmUploadTitle')}
        message={t('signatureModal.confirmUploadMessage')}
        isArabic={isArabic}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default UploadSignature;
