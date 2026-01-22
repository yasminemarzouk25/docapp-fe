import React from 'react';
import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import type { Alert } from '../../types/Alert';

interface OCRDropzoneProps {
  onDrop: (_acceptedFiles: File[]) => void;
  numPages: number | null;
  isDisabled: boolean;
  setAlert: (_alert: Alert | null) => void;
  uploadedCount: number;
  t: (_key: string) => string;
}

const OCRDropzone: React.FC<OCRDropzoneProps> = ({
  onDrop,
  numPages,
  isDisabled,
  setAlert,
  uploadedCount,
  t
}) => {
  const dropzoneBg = useColorModeValue('gray.50', 'gray.800');
  const dropzoneBorder = useColorModeValue('gray.300', 'gray.600');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop(acceptedFiles) {
      const maxAllowed = (numPages ?? 1) - uploadedCount;
      if (acceptedFiles.length > maxAllowed) {
        setAlert({
          status: 'error',
          message: `You can only upload ${numPages} images in total.`
        });

        return;
      }
      setAlert(null);
      onDrop(acceptedFiles);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true,
    disabled: isDisabled
  });

  return (
    <Box
      {...getRootProps()}
      border="2px"
      borderStyle="dashed"
      borderColor={isDragActive ? 'blue.400' : dropzoneBorder}
      borderRadius="md"
      p={8}
      bg={isDragActive ? 'blue.50' : dropzoneBg}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.6 : 1}
      transition="all 0.2s"
      w="100%"
      textAlign="center"
    >
      <input {...getInputProps()} disabled={isDisabled} />
      <VStack spacing={2}>
        <Text fontSize="lg" fontWeight="bold">
          {isDragActive
            ? t('ocrCompare.dropImagesHere')
            : isDisabled
              ? t('ocrCompare.dropzoneDisabled')
              : t('ocrCompare.clickOrDrag')}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Upload {numPages} images (one per page)
        </Text>
      </VStack>
    </Box>
  );
};

export default OCRDropzone;
