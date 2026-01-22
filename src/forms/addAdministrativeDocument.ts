import type { RegisterOptions } from 'react-hook-form';
import type { TFunction } from 'i18next';
import { requiredRule, minLengthRule, maxLengthRule } from './common';
import {
  Department,
  type AddAdministrativeDocumentFormData
} from '../types/Request';

export const addAdministrativeDocumentValidationRules = (t: TFunction) => ({
  summary: {
    ...requiredRule('addAdministrativeDocument.summary', t),
    ...minLengthRule('addAdministrativeDocument.summary', 5, t),
    ...maxLengthRule('addAdministrativeDocument.summary', 255, t)
  } as RegisterOptions<AddAdministrativeDocumentFormData, 'summary'>,

  createdFor: {
    ...requiredRule('addAdministrativeDocument.createdFor', t)
  } as RegisterOptions<AddAdministrativeDocumentFormData, 'createdFor'>,

  department: {
    ...requiredRule('addAdministrativeDocument.department', t),
    validate(value: Department) {
      if (!Object.values(Department).includes(value)) {
        return t('forms.addAdministrativeDocument.department.invalid');
      }

      return true;
    }
  } as RegisterOptions<AddAdministrativeDocumentFormData, 'department'>,

  priority: {
    required: t('forms.addAdministrativeDocument.priority.required'),
    validate(value: number | null) {
      if (value === null || value === undefined || isNaN(value)) {
        return t('forms.addAdministrativeDocument.priority.required');
      }
      if (value < 1) {
        return t('forms.addAdministrativeDocument.priority.min');
      }
      if (value > 6) {
        return t('forms.addAdministrativeDocument.priority.max');
      }

      return true;
    }
  } as RegisterOptions<AddAdministrativeDocumentFormData, 'priority'>,

  templateId: {
    ...requiredRule('addAdministrativeDocument.templateId', t)
  } as RegisterOptions<AddAdministrativeDocumentFormData, 'templateId'>
});
