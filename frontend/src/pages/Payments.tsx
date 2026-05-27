import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { formatCurrency } from '../services/currency';
import { Payment, Reservation } from '../types';
import { Modal } from '../components/Modal';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { CreditCard, AlertCircle, CheckCircle, DollarSign, Filter, Wallet, ReceiptText } from 'lucide-react';

export function PaymentsPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<(Payment & { reservation?: Reservation })[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { showToast } = useToast();

  const loadPayments = async (p: number, l: number) => {
    const result = await api.payments.list(filterStatus || undefined, p, l);
    setTotalPages(result.totalPages);
    const withReservations = await Promise.all(
      result.data.map(async (p) => {
        try {
          const res = await api.reservations.get(p.id);
          return { ...p, reservation: res as any };
        } catch {
          return p;
        }
      })
    );
    setPayments(withReservations as any);
  };

  useEffect(() => {
    setLoading(true);
    loadPayments(page, limit).finally(() => setLoading(false));
  }, [filterStatus, page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleRecordPayment = async (id: number, amount: number, method: string) => {
    try {
      await api.payments.recordPayment(id, amount, method);
      showToast(t('payments.recordedSuccess'));
      setShowModal(false);
      setSelectedPayment(null);
      loadPayments(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'partially_paid');
  const paidPayments = payments.filter((p) => p.status === 'paid');

  if (loading) return <Loading text={t('payments.title')} />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="w-7 h-7 text-indigo-600" />
        {t('payments.title')}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('payments.pending')}</p>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-3 text-yellow-600">{pendingPayments.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('payments.paid')}</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-3 text-green-600">{paidPayments.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('payments.totalPending')}</p>
            <div className="p-2 bg-red-50 rounded-lg">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-3 text-red-600">
            {formatCurrency(pendingPayments.reduce((sum, p) => sum + Number(p.remainingAmount), 0))}
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input max-w-xs border-none shadow-none focus:ring-0">
            <option value="">{t('common.allStatus')}</option>
            <option value="pending">{t('payments.pending')}</option>
            <option value="paid">{t('payments.paid')}</option>
            <option value="partially_paid">{t('payments.partiallyPaid')}</option>
            <option value="cancelled">{t('payments.cancelled')}</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('payments.reservationId')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('payments.total')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('payments.paidAmount')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('payments.remaining')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('payments.method')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.status')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <ReceiptText className="w-4 h-4 text-gray-400" />
                    #{p.id}
                  </div>
                </td>
                <td className="py-3 px-4">{formatCurrency(p.totalAmount)}</td>
                <td className="py-3 px-4 text-green-600">{formatCurrency(p.paidAmount)}</td>
                <td className="py-3 px-4 text-red-600">{formatCurrency(p.remainingAmount)}</td>
                <td className="py-3 px-4 capitalize">{p.paymentMethod || '-'}</td>
                <td className="py-3 px-4">
                  <span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : p.status === 'partially_paid' ? 'badge-info' : 'badge-danger'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {(p.status === 'pending' || p.status === 'partially_paid') && (
                    <button
                      onClick={() => { setSelectedPayment(p); setShowModal(true); }}
                      className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                    >
                      {t('payments.recordPayment')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('payments.noPayments')}</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} limit={limit} onPageChange={setPage} onLimitChange={handleLimitChange} />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedPayment(null); }} title={t('payments.recordPayment')}>
        {selectedPayment && (
          <RecordPaymentForm
            payment={selectedPayment}
            onSubmit={handleRecordPayment}
            onCancel={() => { setShowModal(false); setSelectedPayment(null); }}
          />
        )}
      </Modal>
    </div>
  );
}

function RecordPaymentForm({ payment, onSubmit, onCancel }: {
  payment: Payment;
  onSubmit: (id: number, amount: number, method: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(Number(payment.remainingAmount).toString());
  const [method, setMethod] = useState('pix');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(payment.id, Number(amount), method);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-red-50 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-red-600 font-medium">{t('payments.remainingBalance')}</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(payment.remainingAmount)}</p>
        </div>
        <DollarSign className="w-8 h-8 text-red-300" />
      </div>
      <div>
        <label className="label">{t('payments.paymentAmount')}</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div>
        <label className="label">{t('payments.paymentMethod')}</label>
        <div className="relative">
          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="input pl-10">
            <option value="pix">{t('payments.pix')}</option>
            <option value="cash">{t('payments.cash')}</option>
            <option value="card">{t('payments.card')}</option>
            <option value="transfer">{t('payments.transfer')}</option>
            <option value="other">{t('payments.other')}</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{t('payments.recordPayment')}</button>
      </div>
    </form>
  );
}
