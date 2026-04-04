import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MockForm from './pages/MockForm';
import MockDetailPage from './pages/MockDetailPage';
import Logs from './pages/Logs';
import Login from './pages/Login';
import Register from './pages/Register';
import Teams from './pages/Teams';
import ImportWizard from './pages/ImportWizard';
import WsdlImportWizard from './pages/WsdlImportWizard';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LandingPage from './pages/LandingPage';
import PublicMockPage from './pages/PublicMockPage';
import DocsPage from './pages/DocsPage';
import VerifyPage from './pages/VerifyPage';

function AppRoutes() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/landing';
  const isPublicMock = location.pathname.startsWith('/public/mock/');
  const isDocsPage = location.pathname === '/docs';
  const isVerifyPage = location.pathname === '/verify';
  const isFullPage = isLandingPage || isPublicMock || isDocsPage || isVerifyPage;
  const isMinimalNav = ['/terms', '/pricing', '/privacy'].includes(location.pathname);

  return (
    <div className="app">
      {!isFullPage && <Navbar minimal={isMinimalNav} />}
      <div className={isFullPage ? '' : 'app-body'}>
        <main className={isFullPage ? '' : 'main-content'}>
          <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mocks/new" element={<MockForm />} />
            <Route path="/mocks/:id" element={<MockDetailPage />} />
            <Route path="/mocks/:id/edit" element={<MockForm />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/import" element={<ImportWizard />} />
            <Route path="/import/wsdl" element={<WsdlImportWizard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/public/mock/:publicId" element={<PublicMockPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/verify" element={<VerifyPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
