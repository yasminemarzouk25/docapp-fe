import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  CloseButton,
  useColorModeValue,
  Divider,
  Badge,
  useBreakpointValue,
  Spacer
} from '@chakra-ui/react';
import { pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';

import OCRDropzone from '../components/ocr/OcrDropzone';
import { requestService } from '../services/requestService';
import useErrorHandler from '../hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import Image from '../components/Image';
import PDFViewer from '../components/ocr/PDFViewer';
import UploadedImagesGrid from '../components/ocr/UploadedImagesGrid';
import useLoader from '../hooks/useLoader';
import type { OcrCompareResult } from '../types/Request';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface UploadedImage {
  file: File;
  preview: string;
  pageIndex: number;
}

const OCRComparePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [comparisonResults, setComparisonResults] = useState<
    OcrCompareResult[]
  >([]);
  const [isComparing, setIsComparing] = useState(false);
  const { t } = useTranslation();
  const { alert, setAlert, handleError } = useErrorHandler(t);

  // Responsive values - Reduced sizes for better fit
  const isMobile = useBreakpointValue({ base: true, md: false });

  const loaderHeight = isMobile ? '20vh' : '60vh';
  const { Loader, isLoading, setIsLoading } = useLoader({
    height: loaderHeight
  });

  const containerDirection = useBreakpointValue({
    base: 'column',
    lg: 'row'
  }) as 'column' | 'row';

  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const originalImgBorder = useColorModeValue('blue.200', 'blue.600');
  const scannedImgBorder = useColorModeValue('green.200', 'green.600');
  const resultBoxBg = useColorModeValue('white', 'gray.800');
  const resultHeadingColor = useColorModeValue('gray.700', 'gray.200');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!numPages) return;

      const newImages = acceptedFiles.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        pageIndex: uploadedImages.length + index
      }));

      setUploadedImages((prev) => [...prev, ...newImages]);
    },
    [numPages, uploadedImages.length]
  );

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOCRCompare = async () => {
    if (uploadedImages.length !== numPages) {
      setAlert({
        status: 'error',
        message: `Please upload exactly ${numPages} images to match the PDF pages.`
      });

      return;
    }

    setIsComparing(true);
    try {
      const files = uploadedImages.map((img) => img.file);
      const ocrResults = await requestService.ocrCompare(id!, files);
      setComparisonResults(ocrResults);
      setAlert({
        status: 'success',
        message: 'OCR comparison completed successfully!'
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsComparing(false);
    }
  };

  const handleStartComparison = () => {
    setShowComparison(true);
  };

  const handleBackToView = () => {
    setShowComparison(false);
    setUploadedImages([]);
    setComparisonResults([]);
  };

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const fetchPdf = async () => {
      try {
        const { blob, filename } = await requestService.getOriginal(id);
        if (!isMounted) return;
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setPdfFilename(filename || null);
      } catch (error) {
        if (!isMounted) return;
        setPdfUrl(null);
        setPdfFilename(null);
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPdf();

    // Cleanup object URL on unmount
    return () => {
      isMounted = false;
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [id]);

  const getOrientation = () => {
    return isMobile ? 'horizontal' : 'vertical';
  };

  const getUploadAreaStyles = () => {
    return isMobile
      ? { flex: 'none', minW: '100%' }
      : { flex: '1', minW: '280px' };
  };

  return (
    <>
      <Box p={6} minH="100vh" maxW="100vw" overflow="hidden">
        <VStack spacing={6} align="stretch" ml="-24px">
          {/* Header */}
          <Flex justify="space-between" align="center" flexWrap="wrap">
            <Box>
              <Heading as="h4" size="md">
                {t('ocrCompare.title')}
              </Heading>
              <Spacer />
            </Box>
            <Text fontSize="sm" color="gray.500" noOfLines={1}>
              {t('ocrCompare.currentlyViewing')}: {pdfFilename || '...'}
            </Text>
          </Flex>

          {/* Alert */}
          {alert && (
            <Alert status={alert.status}>
              <AlertIcon />
              <Text>{alert.message}</Text>
              <CloseButton
                position="absolute"
                right="8px"
                top="8px"
                onClick={() => setAlert(null)}
              />
            </Alert>
          )}

          {isLoading ? (
            <Loader />
          ) : (
            <>
              {pdfUrl && !showComparison && (
                /* PDF View Mode */
                <VStack spacing={4} align="center">
                  <HStack spacing={4} flexWrap="wrap">
                    <Badge colorScheme="blue" p={2}>
                      Pages: {numPages || 'Loading...'}
                    </Badge>
                    <Button
                      colorScheme="green"
                      size={isMobile ? 'sm' : 'md'}
                      onClick={handleStartComparison}
                      isDisabled={!numPages}
                    >
                      {t('ocrCompare.startOcrCompare')}
                    </Button>
                  </HStack>

                  <PDFViewer
                    pdfUrl={pdfUrl}
                    numPages={numPages}
                    onLoadSuccess={onDocumentLoadSuccess}
                  />
                </VStack>
              )}

              {pdfUrl && showComparison && comparisonResults.length === 0 && (
                /* Upload Mode */
                <Flex direction={containerDirection} gap={4} align="stretch">
                  {/* Left Side - PDF Pages */}
                  <Box {...getUploadAreaStyles()}>
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <Heading as="h3" size="sm">
                          {t('ocrCompare.originalDocument')}
                        </Heading>
                        <Button
                          size="sm"
                          onClick={handleBackToView}
                          isDisabled={isComparing}
                        >
                          {t('ocrCompare.backToView')}
                        </Button>
                      </HStack>

                      <PDFViewer
                        pdfUrl={pdfUrl}
                        numPages={numPages}
                        onLoadSuccess={onDocumentLoadSuccess}
                        maxHeight="60vh"
                      />
                    </VStack>
                  </Box>

                  <Divider orientation={getOrientation()} />

                  {/* Right Side - Upload Area */}
                  <Box
                    flex={isMobile ? 'none' : '1'}
                    minW={isMobile ? '100%' : '280px'}
                  >
                    <VStack spacing={3}>
                      <Heading as="h3" size="sm">
                        {t('ocrCompare.uploadScannedImages')} (
                        {uploadedImages.length}/{numPages || 0})
                      </Heading>

                      {/* Use the new OCRDropzone component */}
                      <OCRDropzone
                        onDrop={onDrop}
                        numPages={numPages}
                        isDisabled={uploadedImages.length === (numPages || 0)}
                        setAlert={setAlert}
                        uploadedCount={uploadedImages.length}
                        t={t}
                      />

                      <UploadedImagesGrid
                        uploadedImages={uploadedImages}
                        isSubmitting={isComparing}
                        onRemoveImage={removeImage}
                        t={t}
                      />

                      {/* OCR Compare Button */}
                      <Button
                        colorScheme="blue"
                        size={isMobile ? 'md' : 'lg'}
                        onClick={handleOCRCompare}
                        isLoading={isComparing}
                        loadingText="Comparing..."
                        isDisabled={uploadedImages.length !== numPages}
                        w="100%"
                      >
                        {t('ocrCompare.ocrCompare')}
                      </Button>
                    </VStack>
                  </Box>
                </Flex>
              )}

              {pdfUrl && comparisonResults.length > 0 && (
                /* Results Mode */
                <VStack spacing={4} w="100%">
                  {/* Display each page comparison in its own row */}
                  <VStack spacing={6} w="100%" align="stretch">
                    {comparisonResults.map((result, index) => (
                      <Box
                        key={index}
                        w="100%"
                        border="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        p={4}
                        bg={resultBoxBg}
                        boxShadow="sm"
                      >
                        <VStack spacing={3} w="100%">
                          {/* Page Header */}
                          <Box textAlign="center" w="100%">
                            <Heading
                              as="h4"
                              size="sm"
                              color={resultHeadingColor}
                            >
                              Page {result.index} Comparison
                            </Heading>
                            <Divider mt={2} />
                          </Box>

                          {/* Images Row */}
                          <Flex
                            direction={isMobile ? 'column' : 'row'}
                            gap={4}
                            w="100%"
                            justify="center"
                            align="stretch"
                          >
                            {/* Original Image */}
                            <Box flex="1" maxW={isMobile ? '100%' : '45%'}>
                              <VStack spacing={2}>
                                <Badge colorScheme="blue" fontSize="xs" p={1}>
                                  {t('ocrCompare.originalDocument')}
                                </Badge>
                                <Box
                                  border="2px"
                                  borderColor={originalImgBorder}
                                  borderRadius="lg"
                                  overflow="hidden"
                                  boxShadow="md"
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Image
                                    url={result.original}
                                    alt={`Original page ${result.index + 1}`}
                                    width="100%"
                                    height="100%"
                                    style={{
                                      objectFit: 'cover',
                                      display: 'block'
                                    }}
                                  />
                                </Box>
                              </VStack>
                            </Box>

                            {/* VS Indicator (hidden on mobile) */}
                            {!isMobile && (
                              <Flex align="center" justify="center" px={2}>
                                <Badge
                                  colorScheme="gray"
                                  fontSize="md"
                                  p={2}
                                  borderRadius="full"
                                  variant="solid"
                                >
                                  VS
                                </Badge>
                              </Flex>
                            )}

                            {/* Scanned Image */}
                            <Box flex="1" maxW={isMobile ? '100%' : '45%'}>
                              <VStack spacing={2}>
                                <Badge colorScheme="green" fontSize="xs" p={1}>
                                  {t('ocrCompare.scannedDocument')}
                                </Badge>
                                <Box
                                  border="2px"
                                  borderColor={scannedImgBorder}
                                  borderRadius="lg"
                                  overflow="hidden"
                                  boxShadow="md"
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Image
                                    url={result.input}
                                    alt={`Scanned page ${result.index + 1}`}
                                    width="100%"
                                    height="100%"
                                    style={{
                                      objectFit: 'cover',
                                      display: 'block'
                                    }}
                                  />
                                </Box>
                              </VStack>
                            </Box>
                          </Flex>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              )}
            </>
          )}
        </VStack>
      </Box>
    </>
  );
};

export default OCRComparePage;
