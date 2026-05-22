import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { formatCurrency } from '../services/currency';
import { DashboardStats } from '../types';
import { Loading } from '../components/Loading';
import { CalendarDays, CheckCircle, AlertCircle, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    api.dashboard.getStats(month).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text={t('dashboard.title')} />;
  if (!stats) return <div className="text-center py-12">{t('common.noData')}</div>;


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('dashboard.totalReservations')}</p>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-3">{stats.totalReservations}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('dashboard.confirmed')}</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-3 text-green-600">{stats.confirmedReservations}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('dashboard.pendingPayment')}</p>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-3 text-yellow-600">{stats.pendingPayments}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('dashboard.predictedRevenue')}</p>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-3 text-purple-600">{formatCurrency(stats.predictedRevenue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">{t('dashboard.revenueOverview')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-700 font-medium">{t('dashboard.received')}</span>
              <span className="text-xl font-bold text-green-700">{formatCurrency(stats.receivedRevenue)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700 font-medium">{t('dashboard.predicted')}</span>
              <span className="text-xl font-bold text-blue-700">{formatCurrency(stats.predictedRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">{t('dashboard.upcomingReservations')}</h2>
          </div>
          {stats.upcomingReservations.length === 0 ? (
            <p className="text-gray-500">{t('dashboard.noUpcoming')}</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingReservations.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <CalendarDays className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{res.resident?.name}</p>
                      <p className="text-sm text-gray-500">{new Date(res.date).toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US')}</p>
                    </div>
                  </div>
                  <span className={`badge ${res.payment?.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {res.payment?.status === 'paid' ? t('calendar.paid') : t('calendar.pending')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
