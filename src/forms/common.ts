import type { RegisterOptions } from 'react-hook-form';
import type { TFunction } from 'i18next';

export const emailRule = (t: TFunction): RegisterOptions => ({
  required: t('forms.email.required'),
  pattern: {
    value: /^\S+@\S+$/i,
    message: t('forms.email.invalid')
  }
});

export const requiredRule = (field: string, t: TFunction): RegisterOptions => ({
  required: t(`forms.${field}.required`, { field })
});

export const minLengthRule = (
  field: string,
  length: number,
  t: TFunction
): RegisterOptions => ({
  minLength: {
    value: length,
    message: t(`forms.${field}.minLength`, { field, length })
  }
});

export const maxLengthRule = (
  field: string,
  length: number,
  t: TFunction
): RegisterOptions => ({
  maxLength: {
    value: length,
    message: t(`forms.${field}.maxLength`, { field, length })
  }
});

export const patternRule = (
  field: string,
  pattern: RegExp,
  t: TFunction
): RegisterOptions => ({
  pattern: {
    value: pattern,
    message: t(`forms.${field}.pattern`, { field })
  }
});
