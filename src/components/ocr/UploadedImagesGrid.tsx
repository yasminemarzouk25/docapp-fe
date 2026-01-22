import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  SimpleGrid,
  useColorModeValue,
  useBreakpointValue
} from '@chakra-ui/react';

interface UploadedImage {
  file: File;
  preview: string;
  pageIndex: number;
}

interface UploadedImagesGridProps {
  uploadedImages: UploadedImage[];
  isSubmitting: boolean;
  onRemoveImage: (_index: number) => void;
  t: (_key: string) => string;
}

const UploadedImagesGrid: React.FC<UploadedImagesGridProps> = ({
  uploadedImages,
  isSubmitting,
  onRemoveImage,
  t
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (uploadedImages.length === 0) {
    return null;
  }

  return (
    <VStack spacing={3} w="100%" align="stretch">
      <Text fontWeight="bold" fontSize="sm">
        {t('ocrCompare.uploadedImages')}:
      </Text>
      <SimpleGrid columns={isMobile ? 1 : 2} spacing={2}>
        {uploadedImages.map((image, index) => (
          <Box
            key={index}
            border="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={2}
            position="relative"
          >
            <Text fontSize="xs" mb={2}>
              {t('ocrCompare.page')} {index + 1}
            </Text>
            <img
              src={image.preview}
              alt={`Uploaded ${index + 1}`}
              style={{
                width: '180px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '4px',
                display: 'block',
                margin: '0 auto'
              }}
            />
            <Button
              size="xs"
              colorScheme="red"
              position="absolute"
              top="1"
              right="1"
              onClick={() => onRemoveImage(index)}
              isDisabled={isSubmitting}
            >
              ×
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default UploadedImagesGrid;
