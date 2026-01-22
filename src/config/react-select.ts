import type { StylesConfig } from 'react-select';
import { useColorModeValue } from '@chakra-ui/react';

export const reactSelectStyles = (): StylesConfig => {
  const placeholderColor = useColorModeValue('#718096', '#A0AEC0');
  const singleValueColor = useColorModeValue('#2D3748', '#e3e2e0');
  const controlBgColor = useColorModeValue('white', '#2D3748');
  const controlBorderColor = useColorModeValue('#CBD5E0', '#4A5568');
  const controlHoverBorderColor = useColorModeValue('#A0AEC0', '#4A5568');
  const menuBgColor = useColorModeValue('white', '#2D3748');
  const optionSelectedBgColor = useColorModeValue('#E2E8F0', '#4A5568');
  const optionBgColor = useColorModeValue('white', '#2D3748');
  const optionColor = useColorModeValue('black', 'white');
  const optionHoverBgColor = useColorModeValue('#F7FAFC', '#4A5568');
  const multiValueBgColor = useColorModeValue('#E2E8F0', '#4A5568');
  const multiValueColor = useColorModeValue('#2D3748', 'white');
  const multiValueRemoveHoverBgColor = useColorModeValue('#f29696', '#f29696');
  const multiValueRemoveColor = useColorModeValue('black', 'white');
  const iconColor = useColorModeValue('#757373', '#dbd5d5');
  const inputColor = useColorModeValue('#2D3748', '#e3e2e0');

  return {
    container: (provided) => ({ ...provided, width: '100%' }),
    placeholder: (provided) => ({
      ...provided,
      color: placeholderColor
    }),
    singleValue: (provided) => ({
      ...provided,
      color: singleValueColor
    }),
    input: (provided) => ({
      ...provided,
      color: inputColor
    }),
    control: (provided) => ({
      ...provided,
      backgroundColor: controlBgColor,
      borderColor: controlBorderColor,
      boxShadow: 'none',
      '&:hover': {
        borderColor: controlHoverBorderColor
      }
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: iconColor,
      '&:hover': {
        color: iconColor
      }
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: iconColor,
      '&:hover': {
        color: iconColor
      }
    }),

    menu: (provided) => ({
      ...provided,
      backgroundColor: menuBgColor
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: menuBgColor
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? optionSelectedBgColor
        : state.isFocused
          ? optionHoverBgColor
          : optionBgColor,
      color: optionColor,
      '&:hover': {
        backgroundColor: optionHoverBgColor
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: multiValueBgColor,
      color: multiValueColor
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: multiValueColor
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: multiValueRemoveColor,
      '&:hover': {
        backgroundColor: multiValueRemoveHoverBgColor,
        color: 'white'
      }
    })
  };
};
