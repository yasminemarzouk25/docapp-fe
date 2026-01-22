import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import { UserRole } from '../types/User';

import HomePage from '../pages/Home';
import UsersPage from '../pages/Users';
import SignersPage from '../pages/Signers';
import RequestsPage from '../pages/Requests';
import MyRequests from '../pages/MyRequests';
import AssignedRequests from '../pages/AssignedRequests';
import ReviewRequests from '../pages/ReviewRequests';
import AdministrativeDocumentsPage from '../pages/AdministrativeDocuments';
import LanguageManagement from '../pages/LanguageManagement';
import DocumentsPage from '../pages/Documents';
import AddTemplatePage from '../pages/AddTemplate';
import PlaceholderPage from '../pages/Placeholders';
import ConfigureTemplatePage from '../pages/ConfigureTemplate';
import ConfigureQrCode from '../pages/ConfigureQrCode';
import AddUserPage from '../pages/AddUser';
import GenerateDocumentPage from '../pages/GenerateDocument';

const wrapWithPrivateRoute = (Component: React.ComponentType) => (
  <PrivateRoute>
    <Component />
  </PrivateRoute>
);

const wrapWithRoleProtection = (
  Component: React.ComponentType,
  allowedRoles: UserRole[]
) => (
  <PrivateRoute>
    <RoleProtectedRoute allowedRoles={allowedRoles}>
      <Component />
    </RoleProtectedRoute>
  </PrivateRoute>
);

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={wrapWithPrivateRoute(HomePage)} />

      <Route
        path="/users"
        element={wrapWithRoleProtection(UsersPage, [UserRole._HR])}
      />
      <Route
        path="/signers"
        element={wrapWithRoleProtection(SignersPage, [UserRole._HR])}
      />
      <Route
        path="/placeholders"
        element={wrapWithRoleProtection(PlaceholderPage, [UserRole._HR])}
      />
      <Route
        path="/languages"
        element={wrapWithRoleProtection(LanguageManagement, [UserRole._HR])}
      />
      <Route path="/requests" element={wrapWithPrivateRoute(RequestsPage)} />
      <Route path="/requests/my" element={wrapWithPrivateRoute(MyRequests)} />
      <Route
        path="/requests/assigned"
        element={wrapWithRoleProtection(AssignedRequests, [UserRole._HR])}
      />
      <Route
        path="/requests/review"
        element={wrapWithRoleProtection(ReviewRequests, [UserRole._Signer])}
      />
      <Route
        path="/administrative-documents"
        element={wrapWithRoleProtection(AdministrativeDocumentsPage, [
          UserRole._HR
        ])}
      />
      <Route
        path="/documents"
        element={wrapWithRoleProtection(DocumentsPage, [UserRole._HR])}
      />
      <Route
        path="/add-template"
        element={wrapWithRoleProtection(AddTemplatePage, [UserRole._HR])}
      />
      <Route
        path="/configure-template/:templateId"
        element={wrapWithRoleProtection(ConfigureTemplatePage, [UserRole._HR])}
      />
      <Route
        path="/configure-qr-code/:templateId"
        element={wrapWithRoleProtection(ConfigureQrCode, [UserRole._HR])}
      />
      <Route
        path="/add-user"
        element={wrapWithRoleProtection(AddUserPage, [UserRole._HR])}
      />
      <Route
        path="/generate-document/:requestId/:templateId"
        element={wrapWithRoleProtection(GenerateDocumentPage, [UserRole._HR])}
      />
    </Routes>
  );
};

export default ProtectedRoutes;
