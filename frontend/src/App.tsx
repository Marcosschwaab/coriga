import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from './components/Toast';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AuthProvider, useAuth } from './services/auth';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  CreditCard,
  PartyPopper,
  Settings,
  Menu,
  LogOut,
  Megaphone,
} from 'lucide-react';
import { DashboardPage } from './pages/Dashboard';
import { CalendarPage } from './pages/Calendar';
import { ResidentsPage } from './pages/Residents';
import { ReservationsPage } from './pages/Reservations';
import { PaymentsPage } from './pages/Payments';
import { PricingPage } from './pages/Pricing';
import { HolidaysPage } from './pages/Holidays';
import { AdminNoticesPage } from './pages/AdminNotices';
import { UserNoticesPage } from './pages/UserNotices';
import { LoginPage } from './pages/Login';

const adminNavItems = [
  { path: '/', label: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'nav.calendar', icon: CalendarDays },
  { path: '/residents', label: 'nav.residents', icon: Users },
  { path: '/reservations', label: 'nav.reservations', icon: FileText },
  { path: '/payments', label: 'nav.payments', icon: CreditCard },
  { path: '/holidays', label: 'nav.holidays', icon: PartyPopper },
  { path: '/notices', label: 'nav.notices', icon: Megaphone },
  { path: '/pricing', label: 'nav.pricing', icon: Settings },
];

const userNavItems = [
  { path: '/calendar', label: 'nav.calendar', icon: CalendarDays },
  { path: '/notices', label: 'nav.notices', icon: Megaphone },
];

function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-indigo-600">{t('app.brand')}</h1>
          <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
        </div>

        {user && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">{t('auth.welcome')}</p>
            <p className="font-medium text-gray-800 flex items-center justify-between">
              <span>{user.username}</span>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full capitalize">
                {user.role}
              </span>
            </p>
          </div>
        )}

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('auth.logout')}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/calendar" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/residents" element={<ProtectedRoute><ResidentsPage /></ProtectedRoute>} />
      <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
      <Route path="/holidays" element={<ProtectedRoute><HolidaysPage /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute>{user?.role === 'admin' ? <AdminNoticesPage /> : <UserNoticesPage />}</ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
