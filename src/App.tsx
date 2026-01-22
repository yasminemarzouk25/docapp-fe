import { HashRouter, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import AppLayout from './components/AppLayout';
import ProtectedRoutes from './routes/ProtectedRoutes';

import LoginPage from './pages/Login';
import ErrorPage from './pages/Error';
import OCRComparePage from './pages/OCRComparePage';

const App = () => {
  const { t } = useTranslation();

  return (
    <HashRouter>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes with Navbar only (no sidebar) */}
        <Route
          path="/ocr/:id"
          element={
            <>
              <AppLayout>
                <OCRComparePage />
              </AppLayout>
            </>
          }
        />

        {/* Protected routes with full layout (navbar + sidebar) */}
        <Route
          path="/app/*"
          element={
            <AppLayout>
              <ProtectedRoutes />
            </AppLayout>
          }
        />

        {/* 404 Error */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <ErrorPage
                statusCode={404}
                errorTitle={t('errorPage.errorTitle')}
                errorDescription={t('errorPage.errorDescription')}
              />
            </>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
