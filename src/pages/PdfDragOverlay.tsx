import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import interact from 'interactjs';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Button,
  Text,
  Flex,
  useBreakpointValue,
  Box,
  Tabs,
  TabList,
  Tab,
  Alert,
  AlertIcon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  useDisclosure
} from '@chakra-ui/react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { Position } from '../types/Template';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type Props = {
  pdfBuffer: Uint8Array;
  imageName: string;
  isSubmitting: boolean;
  onSave: (_result: Position) => void;
  selectedPage: number | null;
  setSelectedPage: (_page: number | null) => void;
  /** When true, shows a modal for page selection (used by ConfigureQrCode). When false/undefined, shows inline tabs. */
  useModalForPageSelection?: boolean;
  /** Callback when user clicks "Go Back" in the modal (only used when useModalForPageSelection is true) */
  onGoBack?: () => void;
};

const PdfDragOverlay = ({
  pdfBuffer,
  imageName,
  isSubmitting,
  onSave,
  selectedPage,
  setSelectedPage,
  useModalForPageSelection = false,
  onGoBack
}: Props) => {
  const { t } = useTranslation();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0
  });
  const [imageSizePx, setImageSizePx] = useState<{
    width: number;
    height: number;
  }>({
    width: 80,
    height: 80
  });
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [resizeMode, setResizeMode] = useState(false);

  const renderedWidth = useBreakpointValue({
    base: 300,
    md: 600,
    lg: 600
  });

  const defaultSize = useBreakpointValue({
    base: 60,
    md: 80,
    lg: 80
  });

  const pageRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);

  // Color mode values
  const tabBg = useColorModeValue('transparent', 'transparent');
  const selectedTabBorderColor = useColorModeValue('blue.500', 'blue.400');
  const selectedTabColor = useColorModeValue('blue.600', 'blue.300');
  const tabTextColor = useColorModeValue('gray.600', 'gray.400');
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const infoBorderColor = useColorModeValue('blue.200', 'blue.700');

  const memoizedFile = useMemo(() => {
    return { data: new Uint8Array(pdfBuffer) };
  }, [pdfBuffer]);

  useEffect(() => {
    if (!selectedPage || !isPageLoaded) return;

    const imageEl = document.querySelector('.draggable-image') as HTMLElement;
    if (!imageEl) return;

    interact(imageEl).unset();

    if (resizeMode) {
      interact(imageEl).resizable({
        edges: { left: false, right: true, bottom: true, top: false },
        modifiers: [
          interact.modifiers.restrictEdges({
            outer: 'parent'
          }),
          interact.modifiers.restrictSize({
            min: { width: 40, height: 40 },
            max: { width: 200, height: 200 }
          })
        ],
        listeners: {
          move(event) {
            let { x, y } = event.target.dataset;

            x = parseFloat(x || '0');
            y = parseFloat(y || '0');

            const newWidth = event.rect.width;
            const newHeight = event.rect.height;

            event.target.style.width = `${newWidth}px`;
            event.target.style.height = `${newHeight}px`;
            event.target.style.transform = `translate(${x}px, ${y}px)`;

            setImageSizePx({ width: newWidth, height: newHeight });
          }
        }
      });
    } else {
      interact(imageEl).draggable({
        inertia: false,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: false // This is the key change - continuous restriction instead of endOnly
          })
        ],
        listeners: {
          move(event) {
            const target = event.target as HTMLElement;
            const parent = target.parentElement as HTMLElement;

            // Get current position or default to 0
            let x = parseFloat(target.getAttribute('data-x') || '0') || 0;
            let y = parseFloat(target.getAttribute('data-y') || '0') || 0;

            // Update position with delta movement
            x += event.dx;
            y += event.dy;

            // Get boundaries
            const imageWidth = target.offsetWidth;
            const imageHeight = target.offsetHeight;
            const containerWidth = parent.offsetWidth;
            const containerHeight = parent.offsetHeight;

            // Apply boundary limits - ensure the image stays fully within the parent container
            x = Math.max(0, Math.min(x, containerWidth - imageWidth));
            y = Math.max(0, Math.min(y, containerHeight - imageHeight));

            // Apply the transform and update data attributes
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x.toString());
            target.setAttribute('data-y', y.toString());

            setImagePosition({ x, y });
          }
        }
      });
    }
  }, [resizeMode, selectedPage, isPageLoaded]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);

    if (useModalForPageSelection) {
      // Modal mode: open modal for page selection if no page selected
      if (selectedPage === null) {
        onOpen();
      }
    } else if (selectedPage === null) {
      // Tabs mode: auto-select page 1
      setSelectedPage(1);
    }
  };

  const handleModalPageSelection = () => {
    if (selectedPage !== null) onClose();
  };

  const handleGoBack = () => {
    onClose();
    setSelectedPage(null);
    if (onGoBack) {
      onGoBack();
    }
  };

  useEffect(() => {
    // Initialize default image size when page loads
    if (isPageLoaded && defaultSize) {
      setImageSizePx({
        width: defaultSize,
        height: defaultSize
      });
    }
  }, [isPageLoaded, defaultSize]);

  const handlePageRenderSuccess = () => {
    setIsPageLoaded(true);
  };

  // Fix the position of the image when stopping resize mode
  const adjustImagePosition = () => {
    const imageEl = document.querySelector('.draggable-image') as HTMLElement;
    if (!imageEl || !pageRef.current) return;

    const containerWidth = pageRef.current.clientWidth;
    const containerHeight = pageRef.current.clientHeight;
    const imageWidth = imageSizePx.width;
    const imageHeight = imageSizePx.height;

    // Get current position
    let x = parseFloat(imageEl.getAttribute('data-x') || '0') || 0;
    let y = parseFloat(imageEl.getAttribute('data-y') || '0') || 0;

    // Check if image exceeds boundaries
    if (x + imageWidth > containerWidth) {
      // If right edge exceeds container, move it back
      x = containerWidth - imageWidth;
    }

    if (y + imageHeight > containerHeight) {
      // If bottom edge exceeds container, move it back
      y = containerHeight - imageHeight;
    }

    // Make sure x and y are not negative
    x = Math.max(0, x);
    y = Math.max(0, y);

    // Update position
    imageEl.style.transform = `translate(${x}px, ${y}px)`;
    imageEl.setAttribute('data-x', x.toString());
    imageEl.setAttribute('data-y', y.toString());

    setImagePosition({ x, y });
  };

  const handleSave = () => {
    const container = pageRef.current;
    if (!container) return;

    const renderedHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    let xPercent =
      (imagePosition.x / (containerWidth - imageSizePx.width)) * 100;
    let yPercent =
      (imagePosition.y / (renderedHeight - imageSizePx.height)) * 100;

    xPercent = Math.max(0, Math.min(xPercent, 100));
    yPercent = Math.max(0, Math.min(yPercent, 100));

    onSave({
      page: selectedPage!,
      x: Number(xPercent.toFixed(2)),
      y: Number(yPercent.toFixed(2)),
      width: Number(imageSizePx.width.toFixed(2)),
      height: Number(imageSizePx.height.toFixed(2))
    });
  };

  const isPageSelected = selectedPage !== null && selectedPage !== 0;
  const hasMultiplePages = numPages !== null && numPages > 1;

  const handlePageChange = (index: number) => {
    const newPage = index + 1;
    setSelectedPage(newPage);
    // Reset position when changing pages
    setImagePosition({ x: 0, y: 0 });
    setIsPageLoaded(false);
  };

  const toggleResizeMode = () => {
    // If we're turning resize mode off, adjust the image position
    if (resizeMode) {
      adjustImagePosition();
    }
    setResizeMode((prev) => !prev);
  };

  return (
    <Box width="100%" maxWidth="100%">
      {/* Combined instruction - show drag instruction, and page selection info for multi-page (only for tabs mode) */}
      {!useModalForPageSelection && (
        <Alert
          status="info"
          bg={infoBg}
          borderColor={infoBorderColor}
          borderWidth="1px"
          borderRadius="md"
          mb={4}
          py={2}
        >
          <AlertIcon boxSize={4} />
          <Text fontSize="sm">
            {hasMultiplePages
              ? t('pdfOverlay.dragAndSelectPageInfo')
              : t('pdfOverlay.dragInfo')}
          </Text>
        </Alert>
      )}

      {/* Page tabs - only show for multi-page PDFs in tabs mode */}
      {!useModalForPageSelection && hasMultiplePages && numPages && (
        <Tabs
          index={selectedPage ? selectedPage - 1 : 0}
          onChange={handlePageChange}
          variant="unstyled"
          mb={4}
          size="sm"
        >
          <TabList gap={1} flexWrap="wrap" justifyContent="center">
            {Array.from({ length: numPages }, (_, i) => (
              <Tab
                key={i + 1}
                bg={tabBg}
                color={selectedPage === i + 1 ? selectedTabColor : tabTextColor}
                borderBottom="2px solid"
                borderColor={
                  selectedPage === i + 1
                    ? selectedTabBorderColor
                    : 'transparent'
                }
                borderRadius="0"
                px={3}
                py={1.5}
                fontSize="sm"
                fontWeight={selectedPage === i + 1 ? 'semibold' : 'normal'}
                transition="all 0.2s"
                _selected={{
                  color: selectedTabColor,
                  borderColor: selectedTabBorderColor
                }}
                _hover={{
                  color: selectedTabColor,
                  bg: useColorModeValue('gray.50', 'gray.800')
                }}
              >
                {t('pdfOverlay.page', 'Page')} {i + 1}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      )}

      {/* PDF Document */}
      <Box overflowX="auto">
        <Flex justifyContent="center" width="100%">
          <Document
            file={memoizedFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={''}
          >
            {isPageSelected && (
              <div
                ref={pageRef}
                style={{
                  position: 'relative',
                  border: '1px solid black',
                  width: '100%',
                  maxWidth: '100%'
                }}
              >
                <Page
                  pageNumber={selectedPage}
                  width={renderedWidth as number}
                  renderTextLayer={false}
                  onRenderSuccess={handlePageRenderSuccess}
                />
                {isPageLoaded && (
                  <>
                    <img
                      src={`/${imageName}`}
                      alt="Draggable Overlay"
                      className="draggable-image"
                      data-page={selectedPage}
                      data-x={imagePosition.x}
                      data-y={imagePosition.y}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${imageSizePx.width}px`,
                        height: `${imageSizePx.height}px`,
                        transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                        cursor: resizeMode ? 'nwse-resize' : 'move',
                        zIndex: 10,
                        border: '2px solid red',
                        touchAction: 'none'
                      }}
                    />
                    {resizeMode && (
                      <>
                        {/* Right edge handle */}
                        <div
                          style={{
                            position: 'absolute',
                            top: `${imagePosition.y}px`,
                            left: `${imagePosition.x + imageSizePx.width - 4}px`,
                            width: '8px',
                            height: `${imageSizePx.height}px`,
                            borderRight: '2px dashed #3182ce',
                            cursor: 'ew-resize',
                            zIndex: 20,
                            pointerEvents: 'none',
                            background: 'transparent'
                          }}
                        />
                        {/* Bottom edge handle */}
                        <div
                          style={{
                            position: 'absolute',
                            top: `${imagePosition.y + imageSizePx.height - 4}px`,
                            left: `${imagePosition.x}px`,
                            width: `${imageSizePx.width}px`,
                            height: '8px',
                            borderBottom: '2px dashed #3182ce',
                            cursor: 'ns-resize',
                            zIndex: 20,
                            pointerEvents: 'none',
                            background: 'transparent'
                          }}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </Document>
        </Flex>
      </Box>

      {/* Action buttons */}
      {isPageSelected && isPageLoaded && (
        <Flex gap={4} justify="center" mt={4}>
          <Button
            onClick={toggleResizeMode}
            colorScheme={resizeMode ? 'red' : 'blue'}
            size="sm"
          >
            {resizeMode
              ? t('pdfOverlay.stopResizing', 'Stop Resizing')
              : t('pdfOverlay.resizeImage', 'Resize Image')}
          </Button>
          <Button
            colorScheme="green"
            onClick={handleSave}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText={t('pdfOverlay.submitting')}
            size="sm"
          >
            {t('pdfOverlay.saveAndReturnPosition')}
          </Button>
        </Flex>
      )}

      {/* Page Selection Modal - only used when useModalForPageSelection is true */}
      {useModalForPageSelection && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          initialFocusRef={initialRef}
          isCentered
          closeOnOverlayClick={false}
          closeOnEsc={false}
          size="lg"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('pdfOverlay.modalHeader')}</ModalHeader>
            <ModalBody>
              <Text mb={2} fontSize="md">
                {t(
                  'pdfOverlay.modalDescription',
                  'Choose the page where you want to place the image.'
                )}
              </Text>
              <Flex direction="column" gap={3}>
                <Select
                  ref={initialRef}
                  placeholder={t('pdfOverlay.selectPage')}
                  onChange={(e) => setSelectedPage(Number(e.target.value))}
                  value={selectedPage || ''}
                >
                  {Array.from(new Array(numPages), (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {t('pdfOverlay.page')} {i + 1}
                    </option>
                  ))}
                </Select>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                colorScheme="gray"
                borderColor="gray.600"
                mr={3}
                onClick={handleGoBack}
                isDisabled={isSubmitting}
              >
                {t('pdfOverlay.goBack')}
              </Button>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={handleModalPageSelection}
                isDisabled={!isPageSelected}
              >
                {t('pdfOverlay.confirm')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default PdfDragOverlay;
