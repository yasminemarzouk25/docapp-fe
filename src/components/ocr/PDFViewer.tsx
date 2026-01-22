import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  useBreakpointValue
} from '@chakra-ui/react';
import { Document, Page } from 'react-pdf';

interface PDFViewerProps {
  pdfUrl: string;
  numPages: number | null;
  onLoadSuccess: (_data: { numPages: number }) => void;
  maxHeight?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  numPages,
  onLoadSuccess,
  maxHeight = '70vh'
}) => {
  // Color mode values
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const pageBoxBg = useColorModeValue('white', 'gray.900');

  // Responsive PDF width
  const pdfWidth = useBreakpointValue({
    base: 280,
    sm: 420,
    md: 400,
    lg: 450,
    xl: 500
  });

  const renderPages = () => {
    if (!numPages) return null;

    return Array.from(new Array(numPages), (_, index) => (
      <Box
        key={`page_${index + 1}`}
        p={2}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        boxShadow="xs"
        bg={pageBoxBg}
        maxW="100%"
      >
        <Page
          pageNumber={index + 1}
          width={pdfWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Box>
    ));
  };

  return (
    <Box p={3} maxH={maxHeight} overflowY="auto" w="100%">
      <Document
        file={pdfUrl}
        onLoadSuccess={onLoadSuccess}
        loading={<Text>Loading PDF...</Text>}
        error={<Text color="red.500">Error loading PDF</Text>}
      >
        <VStack spacing={3}>{renderPages()}</VStack>
      </Document>
    </Box>
  );
};

export default PDFViewer;
