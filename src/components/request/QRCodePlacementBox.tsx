import React from 'react';
import type { IconType } from 'react-icons';
import { Flex, Icon, Text, useColorModeValue, Box } from '@chakra-ui/react';

export enum QRCodePlacement {
  _ALL_PAGES = 'ALL_PAGES',
  _SPECIFIC_PAGE = 'SPECIFIC_PAGE'
}

interface QRCodePlacementBoxProps {
  icon: IconType;
  title: string;
  description: string;
  placement: QRCodePlacement;
  selectedPlacement: QRCodePlacement;
  onClick: () => void;
  isDisabled: boolean;
  accentColor: string;
}

const QRCodePlacementBox: React.FC<QRCodePlacementBoxProps> = ({
  icon,
  title,
  description,
  placement,
  selectedPlacement,
  onClick,
  isDisabled,
  accentColor
}) => {
  // Define colors with slight variations from the original
  const boxBgColor = useColorModeValue('gray.50', 'gray.800');
  const boxBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBoxBgColor = useColorModeValue('teal.50', 'teal.900');
  const selectedBoxBorderColor = useColorModeValue('teal.500', 'teal.400');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.650');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const isSelected = selectedPlacement === placement;

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      border="1px solid"
      borderColor={isSelected ? selectedBoxBorderColor : boxBorderColor}
      borderRadius="lg"
      bg={isSelected ? selectedBoxBgColor : boxBgColor}
      padding={5}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      onClick={isDisabled ? undefined : onClick}
      opacity={isDisabled ? 0.6 : 1}
      flex={1}
      transition="all 0.25s"
      boxShadow={isSelected ? 'sm' : 'none'}
      _hover={
        isDisabled
          ? {}
          : {
              borderColor: selectedBoxBorderColor,
              bg: hoverBgColor,
              transform: 'translateY(-2px)',
              boxShadow: 'sm'
            }
      }
    >
      <Box
        p={3}
        borderRadius="full"
        bg={isSelected ? selectedBoxBorderColor : 'transparent'}
        mb={3}
      >
        <Icon
          as={icon}
          boxSize={7}
          color={isSelected ? 'white' : accentColor}
        />
      </Box>
      <Text
        fontSize="md"
        fontWeight="semibold"
        textAlign="center"
        color={isSelected ? selectedBoxBorderColor : textColor}
      >
        {title}
      </Text>
      <Text
        fontSize="xs"
        textAlign="center"
        mt={1}
        color={textColor}
        opacity={0.8}
      >
        {description}
      </Text>
    </Flex>
  );
};

export default QRCodePlacementBox;
