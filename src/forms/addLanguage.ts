import type { RegisterOptions } from 'react-hook-form';
import type { TFunction } from 'i18next';
import {
  requiredRule,
  minLengthRule,
  maxLengthRule,
  patternRule
} from './common';

export interface LanguageFormData {
  code: string;
  name: string;
}

export const languageValidationRules = (t: TFunction) => ({
  code: {
    ...requiredRule('languageManagement.code', t),
    ...patternRule('languageManagement.code', /^[a-zA-Z]{2}$/, t),
    ...maxLengthRule('languageManagement.code', 2, t)
  } as RegisterOptions<LanguageFormData, 'code'>,
  name: {
    ...requiredRule('languageManagement.name', t),
    ...minLengthRule('languageManagement.name', 3, t),
    ...maxLengthRule('languageManagement.name', 50, t)
  } as RegisterOptions<LanguageFormData, 'name'>
});
