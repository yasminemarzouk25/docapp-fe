import React, { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface PrivateRouteProps {
  children: ReactElement;
}

const isValidRedirect = (redirect: string): boolean => {
  try {
    const url = new URL(redirect, window.location.origin);

    return url.origin === window.location.origin;
  } catch {
    return false;
  }
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const accessToken = localStorage.getItem('access_token');
  const location = useLocation();

  if (!accessToken) {
    const redirectTo = `${location.pathname}${location.search}`;
    const safeRedirect = isValidRedirect(redirectTo)
      ? encodeURIComponent(redirectTo)
      : encodeURIComponent('/');

    return <Navigate to={`/login?redirect=${safeRedirect}`} />;
  }

  try {
    jwtDecode(accessToken);
  } catch (_) {
    localStorage.removeItem('access_token');

    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
