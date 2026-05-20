import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from './components/Toast';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  CreditCard,
  PartyPopper,
  Settings,
  Menu,
} from 'lucide-react';
import { DashboardPage } from './pages/Dashboard';
import { CalendarPage } from './pages/Calendar';
import { ResidentsPage } from './pages/Residents';
import { ReservationsPage } from './pages/Reservations';
import { PaymentsPage } from './pages/Payments';
import { PricingPage } from './pages/Pricing';
import { HolidaysPage } from './pages/Holidays';

function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/calendar', label: t('nav.calendar'), icon: CalendarDays },
    { path: '/residents', label: t('nav.residents'), icon: Users },
    { path: '/reservations', label: t('nav.reservations'), icon: FileText },
    { path: '/payments', label: t('nav.payments'), icon: CreditCard },
    { path: '/holidays', label: t('nav.holidays'), icon: PartyPopper },
    { path: '/pricing', label: t('nav.pricing'), icon: Settings },
  ];

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
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
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
        <div className="flex justify-end mb-4 lg:hidden">
          <LanguageSwitcher />
        </div>
        {children}
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <div className="hidden lg:flex justify-end fixed top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/residents" element={<ResidentsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/holidays" element={<HolidaysPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
