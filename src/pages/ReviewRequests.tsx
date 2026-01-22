import React from 'react';
import { useTranslation } from 'react-i18next';
import RequestsList from '../components/RequestsList';
import { requestService } from '../services/requestService';

const ReviewRequests: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RequestsList
      title={t('requestList.tabs.requestsToReview', 'Requests to Review')}
      fetchRequests={requestService.toReview}
      enableValidateButton={true}
    />
  );
};

export default ReviewRequests;
