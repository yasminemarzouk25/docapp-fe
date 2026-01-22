import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Stack,
  Text,
  Flex,
  Icon,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';
import { BsGrid1X2, BsGrid3X3 } from 'react-icons/bs';
import { QRCodePlacement } from '../request/QRCodePlacementBox';

interface QRCodePlacementBoxProps {
  icon: React.ElementType;
  title: string;
  description: string;
  placement: QRCodePlacement;
  selectedPlacement: QRCodePlacement | null;
  onClick: () => void;
  isDisabled: boolean;
}

const QRCodePlacementBox: React.FC<QRCodePlacementBoxProps> = ({
  icon,
  title,
  description,
  placement,
  selectedPlacement,
  onClick,
  isDisabled
}) => {
  // Define colors to match SignatureTypeBox
  const boxBgColor = useColorModeValue('gray.50', 'gray.700');
  const boxBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBoxBgColor = useColorModeValue('blue.50', 'blue.900');
  const selectedBoxBorderColor = useColorModeValue('blue.500', 'blue.400');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
  const darkLightColor = useColorModeValue('blue.500', 'blue.200');

  const isSelected = placement === selectedPlacement;

  return (
    <Flex
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="center"
      border="1px solid"
      borderColor={isSelected ? selectedBoxBorderColor : boxBorderColor}
      borderRadius="md"
      bg={isSelected ? selectedBoxBgColor : boxBgColor}
      padding={4}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      onClick={isDisabled ? undefined : onClick}
      opacity={isDisabled ? 0.6 : 1}
      flex={1}
      transition="all 0.2s"
      width="100%"
      _hover={
        isDisabled
          ? {}
          : {
              borderColor: selectedBoxBorderColor,
              bg: hoverBgColor
            }
      }
    >
      <Icon as={icon} boxSize={6} mb={2} color={darkLightColor} />
      <Heading size="sm" mb={1}>
        {title}
      </Heading>
      <Text fontSize="sm">{description}</Text>
    </Flex>
  );
};

interface QRCodePlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlacement: QRCodePlacement | null;
  setSelectedPlacement: (_placement: QRCodePlacement) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const QRCodePlacementModal: React.FC<QRCodePlacementModalProps> = ({
  isOpen,
  onClose,
  selectedPlacement,
  setSelectedPlacement,
  isSubmitting,
  onConfirm
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent mx={{ base: 4, sm: 6 }}>
        <ModalHeader>{t('qrCodePlacement.modalTitle')}</ModalHeader>
        <ModalBody>
          <Stack spacing={4} width="100%">
            <Text>{t('qrCodePlacement.modalDescription')}</Text>

            <Flex
              gap={4}
              width="100%"
              direction={{ base: 'column', md: 'row' }}
            >
              <QRCodePlacementBox
                icon={BsGrid3X3}
                title={t('qrCodePlacement.allPages')}
                description={t('qrCodePlacement.allPagesDesc')}
                placement={QRCodePlacement._ALL_PAGES}
                selectedPlacement={selectedPlacement}
                onClick={() => setSelectedPlacement(QRCodePlacement._ALL_PAGES)}
                isDisabled={isSubmitting}
              />

              <QRCodePlacementBox
                icon={BsGrid1X2}
                title={t('qrCodePlacement.specificPage')}
                description={t('qrCodePlacement.specificPageDesc')}
                placement={QRCodePlacement._SPECIFIC_PAGE}
                selectedPlacement={selectedPlacement}
                onClick={() =>
                  setSelectedPlacement(QRCodePlacement._SPECIFIC_PAGE)
                }
                isDisabled={isSubmitting}
              />
            </Flex>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={onConfirm}
            isLoading={isSubmitting}
            loadingText="Confirming"
            isDisabled={isSubmitting || !selectedPlacement}
          >
            {t('qrCodePlacement.confirmButton')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QRCodePlacementModal;
