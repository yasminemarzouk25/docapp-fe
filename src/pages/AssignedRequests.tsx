import React from 'react';
import { useTranslation } from 'react-i18next';
import RequestsList from '../components/RequestsList';
import { requestService } from '../services/requestService';

const AssignedRequests: React.FC = () => {
  const { t } = useTranslation();

  return (
    <RequestsList
      title={t('requestList.tabs.myAssignedRequests', 'Assigned Requests')}
      fetchRequests={requestService.assigned}
      enableEditButton={true}
      enableGeneratePdfButton={true}
      enableAssignButton={true}
      enableDownloadButton={true}
      enableUploadButton={true}
      enableUploadDechargeButton={true}
    />
  );
};

export default AssignedRequests;
