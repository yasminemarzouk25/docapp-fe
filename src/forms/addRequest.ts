import type { RegisterOptions } from 'react-hook-form';
import type { TFunction } from 'i18next';
import { requiredRule, minLengthRule, maxLengthRule } from './common';
import {
  Department,
  SignatureType,
  type AddRequestFormData
} from '../types/Request';

export const addRequestValidationRules = (t: TFunction) => ({
  summary: {
    ...requiredRule('addRequest.summary', t),
    ...minLengthRule('addRequest.summary', 5, t),
    ...maxLengthRule('addRequest.summary', 255, t)
  } as RegisterOptions<AddRequestFormData, 'summary'>,

  description: {
    ...requiredRule('addRequest.description', t),
    ...minLengthRule('addRequest.description', 10, t),
    ...maxLengthRule('addRequest.description', 1000, t)
  } as RegisterOptions<AddRequestFormData, 'description'>,

  hrHandler: {
    ...requiredRule('addRequest.hrHandler', t)
  } as RegisterOptions<AddRequestFormData, 'hrHandler'>,

  department: {
    ...requiredRule('addRequest.department', t),
    validate(value: Department) {
      if (!Object.values(Department).includes(value)) {
        return t('forms.addRequest.department.invalid');
      }

      return true;
    }
  } as RegisterOptions<AddRequestFormData, 'department'>,

  priority: {
    required: t('forms.addRequest.priority.required'),
    validate(value: number | null) {
      if (value === null || value === undefined || isNaN(value)) {
        return t('forms.addRequest.priority.required');
      }
      if (value < 1) {
        return t('forms.addRequest.priority.min');
      }
      if (value > 6) {
        return t('forms.addRequest.priority.max');
      }

      return true;
    }
  } as RegisterOptions<AddRequestFormData, 'priority'>,

  templateId: {
    ...requiredRule('addRequest.templateId', t)
  } as RegisterOptions<AddRequestFormData, 'templateId'>,

  signatureType: {
    required: t('forms.addRequest.signatureType.required'),
    validate(value: SignatureType) {
      if (value === SignatureType._NONE) {
        return t('forms.addRequest.signatureType.required');
      }

      return true;
    }
  } as RegisterOptions<AddRequestFormData, 'signatureType'>
});
