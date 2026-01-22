import React from 'react';
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  type SystemStyleObject
} from '@chakra-ui/react';

import PlaceholderTag from './PlaceholderTag';
import type { Tags } from '../types/Placeholder';
import { useTranslation } from 'react-i18next';

type TagBoxProps = {
  height: string;
  title: string;
  tags: Tags;
  colorScheme: string;
  hasScroll: boolean;
  isSubmitting: boolean;
  children?: React.ReactNode;
};

const TagBox: React.FC<TagBoxProps> = ({
  height,
  title,
  tags,
  colorScheme,
  hasScroll,
  isSubmitting,
  children
}) => {
  const { t } = useTranslation();

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const boxBgColor = useColorModeValue('white', 'gray.900');

  const emptyTagsStyles: SystemStyleObject = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    color: '#aaa',
    backgroundColor: boxBgColor,
    cursor: 'not-allowed'
  };

  return (
    <Flex direction="column" gap="2" align="start">
      <Text fontSize="lg">{title}</Text>
      {children}
      <Box
        w="100%"
        h={height}
        border="1px"
        borderColor={borderColor}
        boxShadow="sm"
        p={4}
        overflowY={hasScroll ? 'auto' : 'visible'}
        sx={tags.length === 0 ? emptyTagsStyles : {}}
      >
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <PlaceholderTag
              key={index}
              tag={tag}
              colorScheme={colorScheme}
              canDrag={!isSubmitting}
            />
          ))
        ) : (
          <Text userSelect="none">
            {t('configureTemplate.chooseLabelsToFilter')}
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default TagBox;
