import React from 'react';
import Select, {
  type GroupBase,
  type MultiValue,
  type StylesConfig,
  type Props as SelectProps
} from 'react-select';

import { reactSelectStyles } from '../config/react-select';

export type MultiSelectOption = {
  value: string;
  label: string;
};

const MultiSelect: React.FC<
  Omit<SelectProps<MultiSelectOption, true>, 'onChange'> & {
    onChangeFn: (_selectedOptions: MultiValue<MultiSelectOption>) => void;
  }
> = ({ onChangeFn, ...props }) => {
  const styleConfig = reactSelectStyles() as StylesConfig<
    MultiSelectOption,
    true,
    GroupBase<MultiSelectOption>
  >;

  return (
    <Select<MultiSelectOption, true>
      {...props}
      isMulti={true}
      styles={styleConfig}
      onChange={onChangeFn}
    />
  );
};

export default MultiSelect;
