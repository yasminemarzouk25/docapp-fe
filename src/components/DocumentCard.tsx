import React, { useEffect, useState } from 'react';
import { Box, Image, Text, Flex, useColorMode } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { templateService } from '../services/templateService';

interface DocumentCardProps {
  documentName: string;
  documentFileName: string;
  templateId: string;
  link: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  documentName,
  documentFileName,
  templateId,
  link
}) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [isHovered, setIsHovered] = useState(false);
  const { colorMode } = useColorMode();

  const TRANSPARENT_BLACK = 'rgba(0, 0, 0, 0.8)';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.300';

  const fetchImage = async (templateId: string) => {
    const data = await templateService.getFirstPageImage(templateId);
    if (data) {
      const url = URL.createObjectURL(data);
      setImageUrl(url);
    }
  };

  useEffect(() => {
    fetchImage(templateId);
  }, [templateId]);

  return (
    <Box
      role="group"
      maxW="280px"
      w="full"
      borderWidth="1px"
      borderColor={borderColor}
      rounded="lg"
      overflow="hidden"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={imageUrl}
        alt={documentFileName}
        objectFit="cover"
        width="100%"
        height="100%"
        transition="filter 0.3s ease-in-out"
        filter={isHovered ? 'blur(3px)' : 'none'}
      />
      <Link to={link} style={{ textDecoration: 'none' }}>
        <Flex
          padding="8px"
          align="center"
          justify="center"
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg={TRANSPARENT_BLACK}
          color="white"
          zIndex={1}
          borderRadius="md"
          width="90%"
          height="12%"
          textAlign="center"
          cursor="pointer"
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.3s ease-in-out"
          overflow="hidden"
        >
          <Text
            fontSize="l"
            overflow="hidden"
            textOverflow="ellipsis"
            maxWidth="100%"
            whiteSpace="nowrap"
          >
            {documentName}
          </Text>
        </Flex>
      </Link>
    </Box>
  );
};

export default DocumentCard;
