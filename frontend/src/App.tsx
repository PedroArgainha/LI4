import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import ClientLayout from './layouts/ClientLayout';
import BackofficeLayout from './layouts/BackofficeLayout';

// Auth
import { ProtectedRoute } from './auth/ProtectedRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import ServicosPage from './pages/public/ServicosPage';
import ContactoPage from './pages/public/ContactoPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegistarPage from './pages/auth/RegistarPage';

// Client portal
import PortalDashboard from './pages/client/PortalDashboard';
import AnimaisPage from './pages/client/AnimaisPage';
import ReservasPage from './pages/client/ReservasPage';
import PerfilPage from './pages/client/PerfilPage';

// Backoffice
import BackofficeDashboard from './pages/backoffice/BackofficeDashboard';
import ReservasBackoffice from './pages/backoffice/ReservasBackoffice';
import AnimaisBackoffice from './pages/backoffice/AnimaisBackoffice';
import PagamentosPage from './pages/backoffice/PagamentosPage';
import ServicosDiaPage from './pages/backoffice/ServicosDiaPage';
import UtilizadoresPage from './pages/backoffice/UtilizadoresPage';
import EspacosPage from './pages/backoffice/EspacosPage';
import ServicosPageBO from './pages/backoffice/ServicosPage';
import RelatoriosPage from './pages/backoffice/RelatoriosPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ──────────── Área PÚBLICA ──────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
          </Route>

          {/* ──────────── Autenticação ──────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registar" element={<RegistarPage />} />

          {/* ──────────── Portal do PROPRIETÁRIO ──────────── */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PortalDashboard />} />
            <Route path="animais" element={<AnimaisPage />} />
            <Route path="reservas" element={<ReservasPage />} />
            <Route path="perfil" element={<PerfilPage />} />
          </Route>

          {/* ──────────── BACKOFFICE ──────────── */}
          <Route
            path="/backoffice"
            element={
              <ProtectedRoute requireBackoffice>
                <BackofficeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BackofficeDashboard />} />
            <Route path="reservas" element={<ReservasBackoffice />} />
            <Route path="animais" element={<AnimaisBackoffice />} />
            <Route path="pagamentos" element={<PagamentosPage />} />
            <Route path="servicos-dia" element={<ServicosDiaPage />} />
            <Route
              path="utilizadores"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DIRECAO']}>
                  <UtilizadoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="espacos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DIRECAO']}>
                  <EspacosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="servicos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DIRECAO']}>
                  <ServicosPageBO />
                </ProtectedRoute>
              }
            />
            <Route
              path="relatorios"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DIRECAO']}>
                  <RelatoriosPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
