import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  ButtonGroup,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Icon,
  useToast,
  useBreakpointValue,
  useDisclosure,
  Spacer
} from '@chakra-ui/react';
import { FaArrowsAlt } from 'react-icons/fa';

import { templateService } from '../services/templateService';

import useErrorHandler from '../hooks/useErrorHandler';
import useLoader from '../hooks/useLoader';

import PdfDragOverlay from './PdfDragOverlay';
import QRCodePlacementModal from '../components/modals/QRCodePlacementModal';
import { QRCodePlacement } from '../components/request/QRCodePlacementBox';
import type { Position } from '../types/Template';
import axios from 'axios';

const ConfigureQrCode = () => {
  const { t, i18n } = useTranslation();
  const { templateId } = useParams();
  const { alert, setAlert, handleError } = useErrorHandler(t);

  // Modal controls
  const {
    isOpen: isPlacementModalOpen,
    onOpen: openPlacementModal,
    onClose: closePlacementModal
  } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const loaderHeight = isMobile ? '40vh' : '60vh';
  const { isLoading, setIsLoading, Loader } = useLoader({
    height: loaderHeight
  });

  const [templateFile, setTemplateFile] = useState<Uint8Array | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [hasSavedQrPosition, setHasSavedQrPosition] = useState(false);
  const [selectedPlacement, setSelectedPlacement] =
    useState<QRCodePlacement | null>(null);

  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const isMounted = useRef(true);
  const toast = useToast();

  const goBackBtnColor = useColorModeValue('green.500', 'green.600');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const instructionBg = useColorModeValue('blue.50', 'blue.900');
  const instructionBorder = useColorModeValue('blue.200', 'blue.700');
  const leftBorderColor = useColorModeValue('blue.400', 'blue.600');
  const configureSignatureBtnColor = useColorModeValue('blue.500', 'blue.600');

  const isArabic = i18n.language === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  // Safely set state only if component is mounted
  const safeSetTemplateFile = (data: Uint8Array | null) => {
    if (isMounted.current) {
      setTemplateFile(data);
      setPdfReady(Boolean(data));
    }
  };

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      setPdfReady(false);

      if (!templateId) {
        throw new Error('Template ID is required.');
      }

      const file = await templateService.getFile(templateId);

      // Convert Buffer to Uint8Array which is more stable in React
      if (file) {
        // Create a new Uint8Array to copy the buffer data
        const uint8Array = new Uint8Array(file);
        safeSetTemplateFile(uint8Array);
      } else {
        safeSetTemplateFile(null);
      }
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data instanceof ArrayBuffer
      ) {
        const decoder = new TextDecoder('utf-8');
        const errorMessage = decoder.decode(error.response.data);
        const jsonError = JSON.parse(errorMessage);

        const message = `${t('errors.dataNotFound')}: ${jsonError.message}`;
        setAlert({
          status: 'error',
          message
        });
      } else {
        handleError(error);
      }

      safeSetTemplateFile(null);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;

    fetchTemplate();

    // Cleanup function
    return () => {
      // Mark component as unmounted to prevent state updates
      isMounted.current = false;
      safeSetTemplateFile(null);
      setPdfReady(false);
      setIsSubmitting(false);
      setAlert(null);
    };
  }, [templateId]);

  // When template is loaded, open the placement modal
  useEffect(() => {
    if (pdfReady && templateFile) {
      openPlacementModal();
    }
  }, [pdfReady, templateFile]);

  const handleSaveQrPosition = async (pos: Position) => {
    if (selectedPage === null) {
      setAlert({
        status: 'error',
        message: 'You did not select a page.'
      });

      return;
    }

    try {
      setIsSubmitting(true);
      // For ALL_PAGES, we set the page to 0
      if (selectedPlacement === QRCodePlacement._ALL_PAGES) {
        pos.page = 0;
      }
      await templateService.savePosition(templateId!, pos);

      setHasSavedQrPosition(true); // Mark as saved after successful API call
      toast({
        title: t('configureQrCode.successToast'),
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
        containerStyle: {
          marginTop: '64px'
        }
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlacementSelect = (placement: QRCodePlacement | null) => {
    if (!placement) {
      setAlert({
        status: 'error',
        message: 'Please select a placement option.'
      });

      return;
    }
    setSelectedPlacement(placement);
    closePlacementModal();

    if (placement === QRCodePlacement._SPECIFIC_PAGE) {
      setSelectedPage(null);
    } else {
      // For ALL_PAGES, we'll just use the first page by default without showing the page selection modal
      setSelectedPage(1);
    }
  };

  // Handle PDF rendering
  const renderPdf = () => {
    if (!templateFile || !pdfReady) {
      return null;
    }

    try {
      return (
        <PdfDragOverlay
          pdfBuffer={templateFile}
          imageName="qr.png"
          isSubmitting={isSubmitting}
          onSave={handleSaveQrPosition}
          setSelectedPage={setSelectedPage}
          selectedPage={selectedPage}
          useModalForPageSelection={true}
          onGoBack={openPlacementModal}
        />
      );
    } catch (_) {
      setAlert({
        status: 'error',
        message: t('configureQrCode.errorLoadingPdf')
      });

      return (
        <Flex justify="center" align="center" h="100%">
          <Text color="red.500">Error loading PDF. Please try again.</Text>
        </Flex>
      );
    }
  };

  // Instruction card rendering
  const renderInstructionCard = () => {
    return (
      <Card
        bg={instructionBg}
        borderColor={instructionBorder}
        borderWidth="1px"
        borderLeftWidth="3px"
        borderLeftColor={leftBorderColor}
        borderRadius="md"
        mb={4}
        shadow="sm"
      >
        <CardBody py={3}>
          <Flex align="center">
            <Icon as={FaArrowsAlt} mr={2} />
            <Text fontWeight="medium">
              {t('configureQrCode.dragInstruction')}
            </Text>
          </Flex>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box
      maxW="100%"
      dir={direction}
      w="100%"
      cursor={isSubmitting ? 'wait' : 'default'}
    >
      <Flex my={6} dir={direction}>
        <Box>
          <Heading as="h4" size="md">
            {t('configureQrCode.pageTitle')}
          </Heading>
        </Box>
        <Spacer />
      </Flex>

      {alert && (
        <Alert status={alert.status} my={4} dir={direction}>
          <AlertIcon />
          {alert.message}
        </Alert>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Display instruction card when PDF is ready */}
          {pdfReady && selectedPlacement && !isPlacementModalOpen && (
            <>
              {renderInstructionCard()}
              <Box
                bg={bgColor}
                width="100%"
                p={4}
                borderRadius="md"
                overflow="auto"
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="300px"
              >
                {renderPdf()}
              </Box>

              <HStack
                display="flex"
                justifyContent={isArabic ? 'start' : 'end'}
                p={2}
                spacing={4}
              >
                <ButtonGroup gap="2">
                  <Link to={`/app/configure-template/${templateId}`}>
                    <Button color={goBackBtnColor} border="1px">
                      {t('configureQrCode.buttons.goBack')}
                    </Button>
                  </Link>
                </ButtonGroup>

                <ButtonGroup gap="2">
                  <Link to={'/app/documents'}>
                    <Button
                      color={configureSignatureBtnColor}
                      border="1px"
                      isDisabled={!hasSavedQrPosition}
                    >
                      {t('configureQrCode.buttons.finish')}
                    </Button>
                  </Link>
                </ButtonGroup>
              </HStack>
            </>
          )}

          <QRCodePlacementModal
            isOpen={isPlacementModalOpen}
            onClose={closePlacementModal}
            selectedPlacement={selectedPlacement}
            setSelectedPlacement={setSelectedPlacement}
            isSubmitting={isSubmitting}
            onConfirm={() => handlePlacementSelect(selectedPlacement)}
          />
        </>
      )}
    </Box>
  );
};

export default ConfigureQrCode;
