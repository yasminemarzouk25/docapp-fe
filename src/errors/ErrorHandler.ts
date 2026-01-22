/* eslint-disable no-console */
// * We disable no-console rule for development to log error messages.
import { isAxiosError } from 'axios';
import type { Alert } from '../types/Alert';
import type { TFunction } from 'i18next';

interface ErrorResponseData {
  message: string;
}

const getErrorMessage = (
  status: number,
  data: ErrorResponseData,
  t: TFunction
): string => {
  switch (status) {
    case 400:
      return `${t('errors.validation')}: ${data.message}`;
    case 401:
      return `${t('errors.unauthorized')}: ${data.message}`;
    case 403:
      return `${t('errors.forbidden')}: ${data.message}`;
    case 404:
      return `${t('errors.dataNotFound')}: ${data.message}`;
    case 409:
      return `${t('errors.conflict')}: ${data.message}`;
    case 422:
      return `${data.message}`;
    default:
      return t('errors.somethingWentWrong');
  }
};

const handleError = (
  error: unknown,
  setAlert: (_alert: Alert) => void,
  t: TFunction
): void => {
  let message = t('errors.somethingWentWrong');

  if (isAxiosError(error)) {
    if (error.response) {
      message = getErrorMessage(
        error.response.status,
        error.response.data as ErrorResponseData,
        t
      );
    } else if (error.request) {
      message = t('errors.noResponseReceived');
    } else {
      console.error('Error', error.message);
    }
  } else {
    console.error('Non-Axios Error', error);
  }

  setAlert({
    message,
    status: 'error'
  });
};

export default handleError;
