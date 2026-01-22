import React from 'react';
import type {
  GroupBase,
  MultiValue,
  StylesConfig,
  Props as SelectProps
} from 'react-select';
import Select from 'react-select/creatable';
import { reactSelectStyles } from '../config/react-select';

export type CreatableMultiSelectOption = {
  value: string;
  label: string;
  __isNew__?: boolean;
};

const CreatableMultiSelect: React.FC<
  Omit<SelectProps<CreatableMultiSelectOption, true>, 'onChange'> & {
    onChangeFn: (
      _selectedOptions: MultiValue<CreatableMultiSelectOption>
    ) => void;
  }
> = ({ onChangeFn, ...props }) => {
  const styleConfig = reactSelectStyles() as StylesConfig<
    CreatableMultiSelectOption,
    true,
    GroupBase<CreatableMultiSelectOption>
  >;

  return (
    <Select<CreatableMultiSelectOption, true>
      {...props}
      isMulti={true}
      styles={styleConfig}
      onChange={onChangeFn}
    />
  );
};

export default CreatableMultiSelect;
