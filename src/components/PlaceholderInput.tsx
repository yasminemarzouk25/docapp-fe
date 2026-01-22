import React from 'react';
import { Input, useColorModeValue } from '@chakra-ui/react';

type PlaceholderInputProps = {
  placeholderName: string;
  placeholderValue: string;
  onChange: (_name: string, _value: string) => void;
};

const PlaceholderInput: React.FC<PlaceholderInputProps> = ({
  placeholderName,
  placeholderValue,
  onChange
}) => {
  const placeholderTextColor = useColorModeValue('gray.400', 'gray.200');

  return (
    <Input
      name={placeholderName}
      value={placeholderValue}
      placeholder={placeholderName}
      onChange={(e) => onChange(placeholderName, e.target.value)}
      size="sm"
      width="auto"
      display="inline-block"
      variant="outline"
      autoComplete="off"
      autoCorrect="off"
      m={1}
      sx={{
        '::placeholder': {
          color: placeholderTextColor
        }
      }}
    />
  );
};

export default PlaceholderInput;
