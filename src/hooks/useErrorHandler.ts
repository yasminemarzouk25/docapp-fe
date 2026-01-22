import { useState, useCallback } from 'react';
import type { TFunction } from 'i18next';
import type { Alert } from '../types/Alert';
import handleError from '../errors/ErrorHandler';

const useErrorHandler = (t: TFunction) => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const handleErrorCallback = useCallback(
    (error: unknown) => {
      handleError(error, setAlert, t);
    },
    [setAlert]
  );

  return { alert, setAlert, handleError: handleErrorCallback };
};

export default useErrorHandler;
