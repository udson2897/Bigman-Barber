import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ShopPage from './pages/ShopPage';
import AppointmentPage from './pages/AppointmentPage';
import ContactPage from './pages/ContactPage';
import ErrorPage from './pages/ErrorPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLoginPage from './pages/admin/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import UserAppointmentsPage from './pages/UserAppointmentsPage';
import UserOrdersPage from './pages/UserOrdersPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sobre', element: <AboutPage /> },
      { path: 'servicos', element: <ServicesPage /> },
      { path: 'loja', element: <ShopPage /> },
      { path: 'agendar', element: <AppointmentPage /> },
      { path: 'contato', element: <ContactPage /> },
      { path: 'admin/login', element: <AdminLoginPage /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'perfil', element: <UserProfilePage /> },
      { path: 'meus-agendamentos', element: <UserAppointmentsPage /> },
      { path: 'meus-pedidos', element: <UserOrdersPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);