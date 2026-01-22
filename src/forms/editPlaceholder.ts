import type { RegisterOptions } from 'react-hook-form';
import type { TFunction } from 'i18next';
import type { CreatableMultiSelectOption } from '../components/CreatableMultiSelect';
import { requiredRule, minLengthRule, maxLengthRule } from './common';

export interface EditPlaceholderFormData {
  placeholderName: string;
  selectedLabels: CreatableMultiSelectOption[];
}

export const editPlaceholderValidationRules = (t: TFunction) => ({
  placeholderName: {
    ...requiredRule('editPlaceholder.name', t),
    ...minLengthRule('editPlaceholder.name', 3, t),
    ...maxLengthRule('editPlaceholder.name', 100, t)
  } as RegisterOptions<EditPlaceholderFormData, 'placeholderName'>
});
