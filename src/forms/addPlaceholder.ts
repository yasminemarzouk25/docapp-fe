import type { RegisterOptions } from 'react-hook-form';
import type { TFunction } from 'i18next';
import type { CreatableMultiSelectOption } from '../components/CreatableMultiSelect';
import { requiredRule, minLengthRule, maxLengthRule } from './common';

export interface AddPlaceholderFormData {
  placeholderName: string;
  selectedLabels: CreatableMultiSelectOption[];
}

export const addPlaceholderValidationRules = (t: TFunction) => ({
  placeholderName: {
    ...requiredRule('addPlaceholder.name', t),
    ...minLengthRule('addPlaceholder.name', 3, t),
    ...maxLengthRule('addPlaceholder.name', 100, t)
  } as RegisterOptions<AddPlaceholderFormData, 'placeholderName'>
});
