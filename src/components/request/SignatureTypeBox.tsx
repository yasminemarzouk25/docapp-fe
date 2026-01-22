import React from 'react';
import { Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import type { SignatureType } from '../../types/Request';

interface SignatureTypeBoxProps {
  icon: IconType;
  title: string;
  signatureType: SignatureType;
  selectedType: SignatureType;
  onClick: () => void;
  isDisabled: boolean;
  darkLightColor: string;
  hasError: boolean;
}

const SignatureTypeBox: React.FC<SignatureTypeBoxProps> = ({
  icon,
  title,
  signatureType,
  selectedType,
  onClick,
  isDisabled,
  darkLightColor,
  hasError
}) => {
  const boxBgColor = useColorModeValue('gray.50', 'gray.700');
  const boxBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBoxBgColor = useColorModeValue('blue.50', 'blue.900');
  const selectedBoxBorderColor = useColorModeValue('blue.500', 'blue.400');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
  const errorBorderColor = useColorModeValue('red.500', 'red.300');
  const isSelected = selectedType === signatureType;

  const bgColor = isSelected ? selectedBoxBgColor : boxBgColor;

  const getErrorBorderColor = (hasError: boolean): string | undefined => {
    return hasError ? errorBorderColor : undefined;
  };

  const borderColor =
    getErrorBorderColor(hasError) ??
    (isSelected ? selectedBoxBorderColor : boxBorderColor);

  const hoverBorderColor =
    getErrorBorderColor(hasError) ?? selectedBoxBorderColor;

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      border="2px solid"
      borderColor={borderColor}
      borderRadius="md"
      bg={bgColor}
      padding={4}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      onClick={isDisabled ? undefined : onClick}
      opacity={isDisabled ? 0.6 : 1}
      flex={1}
      transition="all 0.2s"
      _hover={
        isDisabled
          ? {}
          : {
              borderColor: hoverBorderColor,
              bg: hoverBgColor
            }
      }
    >
      <Icon as={icon} boxSize={8} mb={2} color={darkLightColor} />
      <Text fontSize="sm" fontWeight="medium" textAlign="center">
        {title}
      </Text>
    </Flex>
  );
};

export default SignatureTypeBox;
