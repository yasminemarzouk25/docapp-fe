import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../config/axios';
import type { AuthTokens } from '../types/Auth';
import type { UserRole } from '../types/User';

const sso = async (ssoToken: string): Promise<AuthTokens> => {
  const headerParams = {
    'sso-token': ssoToken
  };

  const requestOptions = {
    headers: headerParams
  };

  const response = await axiosInstance.post<AuthTokens>(
    '/auth/sso',
    {},
    requestOptions
  );

  const { data } = response;

  return data;
};

const storeTokens = (tokens: AuthTokens) => {
  const access_token = tokens['access-token'];
  const refresh_token = tokens['refresh-token'];

  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
};

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

const getUserRole = (): UserRole[] => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    return [];
  }
  // Decode the JWT token to get user roles
  const decodedToken = jwtDecode<{ roles: UserRole[] }>(accessToken);
  const { roles } = decodedToken;

  return roles;
};

const authService = {
  sso,
  storeTokens,
  logout,
  getUserRole
};

export default authService;
