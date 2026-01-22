import React, { type ChangeEvent } from 'react';
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel
} from '@chakra-ui/react';

interface IntegerInputProps {
  name: string;
  label: string;
  isRequired: boolean;
  onChange: (_event: ChangeEvent<HTMLInputElement>) => void;
  onIncrementDecrement: (_value: number) => void;
}

const IntegerInput: React.FC<IntegerInputProps> = ({
  name,
  label,
  isRequired,
  onChange,
  onIncrementDecrement
}) => (
  <FormControl isRequired={isRequired}>
    <FormLabel>{label}</FormLabel>

    <NumberInput name={name} step={1} min={0} precision={0} defaultValue={0}>
      <NumberInputField onChange={onChange} />
      <NumberInputStepper>
        <NumberIncrementStepper onClick={() => onIncrementDecrement(1)} />
        <NumberDecrementStepper onClick={() => onIncrementDecrement(-1)} />
      </NumberInputStepper>
    </NumberInput>
  </FormControl>
);

export default IntegerInput;
