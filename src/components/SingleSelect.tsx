import React from 'react';
import Select, {
  type GroupBase,
  type StylesConfig,
  type Props as SelectProps
} from 'react-select';
import { reactSelectStyles } from '../config/react-select';

export type SingleSelectOption = {
  value: string;
  label: string;
};

interface SingleSelectProps
  extends Omit<
    SelectProps<SingleSelectOption, false>,
    'onChange' | 'value' | 'options'
  > {
  options: SingleSelectOption[];
  value?: string | null;
  onChange?: (_value: string) => void;
  isInvalid: boolean;
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  options,
  value,
  onChange,
  isInvalid,
  ...props
}) => {
  const styleConfig = reactSelectStyles() as StylesConfig<
    SingleSelectOption,
    false,
    GroupBase<SingleSelectOption>
  >;

  const mergedStyles: StylesConfig<
    SingleSelectOption,
    false,
    GroupBase<SingleSelectOption>
  > = {
    ...styleConfig,
    control: (provided, state) => ({
      ...(typeof styleConfig.control === 'function'
        ? styleConfig.control(provided, state)
        : provided),
      cursor: state.isDisabled ? 'not-allowed' : 'default',
      pointerEvents: 'auto',
      opacity: state.isDisabled ? 0.4 : 1,
      borderColor: isInvalid ? '#E53E3E' : provided.borderColor,
      boxShadow: isInvalid ? '0 0 0 1px #E53E3E' : provided.boxShadow,
      '&:hover': {
        borderColor: isInvalid ? '#E53E3E' : undefined
      }
    })
  };

  // Find the selected option from the value string
  const selectedOption = value
    ? options.find((opt) => opt.value === value) || null
    : null;

  // Handle change by extracting just the value string
  const handleChange = (selected: SingleSelectOption | null) => {
    onChange?.(selected?.value || '');
  };

  return (
    <Select<SingleSelectOption, false>
      {...props}
      options={options}
      value={selectedOption}
      isMulti={false}
      styles={mergedStyles}
      onChange={handleChange}
    />
  );
};

export default SingleSelect;
