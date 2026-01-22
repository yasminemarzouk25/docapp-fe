import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  VStack,
  ButtonGroup,
  Button,
  Alert,
  AlertIcon,
  useBreakpointValue,
  useColorModeValue,
  Text,
  Icon,
  Divider,
  Stack,
  useToast
} from '@chakra-ui/react';
import { BsFileText } from 'react-icons/bs';
import { PiMagicWandDuotone } from 'react-icons/pi';
import { FaArrowsAlt } from 'react-icons/fa';

import { requestService } from '../services/requestService';
import { templateService } from '../services/templateService';
import useLoader from '../hooks/useLoader';

import type { Alert as AlertType } from '../types/Alert';
import type { RequestResponse } from '../types/Request';
import type { Position } from '../types/Template';

import PDFViewer from './ocr/PDFViewer';
import DocumentSummaryPanel from './DocumentSummaryPanel';
import PdfDragOverlay from '../pages/PdfDragOverlay';

interface ValidateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  setTableAlert: React.Dispatch<React.SetStateAction<AlertType | null>>;
  id: string;
  formAlert: AlertType | null;
  handleFormError: (_error: unknown) => void;
  handleTableError: (_error: unknown) => void;
  refreshRequestsList: () => void;
  setSelectedRequest: React.Dispatch<
    React.SetStateAction<RequestResponse | null>
  >;
  request: RequestResponse;
}

