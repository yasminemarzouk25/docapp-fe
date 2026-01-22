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
  useBreakpointValue
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  isArabic: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  isArabic
}) => {
  const { t } = useTranslation();
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered={isMobile === false} // Only center the modal on desktop
      size={isMobile ? 'xs' : 'md'}
    >
      <ModalOverlay />
      <ModalContent dir={isArabic ? 'rtl' : 'ltr'}>
        <ModalHeader>{t('usersList.confirmDeleteTitle')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {t('usersList.confirmDeleteMessage')}
          {entityName}
        </ModalBody>
        <ModalFooter display="flex" justifyContent="end">
          <ButtonGroup gap={2}>
            <Button colorScheme="red" onClick={onClose}>
              {t('usersList.cancelButton')}
            </Button>
            <Button colorScheme="green" onClick={onConfirm}>
              {t('usersList.confirmButton')}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDeleteModal;
