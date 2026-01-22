import React from 'react';
import {
  Button,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useBreakpointValue,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isArabic: boolean;
  message: string;
  entityName?: string;
  isSubmitting: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isArabic,
  message,
  isSubmitting
}) => {
  const { t } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered={isMobile === false} // Only center the modal on desktop
      size={isMobile ? 'xs' : 'md'}
    >
      <ModalOverlay />
      <ModalContent dir={isArabic ? 'rtl' : 'ltr'}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        <ModalBody>
          <Alert status="info" alignItems="flex-start">
            <AlertIcon mt={1} />
            {message}
          </Alert>
        </ModalBody>
        <ModalFooter display="flex" justifyContent="end">
          <ButtonGroup gap={2}>
            <Button
              colorScheme="red"
              onClick={onClose}
              isDisabled={isSubmitting}
            >
              {t('usersList.cancelButton')}
            </Button>
            <Button
              colorScheme="green"
              onClick={onConfirm}
              isDisabled={isSubmitting}
            >
              {t('usersList.confirmButton')}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
