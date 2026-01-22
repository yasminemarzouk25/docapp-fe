import {
  PublicClientApplication,
  type Configuration,
  type PopupRequest
} from '@azure/msal-browser';

const {
  VITE_CLIENT_ID,
  VITE_TENANT_ID,
  VITE_AUTHORITY,
  VITE_REDIRECT_URI,
  VITE_SCOPE
} = import.meta.env;

const msalConfig: Configuration = {
  auth: {
    clientId: String(VITE_CLIENT_ID),
    authority: String(VITE_AUTHORITY) + String(VITE_TENANT_ID),
    redirectUri: String(VITE_REDIRECT_URI),
    navigateToLoginRequestUrl: false,
    knownAuthorities: []
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge
  }
};

export const loginRequest: PopupRequest = {
  scopes: [String(VITE_SCOPE)]
};

const MsalInstance = new PublicClientApplication(msalConfig);

export default MsalInstance;
