import { type ChangeEvent, forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useColorModeValue
} from '@chakra-ui/react';

interface FormFieldProps {
  label: string;
  type: string;
  value?: string;
  darkLightColor: string;
  isMobile: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  error?: string;
  onChange: (_event: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      type,
      value,
      darkLightColor,
      isMobile,
      isRequired = false,
      isDisabled = false,
      isReadOnly = false,
      error,
      onChange,
      ...rest
    },
    ref
  ) => {
    const disabledBg = useColorModeValue('gray.100', 'gray.600');
    const disabledText = useColorModeValue('gray.600', 'gray.400');
    const disabledBorder = useColorModeValue('gray.300', 'gray.600');
    const isInactive = isDisabled || isReadOnly;

    return (
      <FormControl
        isRequired={isRequired}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={Boolean(error)}
      >
        <FormLabel color={darkLightColor} mb={isMobile ? 1 : 0}>
          {label}
        </FormLabel>
        <Input
          ref={ref}
          value={value}
          type={type}
          onChange={onChange}
          cursor={isInactive ? 'not-allowed' : 'auto'}
          userSelect={isInactive ? 'none' : 'auto'}
          bg={isInactive ? disabledBg : 'transparent'}
          color={isInactive ? disabledText : darkLightColor}
          borderColor={isInactive ? disabledBorder : 'inherit'}
          opacity={isDisabled ? 0.6 : 1}
          onFocus={(e) => {
            if (isInactive) {
              e.target.blur();
            }
            rest.onFocus?.(e);
          }}
          tabIndex={isInactive ? -1 : undefined}
          {...rest}
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
