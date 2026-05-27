import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { formatCurrency } from '../services/currency';
import { Reservation, Resident } from '../types';
import { Modal } from '../components/Modal';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { FileText, Plus, Download, Pencil, XCircle, Filter, Calendar, User, Tag, DollarSign } from 'lucide-react';

export function ReservationsPage() {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.reservations.list(undefined, filterStatus || undefined, page),
      api.residents.list(),
    ]).then(([res, resi]) => {
      setReservations(res.data);
      setTotalPages(res.totalPages);
      setResidents(resi.data);
    }).finally(() => setLoading(false));
  }, [filterStatus, page]);

  const handleSave = async (data: Partial<Reservation>) => {
    try {
      if (editingReservation) {
        await api.reservations.update(editingReservation.id, data);
        showToast(t('reservations.updatedSuccess'));
      } else {
        await api.reservations.create(data);
        showToast(t('reservations.createdSuccess'));
      }
      setShowModal(false);
      setEditingReservation(null);
      api.reservations.list(undefined, filterStatus || undefined, page).then((res) => {
        setReservations(res.data);
        setTotalPages(res.totalPages);
      });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm(t('reservations.confirmCancel'))) return;
    try {
      await api.reservations.cancel(id);
      showToast(t('reservations.cancelledSuccess'));
      api.reservations.list(undefined, filterStatus || undefined, page).then((res) => {
        setReservations(res.data);
        setTotalPages(res.totalPages);
      });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const exportCSV = () => {
    const headers = t('reservations.csvHeaders', { returnObjects: true }) as string[];
    const rows = reservations.map((r) => [
      r.id,
      r.resident?.name,
      r.date,
      r.status,
      r.dayType,
      Number(r.price).toFixed(2),
      r.payment?.status || t('reservations.na'),
      r.notes || '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loading text={t('reservations.title')} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7 text-indigo-600" />
          {t('reservations.title')}
        </h1>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('reservations.exportCSV')}
          </button>
          <button onClick={() => { setEditingReservation(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('reservations.newReservation')}
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input max-w-xs border-none shadow-none focus:ring-0">
            <option value="">{t('common.allStatus')}</option>
            <option value="reserved">{t('calendar.reserved')}</option>
            <option value="cancelled">{t('calendar.cancelled')}</option>
            <option value="completed">{t('calendar.completed')}</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.date')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('calendar.resident')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.type')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.price')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.status')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('nav.payments')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(res.date + 'T00:00:00').toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    {res.resident?.name}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{res.dayType}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {formatCurrency(res.price)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${res.status === 'reserved' ? 'badge-info' : res.status === 'cancelled' ? 'badge-danger' : 'badge-success'}`}>
                    {res.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {res.payment ? (
                    <span className={`badge ${res.payment.status === 'paid' ? 'badge-success' : res.payment.status === 'pending' ? 'badge-warning' : res.payment.status === 'partially_paid' ? 'badge-info' : 'badge-danger'}`}>
                      {res.payment.status}
                    </span>
                  ) : (
                    <span className="badge badge-gray">{t('reservations.na')}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingReservation(res); setShowModal(true); }} className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title={t('common.edit')}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    {res.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(res.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600" title={t('common.cancel')}>
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservations.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('reservations.noReservations')}</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingReservation(null); }} title={editingReservation ? t('reservations.editReservation') : t('reservations.newReservation')}>
        <ReservationForm reservation={editingReservation} residents={residents} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingReservation(null); }} />
      </Modal>
    </div>
  );
}

function ReservationForm({ reservation, residents, onSave, onCancel }: {
  reservation: Reservation | null;
  residents: Resident[];
  onSave: (data: Partial<Reservation>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [residentId, setResidentId] = useState(reservation?.residentId?.toString() || '');
  const [date, setDate] = useState(reservation?.date || '');
  const [notes, setNotes] = useState(reservation?.notes || '');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const activeResidents = residents.filter((r) => r.isActive);
  const filtered = activeResidents.filter((r) =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.address.toLowerCase().includes(search.toLowerCase())
  );

  const selected = activeResidents.find((r) => r.id === Number(residentId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (residentId) onSave({ residentId: Number(residentId), date, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label className="label">{t('calendar.selectResident')}</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={open ? search : (selected ? `${selected.name} - ${selected.address}` : '')}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => { setOpen(true); setSearch(''); }}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder={t('reservations.selectResident')}
            className="input pl-10"
            required
            autoComplete="off"
          />
        </div>
        {open && (
          <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-gray-400">{t('common.noResults')}</p>
            ) : filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${Number(residentId) === r.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`}
                onMouseDown={() => { setResidentId(String(r.id)); setSearch(''); setOpen(false); }}
              >
                <span className="font-medium">{r.name}</span>
                <span className="text-gray-400 ml-2">{r.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="label">{t('common.date')}</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div>
        <label className="label">{t('common.notes')}</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" rows={3} />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{reservation ? t('common.update') : t('common.create')}</button>
      </div>
    </form>
  );
}
