import React, {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import useLoader from '../hooks/useLoader';
import { userService } from '../services/userService';
import { requestService } from '../services/requestService';
import type { User } from '../types/User';
import type { Alert as AlertType } from '../types/Alert';
import type { AssignApprover, RequestResponse } from '../types/Request';
import ConfirmModal from './ConfirmModal';
import SingleSelect from './SingleSelect';

interface AssignApproverModalProps {
  isOpen: boolean;
  onClose: () => void;
  setTableAlert: React.Dispatch<React.SetStateAction<AlertType | null>>;
  formAlert: AlertType | null;
  setFormAlert: Dispatch<SetStateAction<AlertType | null>>;
  handleFormError: (_error: unknown) => void;
  selectedRequest: RequestResponse;
  setSelectedRequest: Dispatch<SetStateAction<RequestResponse | null>>;
  refreshRequestsList: () => void;
}

const AssignApproverModal: React.FC<AssignApproverModalProps> = ({
  isOpen,
  onClose,
  setTableAlert,
  formAlert,
  handleFormError,
  setFormAlert,
  selectedRequest,
  setSelectedRequest,
  refreshRequestsList
}) => {
  const {
    isOpen: isAssignModalOpen,
    onOpen: onAssignModalOpen,
    onClose: onAssignClose
  } = useDisclosure();

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { isLoading, setIsLoading } = useLoader();
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;
  const darkLightColor = useColorModeValue('#012C4A', '#DDD');
  const saveBtnColor = useColorModeValue('#38A169', '#2F855A');
  const cancelBtnColor = useColorModeValue('blue.600', 'blue.400');

  const [requestData, setRequestData] = useState<AssignApprover | null>({
    documentApprover: selectedRequest.documentApprover?.id || ''
  });

  // ! Start Signer Users
  const [signerUsers, setSignerUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSignerUsers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await userService.getByRole('Signer');
      setSignerUsers(data);
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsLoading(false);
    }
  };
  // ! End Signer Users

  useEffect(() => {
    fetchSignerUsers();
  }, [handleFormError, setIsLoading]);

  const resetFormAndAlert = (): void => {
    setFormAlert(null);
  };

  const handleAssign = async () => {
    // Close the Are you sure modal
    onAssignClose();
    if (!requestData?.documentApprover) {
      setFormAlert({
        status: 'error',
        message:
          'The document approver is required (todo: replace me with frontend validation)'
      });

      return;
    }
    try {
      setIsSubmitting(true);
      await requestService.assignApprover(selectedRequest.id, requestData);
      setTableAlert({
        status: 'success',
        message: t('assignRequest.successMessage')
      });
      refreshRequestsList();
      handleModalClose();
      setSelectedRequest(null);
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to close the Assignment Modal
  const handleModalClose = () => {
    onClose();
    resetFormAndAlert();
    setIsLoading(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        isCentered
        motionPreset="slideInBottom"
        closeOnOverlayClick={false}
        closeOnEsc={false}
        size={isMobile ? 'sm' : 'xl'}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('assignRequest.modalTitle')}</ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting || isLoading} />
          <ModalBody>
            {formAlert && (
              <Alert status={formAlert.status} mb={4}>
                <AlertIcon />
                {formAlert.message}
              </Alert>
            )}
            <FormControl
              mb={4}
              isDisabled={isLoading || isSubmitting}
              isRequired
            >
              <FormLabel color={darkLightColor} mb={isMobile ? 2 : 1}>
                {t('assignRequest.documentApprover')}
              </FormLabel>
              <SingleSelect
                placeholder={t('editRequest.selectApproverPlaceholder')}
                value={requestData?.documentApprover || ''}
                options={signerUsers.map((user) => ({
                  value: user.id,
                  label: `${user.firstName} ${user.lastName}`
                }))}
                onChange={(value) => {
                  setRequestData({ documentApprover: value });
                }}
                isDisabled={isLoading || isSubmitting}
                isLoading={isLoading}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleModalClose}
              isDisabled={isSubmitting || isLoading}
              color={cancelBtnColor}
              border="1px"
              type="reset"
              mr={3}
            >
              {t('assignRequest.cancelBtn')}
            </Button>
            <Button
              onClick={() => onAssignModalOpen()}
              isDisabled={isSubmitting || isLoading}
              isLoading={isSubmitting}
              loadingText="Assigning..."
              color={saveBtnColor}
              border="1px"
              type="submit"
            >
              {t('assignRequest.assignBtn')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmModal
        isOpen={isAssignModalOpen}
        onClose={onAssignClose}
        onConfirm={handleAssign}
        title={t('assignRequest.confirmAssignTitle')}
        message={t('assignRequest.confirmAssignMessage')}
        isArabic={isArabic}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default AssignApproverModal;
