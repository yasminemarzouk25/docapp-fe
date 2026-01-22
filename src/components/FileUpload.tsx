import React, { useState, type ReactElement } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { AttachmentIcon, Icon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  accept: Accept; // ! Temporary fix:  Define accepted file types if needed in the future
  maxSize: number;
  disabled: boolean;
  onDrop: (_acceptedFile: File) => void;
  expectedFileType: 'pdf' | 'docx' | 'image' | 'decharge';
}
const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize,
  disabled,
  onDrop,
  expectedFileType
}) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    multiple: false,
    disabled,
    onDrop([acceptedFile], fileRejections) {
      if (fileRejections.length > 0) {
        if (expectedFileType === 'docx') {
          setError(t('addTemplate.uploadFileError'));
        } else if (expectedFileType === 'pdf') {
          setError(t('uploadSignedPdf.uploadFileError'));
        } else if (expectedFileType === 'image') {
          setError(t('signatureModal.uploadFileError'));
        } else if (expectedFileType === 'decharge') {
          setError(t('uploadDechargePdf.uploadFileError'));
        }
        setFileName(null);
      } else {
        setError(null);
        setFileName(acceptedFile.name);
        onDrop(acceptedFile);
      }
    }
  });

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const backgroundColor = isDragActive ? 'blue.50' : inputBgColor;

  let borderColor;
  if (error) {
    borderColor = 'red.500';
  } else if (isDragActive) {
    borderColor = 'blue.200';
  } else {
    borderColor = 'gray.200';
  }

  const getDropzoneText = (
    fileName: string | null,
    isDragActive: boolean,
    t: (_key: string) => string
  ): ReactElement => {
    if (fileName) {
      return <Text fontSize="xl">{fileName}</Text>;
    }
    if (isDragActive) {
      return <Text>{t('addTemplate.dragDrop')}</Text>;
    }

    return <Text fontSize="xl">{t('addTemplate.uploadContent')}</Text>;
  };

  return (
    <>
      <Box
        {...getRootProps()}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        borderWidth="2px"
        borderStyle="dashed"
        borderColor={borderColor}
        borderRadius="lg"
        p="6"
        textAlign="center"
        backgroundColor={backgroundColor}
        mb="4"
        height="200px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <input {...getInputProps()} />
        <Box mb="4">
          <Icon as={AttachmentIcon} fontSize="4xl" color="gray.400" />
        </Box>
        {getDropzoneText(fileName, isDragActive, t)}
      </Box>

      {error && (
        <Text color="red.500" mt="4">
          {error}
        </Text>
      )}
    </>
  );
};
export default FileUpload;