const ValidateRequestModal: React.FC<ValidateRequestModalProps> = ({
  isOpen,
  onClose,
  setTableAlert,
  id,
  formAlert,
  handleFormError,
  handleTableError,
  refreshRequestsList,
  setSelectedRequest,
  request
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const loaderHeight = isMobile ? '20vh' : '60vh';
  const { isLoading, setIsLoading, Loader } = useLoader({
    height: loaderHeight
  });
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const approveBtnColor = useColorModeValue('#38A169', '#2F855A');
  const rejectBtnColor = useColorModeValue('red.600', 'red.400');
  const previewBg = useColorModeValue('gray.100', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.500');

  const buttonBorderColorLight = useColorModeValue('gray.200', 'gray.500');
  const buttonBgActiveLight = useColorModeValue('gray.300', 'gray.800');
  const buttonBgInactiveLight = useColorModeValue('gray.200', 'gray.600');
  const buttonHoverBgActiveLight = useColorModeValue('gray.300', 'gray.900');
  const buttonHoverBgInactiveLight = useColorModeValue('gray.400', 'gray.800');

  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  // Signature configuration states
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [templateFile, setTemplateFile] = useState<Uint8Array | null>(null);
  const [signaturePdfReady, setSignaturePdfReady] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [signatureConfigured, setSignatureConfigured] = useState(
    request.hasSignature
  );
  const toast = useToast();

  // Computed values
  const needsSignatureConfig =
    request.signatureType === 'DIGITAL' && !request.hasSignature;
  const isReadyForValidation = !needsSignatureConfig || signatureConfigured;
  const showSignaturePrompt = needsSignatureConfig && !signatureConfigured;
  const showValidationTabs = pdfFile && isReadyForValidation;
  const showValidationFooter = pdfFile && isReadyForValidation;

  // Fetch template file for signature configuration
  const fetchTemplateFile = async () => {
    try {
      setIsLoading(true);
      setSignaturePdfReady(false);

      const file = await templateService.getFile(request.template.id);
      if (file) {
        const uint8Array = new Uint8Array(file);
        setTemplateFile(uint8Array);
        setSignaturePdfReady(true);
      } else {
        setTemplateFile(null);
      }
    } catch (error) {
      handleFormError(error);
      setTemplateFile(null);
    } finally {
      setIsLoading(false);
    }
  }; // Handle signature position save
  const handleSaveSignaturePosition = async (pos: Position) => {
    if (selectedPage === null) {
      handleFormError({ message: 'You did not select a page.' });

      return;
    }

    try {
      setIsSubmitting(true);
      await requestService.savePosition(request.id, pos);

      setSignatureConfigured(true);

      // Update the request object to reflect that signature is now configured
      if (setSelectedRequest) {
        setSelectedRequest((prev) =>
          prev ? { ...prev, hasSignature: true } : null
        );
      }

      toast({
        title: t('validateRequest.configureSignature.successToast'),
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
        containerStyle: {
          marginTop: '64px'
        }
      });
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Continue to validation after signature configuration
  const handleContinueToValidation = () => {
    setIsSignatureMode(false);
    setShowSummary(false);
    // Ensure we're in validation mode by marking signature as configured
    setSignatureConfigured(true);
  };

  // Start signature configuration
  const handleStartSignatureConfig = () => {
    setIsSignatureMode(true);
    if (!templateFile) {
      fetchTemplateFile();
    }
  };

  const fetchPdf = async () => {
    try {
      setIsLoading(true);
      const blob = await requestService.previewRequestFile(id);
      const url = URL.createObjectURL(blob);
      setPdfFile(url);
    } catch (error) {
      handleFormError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);
      setSummaryError(null);

      const summary = await requestService.getSummary(id);
      setSummary(summary);

      setShowSummary(true);
    } catch (error) {
      setSummaryError(t('validateRequest.summaryError'));
      handleFormError(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleReviewAction = async (action: 'Approve' | 'Reject') => {
    try {
      setIsSubmitting(true);
      await requestService.reviewRequest({ requestId: id, action });
      refreshRequestsList();

      const messageKey =
        action === 'Approve'
          ? 'validateRequest.successMessage'
          : 'validateRequest.rejectedMessage';

      setTableAlert({
        status: 'info',
        message: t(messageKey)
      });
    } catch (error) {
      handleTableError(error);
    } finally {
      setIsSubmitting(false);
      setSelectedRequest(null);
      onClose();
    }
  };

  const handleApprove = () => handleReviewAction('Approve');
  const handleReject = () => handleReviewAction('Reject');
  useEffect(() => {
    if (isOpen) {
      fetchPdf();
      // Reset summary states when modal opens
      setSummary(null);
      setSummaryError(null);
      setShowSummary(false);
      // Reset signature states based on current request
      setSignatureConfigured(request.hasSignature);
      setIsSignatureMode(false);
    }
  }, [isOpen, request.id]);

  // Clean up the blob URL when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [pdfFile]);

  const isDisabled = isLoading || isSubmitting;

  const getButtonProps = (isActive: boolean, isDisabled: boolean = false) => {
    const borderColor = buttonBorderColorLight;
    const bg = isActive ? buttonBgActiveLight : buttonBgInactiveLight;
    const hoverBg = isActive
      ? buttonHoverBgActiveLight
      : buttonHoverBgInactiveLight;

    return {
      variant: isActive ? 'solid' : 'ghost',
      bg,
      border: '1px',
      borderColor,
      isDisabled,
      _hover: {
        borderColor,
        bg: hoverBg
      }
    };
  };

  // Render signature configuration content
  const renderSignatureConfiguration = () => {
    if (!templateFile || !signaturePdfReady) {
      return (
        <Box
          bg={previewBg}
          height={isMobile ? '200px' : '300px'}
          borderRadius="md"
          p={2}
        >
          <Loader />
        </Box>
      );
    }

    return (
      <>
        <Box
          flex="1"
          bg={previewBg}
          width="100%"
          p={4}
          borderRadius="md"
          overflow="auto"
          display="flex"
          justifyContent="center"
          alignItems="flex-start"
          minHeight="300px"
        >
          <PdfDragOverlay
            pdfBuffer={templateFile}
            imageName="signature.png"
            isSubmitting={isSubmitting}
            onSave={handleSaveSignaturePosition}
            setSelectedPage={setSelectedPage}
            selectedPage={selectedPage}
          />
        </Box>
      </>
    );
  };

  // Render standard validation content
  const renderValidationContent = () => {
    if (isLoading) {
      return (
        <Box bg={previewBg} height="60vh" borderRadius="md" p={2}>
          <Loader />
        </Box>
      );
    }

    if (!pdfFile) {
      return formAlert ? (
        <Alert status={formAlert.status} my={4} dir={isArabic ? 'rtl' : 'ltr'}>
          <AlertIcon />
          {formAlert.message}
        </Alert>
      ) : null;
    }

    return showSummary ? (
      <DocumentSummaryPanel
        summary={summary}
        isSummarizing={isSummarizing}
        summaryError={summaryError}
        isMobile={isMobile!}
        onSummarize={handleSummarize}
        isDisabled={isDisabled}
      />
    ) : (
      <Box
        border="1px"
        borderColor={cardBorderColor}
        height="60vh"
        borderRadius="md"
        overflow="hidden"
      >
        <PDFViewer
          pdfUrl={pdfFile}
          numPages={numPages}
          onLoadSuccess={handlePdfLoadSuccess}
          maxHeight="60vh"
        />
      </Box>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={isMobile ? 'xl' : '3xl'}
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent dir={isArabic ? 'rtl' : 'ltr'}>
          <ModalHeader>
            <VStack spacing={3} align="stretch">
              <Text>
                {isSignatureMode
                  ? t('validateRequest.configureSignature.pageTitle')
                  : t('validateRequest.modalTitle')}
              </Text>
              {/* Show different header content based on mode */}
              {isSignatureMode ? null : showSignaturePrompt ? (
                // Need signature configuration - show configure button
                <Box>
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium">
                        {t('validateRequest.digitalSignature.title')}
                      </Text>
                      <Text fontSize="sm">
                        {t('validateRequest.digitalSignature.description')}
                      </Text>
                    </VStack>
                  </Alert>
                </Box>
              ) : showValidationTabs ? (
                // Standard validation mode with tabs (show when ready for validation)
                <>
                  <Divider />
                  <Stack
                    direction={{ base: 'column', md: 'row' }}
                    spacing={{ base: 2, md: 2 }}
                    align="stretch"
                    justify={{ base: 'stretch', md: 'center' }}
                  >
                    <Button
                      leftIcon={<Icon as={BsFileText} />}
                      size={{ baise: 'sm', md: 'md' }}
                      onClick={() => setShowSummary(false)}
                      {...getButtonProps(!showSummary)}
                    >
                      {t('validateRequest.viewOriginal')}
                    </Button>
                    <Button
                      leftIcon={<Icon as={PiMagicWandDuotone} />}
                      size={{ base: 'sm', md: 'md' }}
                      onClick={() => setShowSummary(true)}
                      {...getButtonProps(showSummary)}
                    >
                      {t('validateRequest.viewSummary')}
                    </Button>
                  </Stack>
                </>
              ) : null}
            </VStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isDisabled} />
          <ModalBody>
            {isSignatureMode ? (
              // Signature configuration content
              renderSignatureConfiguration()
            ) : showSignaturePrompt ? (
              // Show message to start signature configuration
              <VStack spacing={4} align="center" py={8}>
                <Icon as={FaArrowsAlt} boxSize={12} color="blue.500" />
                <Text fontSize="lg" fontWeight="medium" textAlign="center">
                  {/* Configure Your Digital Signature */}

                  {t('validateRequest.digitalSignature.promptTitle')}
                </Text>
                <Text
                  fontSize="md"
                  color="gray.600"
                  textAlign="center"
                  maxW="400px"
                >
                  {t('validateRequest.digitalSignature.promptDescription')}
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleStartSignatureConfig}
                  isLoading={isLoading}
                  loadingText="Loading template..."
                >
                  {t('validateRequest.digitalSignature.configureSignatureBtn')}
                </Button>
              </VStack>
            ) : (
              // Standard validation content (for both signature types when ready)
              renderValidationContent()
            )}
          </ModalBody>
          <ModalFooter>
            {isSignatureMode ? (
              // Signature configuration footer
              signatureConfigured ? (
                <ButtonGroup gap="2">
                  <Button
                    colorScheme="blue"
                    onClick={handleContinueToValidation}
                    isDisabled={isDisabled}
                  >
                    {t('validateRequest.digitalSignature.continueValidation')}
                  </Button>
                </ButtonGroup>
              ) : null
            ) : showValidationFooter ? (
              // Standard validation footer (show when ready for validation)
              <ButtonGroup gap="2">
                <Button
                  color={rejectBtnColor}
                  border="1px"
                  type="reset"
                  onClick={handleReject}
                  isDisabled={isDisabled}
                >
                  {t('validateRequest.buttons.reject')}
                </Button>
                <Button
                  color={approveBtnColor}
                  border="1px"
                  type="submit"
                  onClick={handleApprove}
                  isDisabled={isDisabled}
                >
                  {t('validateRequest.buttons.approve')}
                </Button>
              </ButtonGroup>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ValidateRequestModal;
