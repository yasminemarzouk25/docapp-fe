import React from 'react';
import { Tabs, TabList, Tab } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../types/User';

export enum TabKey {
  _Me = 0,
  _Assigned = 1,
  _ToReview = 2
}

interface TabsComponentProps {
  handleTabChange: (_index: number) => void;
  isLoading: boolean;
  activeTab: number;
}

const TabsComponent: React.FC<TabsComponentProps> = ({
  handleTabChange,
  isLoading,
  activeTab
}) => {
  const { t } = useTranslation();
  interface DecodedToken {
    id: string;
    fullname: string;
    roles: UserRole[];
  }

  const token = localStorage.getItem('access_token')!;
  const decoded: DecodedToken = jwtDecode(token);

  const isHR = decoded.roles?.includes(UserRole._HR);
  const isSigner = decoded.roles?.includes(UserRole._Signer);

  return (
    <Tabs
      index={activeTab}
      variant="enclosed"
      width="100%"
      onChange={handleTabChange}
    >
      <TabList>
        <Tab mr="4" isDisabled={isLoading}>
          {t('requestList.tabs.myRequests')}
        </Tab>
        <Tab mr="4" isDisabled={isLoading || !isHR}>
          {t('requestList.tabs.myAssignedRequests')}
        </Tab>
        <Tab isDisabled={isLoading || !isSigner}>
          {t('requestList.tabs.requestsToReview')}
        </Tab>
      </TabList>
    </Tabs>
  );
};

export default TabsComponent;
