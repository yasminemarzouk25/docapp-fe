import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { MsalProvider } from '@azure/msal-react';

import MsalInstance from './config/msal.ts';
import App from './App.tsx';

import './index.css';
import './config/i18n.ts';

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MsalProvider instance={MsalInstance}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </MsalProvider>
  </React.StrictMode>
);
