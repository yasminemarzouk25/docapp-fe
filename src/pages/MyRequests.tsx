import React from 'react';
import { useTranslation } from 'react-i18next';
import RequestsList from '../components/RequestsList';
import { requestService } from '../services/requestService';

const MyRequests: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RequestsList
      title={t('requestList.tabs.myRequests', 'My Requests')}
      fetchRequests={requestService.me}
      enableAddButton={true}
    />
  );
};

export default MyRequests;
