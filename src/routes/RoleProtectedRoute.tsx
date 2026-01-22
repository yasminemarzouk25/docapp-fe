import React, { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';

import type { UserRole } from '../types/User';
import ErrorPage from '../pages/Error';
import Navbar from '../components/Navbar';

interface RoleProtectedRouteProps {
  children: ReactElement;
  allowedRoles: UserRole[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { t } = useTranslation();
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return children; // Let PrivateRoute handle the redirect
  }

  try {
    const decodedToken = jwtDecode<{ roles: UserRole[] }>(accessToken);
    const userRoles = decodedToken.roles || [];

    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <>
          <Navbar />
          <ErrorPage
            statusCode={403}
            errorTitle={t('errorPage.forbiddenTitle')}
            errorDescription={t('errorPage.forbiddenDescription')}
          />
        </>
      );
    }

    return children;
  } catch {
    return children; // Let PrivateRoute handle invalid tokens
  }
};

export default RoleProtectedRoute;
