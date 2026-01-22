import React from 'react';
import Select, {
  type GroupBase,
  type StylesConfig,
  type Props as SelectProps,
  type SingleValueProps,
  type OptionProps,
  components
} from 'react-select';
import { Box, Icon, useColorModeValue } from '@chakra-ui/react';
import {
  BsChevronDoubleUp,
  BsChevronUp,
  BsDash,
  BsChevronDown,
  BsChevronDoubleDown
} from 'react-icons/bs';
import { IoArrowUp } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { reactSelectStyles } from '../config/react-select';

export type PriorityOption = {
  value: string;
  label: string;
  color: string;
  icon: React.ElementType;
};

export type PriorityConfig = {
  value: string;
  color: string;
  icon: React.ElementType;
};

// Priority config without labels (labels are added with translations)
export const priorityConfig: PriorityConfig[] = [
  { value: '6', color: '#CF3A32', icon: IoArrowUp },
  { value: '5', color: '#E2553A', icon: BsChevronDoubleUp },
  { value: '4', color: '#E2553A', icon: BsChevronUp },
  { value: '3', color: '#E97F33', icon: BsDash },
  { value: '2', color: '#2A7EC9', icon: BsChevronDown },
  { value: '1', color: '#2A7EC9', icon: BsChevronDoubleDown }
];

// Get priority config by priority number
export const getPriorityConfig = (
  priority: number
): PriorityConfig | undefined => {
  return priorityConfig.find((config) => config.value === priority.toString());
};

// Hook to get priority options with translated labels
export const usePriorityOptions = (): PriorityOption[] => {
  const { t } = useTranslation();

  return [
    { ...priorityConfig[0], label: t('addRequest.priorityOptions.urgent') },
    { ...priorityConfig[1], label: t('addRequest.priorityOptions.highest') },
    { ...priorityConfig[2], label: t('addRequest.priorityOptions.high') },
    { ...priorityConfig[3], label: t('addRequest.priorityOptions.medium') },
    { ...priorityConfig[4], label: t('addRequest.priorityOptions.low') },
    { ...priorityConfig[5], label: t('addRequest.priorityOptions.lowest') }
  ];
};

interface PrioritySelectProps
  extends Omit<
    SelectProps<PriorityOption, false>,
    'onChange' | 'value' | 'options'
  > {
  value?: string | null;
  onChange?: (_value: string) => void;
  isInvalid: boolean;
}

// Custom Option component with icon
const CustomOption = (props: OptionProps<PriorityOption, false>) => {
  const { data } = props;

  return (
    <components.Option {...props}>
      <Box display="flex" alignItems="center" gap={2}>
        <Icon as={data.icon} color={data.color} boxSize={4} />
        <span>{data.label}</span>
      </Box>
    </components.Option>
  );
};

// Custom SingleValue component with icon
const CustomSingleValue = (props: SingleValueProps<PriorityOption, false>) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <Box display="flex" alignItems="center" gap={2}>
        <Icon as={data.icon} color={data.color} boxSize={4} />
        <span>{data.label}</span>
      </Box>
    </components.SingleValue>
  );
};

const PrioritySelect: React.FC<PrioritySelectProps> = ({
  value,
  onChange,
  isInvalid,
  ...props
}) => {
  const options = usePriorityOptions();

  const styleConfig = reactSelectStyles() as StylesConfig<
    PriorityOption,
    false,
    GroupBase<PriorityOption>
  >;

  // Use Chakra color mode for selected value text
  const selectedTextColor = useColorModeValue('#012C4A', '#DDD');

  const mergedStyles: StylesConfig<
    PriorityOption,
    false,
    GroupBase<PriorityOption>
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
    }),
    singleValue: (provided) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      color: selectedTextColor
    }),
    option: (provided, state) => ({
      ...(typeof styleConfig.option === 'function'
        ? styleConfig.option(provided, state)
        : provided),
      display: 'flex',
      alignItems: 'center'
    })
  };

  // Find the selected option from the value string
  const selectedOption = value
    ? options.find((opt) => opt.value === value) || null
    : null;

  // Handle change by extracting just the value string
  const handleChange = (selected: PriorityOption | null) => {
    onChange?.(selected?.value || '');
  };

  return (
    <Select<PriorityOption, false>
      {...props}
      options={options}
      value={selectedOption}
      isMulti={false}
      styles={mergedStyles}
      onChange={handleChange}
      components={{
        Option: CustomOption,
        SingleValue: CustomSingleValue
      }}
    />
  );
};

export default PrioritySelect;
