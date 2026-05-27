import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { formatCurrency } from '../services/currency';
import { Reservation, Resident, Guest } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../services/auth';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { FileText, Plus, Download, Pencil, XCircle, Filter, Calendar, User, Tag, DollarSign, Eye, EyeOff, Info, CheckCircle, Clock, LoaderCircle, Trash2, Users, CheckSquare } from 'lucide-react';

export function ReservationsPage() {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const isConcierge = user?.role === 'concierge';

  const fetchData = (p: number, l: number) => {
    return Promise.all([
      api.reservations.list(undefined, filterStatus || undefined, p, l),
      api.residents.list(),
    ]).then(([res, resi]) => {
      setReservations(res.data);
      setTotalPages(res.totalPages);
      setResidents(resi.data);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData(page, limit).finally(() => setLoading(false));
  }, [filterStatus, page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

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
      fetchData(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm(t('reservations.confirmCancel'))) return;
    try {
      await api.reservations.cancel(id);
      showToast(t('reservations.cancelledSuccess'));
      setExpandedId(null);
      fetchData(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
          {!isConcierge && (
            <>
              <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('reservations.exportCSV')}
              </button>
              <button onClick={() => { setEditingReservation(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('reservations.newReservation')}
              </button>
            </>
          )}
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
              {!isConcierge && <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.price')}</th>}
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.status')}</th>
              {!isConcierge && <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('nav.payments')}</th>}
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <React.Fragment key={res.id}>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button onClick={() => toggleExpand(res.id)} className="flex items-center gap-1.5 text-left text-inherit cursor-pointer">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{new Date(res.date + 'T00:00:00').toLocaleDateString()}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleExpand(res.id)} className="flex items-center gap-1.5 text-left text-inherit cursor-pointer">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-medium">{res.resident?.name}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{res.dayType}</span>
                    </div>
                  </td>
                  {!isConcierge && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {formatCurrency(res.price)}
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <span className={`badge ${res.status === 'reserved' ? 'badge-info' : res.status === 'cancelled' ? 'badge-danger' : 'badge-success'}`}>
                      {res.status}
                    </span>
                  </td>
                  {!isConcierge && (
                    <td className="py-3 px-4">
                      {res.payment ? (
                        <span className={`badge ${res.payment.status === 'paid' ? 'badge-success' : res.payment.status === 'pending' ? 'badge-warning' : res.payment.status === 'partially_paid' ? 'badge-info' : 'badge-danger'}`}>
                          {res.payment.status}
                        </span>
                      ) : (
                        <span className="badge badge-gray">{t('reservations.na')}</span>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => toggleExpand(res.id)} className="px-2 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1">
                        {expandedId === res.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{t('common.view')}</span>
                      </button>
                      {!isConcierge && (
                        <button onClick={() => { setEditingReservation(res); setShowModal(true); }} className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title={t('common.edit')}>
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {!isConcierge && res.status !== 'cancelled' && (
                        <button onClick={() => handleCancel(res.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600" title={t('common.cancel')}>
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === res.id && (
                  <tr>
                    <td colSpan={isConcierge ? 5 : 7} className="p-0">
                      <InlineReservationDetail
                        reservation={res}
                        isConcierge={isConcierge}
                        onEdit={() => { setEditingReservation(res); setShowModal(true); }}
                        onCancel={() => handleCancel(res.id)}
                        onRefresh={() => {
                          api.reservations.list(undefined, filterStatus || undefined, page).then((resData) => {
                            setReservations(resData.data);
                            setTotalPages(resData.totalPages);
                          });
                        }}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {reservations.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('reservations.noReservations')}</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} limit={limit} onPageChange={setPage} onLimitChange={handleLimitChange} />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingReservation(null); }} title={editingReservation ? t('reservations.editReservation') : t('reservations.newReservation')}>
        <ReservationForm reservation={editingReservation} residents={residents} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingReservation(null); }} />
      </Modal>
    </div>
  );
}

function InlineReservationDetail({ reservation, isConcierge, onEdit, onCancel, onRefresh }: {
  reservation: Reservation;
  isConcierge?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestsLoading, setGuestsLoading] = useState(true);

  useEffect(() => {
    setGuestsLoading(true);
    api.guests.list(reservation.id).then(setGuests).finally(() => setGuestsLoading(false));
  }, [reservation.id]);

  const addGuest = async () => {
    if (!guestName.trim()) return;
    try {
      const guest = await api.guests.create({ reservationId: reservation.id, name: guestName.trim() });
      setGuests([...guests, guest]);
      setGuestName('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const removeGuest = async (id: number) => {
    try {
      await api.guests.remove(id);
      setGuests(guests.filter((g) => g.id !== id));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const togglePresence = async (guest: Guest) => {
    try {
      const updated = await api.guests.update(guest.id, { isPresent: !guest.isPresent });
      setGuests(guests.map((g) => (g.id === guest.id ? updated : g)));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const isEventDay = reservation.date === today;

  return (
    <div className="bg-gray-50 p-6 border-t border-gray-200 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('residents.title')}
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">{t('residents.fullName')}</p>
              <p className="font-medium">{reservation.resident?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">{t('residents.phone')}</p>
              <p className="font-medium">{reservation.resident?.phone}</p>
            </div>
            <div>
              <p className="text-gray-500">{t('residents.email')}</p>
              <p className="font-medium">{reservation.resident?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">{t('residents.address')}</p>
              <p className="font-medium">{reservation.resident?.address}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t('reservations.reservationInfo')}
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">{t('common.date')}</p>
              <p className="font-medium">{new Date(reservation.date + 'T00:00:00').toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">{t('common.type')}</p>
              <p className="font-medium capitalize">{reservation.dayType}</p>
            </div>
            <div>
              <p className="text-gray-500">{t('common.status')}</p>
              <span className={`badge ${reservation.status === 'reserved' ? 'badge-info' : reservation.status === 'cancelled' ? 'badge-danger' : 'badge-success'}`}>
                {reservation.status}
              </span>
            </div>
            {!isConcierge && (
              <div>
                <p className="text-gray-500">{t('common.price')}</p>
                <p className="font-medium">{formatCurrency(reservation.price)}</p>
              </div>
            )}
            {reservation.notes && (
              <div>
                <p className="text-gray-500">{t('common.notes')}</p>
                <p>{reservation.notes}</p>
              </div>
            )}
          </div>
        </div>

        {!isConcierge && reservation.payment && (
          <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('nav.payments')}
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">{t('payments.total')}</p>
                <p className="font-medium">{formatCurrency(reservation.payment.totalAmount)}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('payments.paidAmount')}</p>
                <p className="font-medium">{formatCurrency(reservation.payment.paidAmount)}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('payments.remaining')}</p>
                <p className="font-medium">{formatCurrency(reservation.payment.remainingAmount)}</p>
              </div>
              <div>
                <p className="text-gray-500">{t('common.status')}</p>
                <span className={`badge ${reservation.payment.status === 'paid' ? 'badge-success' : reservation.payment.status === 'pending' ? 'badge-warning' : reservation.payment.status === 'partially_paid' ? 'badge-info' : 'badge-danger'}`}>
                  {reservation.payment.status === 'paid' ? t('payments.paid') : reservation.payment.status === 'pending' ? t('payments.pending') : reservation.payment.status === 'partially_paid' ? t('payments.partiallyPaid') : t('payments.cancelled')}
                </span>
              </div>
              {reservation.payment.paymentMethod && (
                <div>
                  <p className="text-gray-500">{t('payments.method')}</p>
                  <p className="capitalize">{reservation.payment.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Users className="w-4 h-4" />
          {t('guests.title')}
          {!guestsLoading && (
            <span className="badge badge-info text-xs ml-auto">{guests.length}</span>
          )}
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGuest()}
            placeholder={t('guests.addPlaceholder')}
            className="input flex-1"
          />
          <button onClick={addGuest} className="btn-primary" disabled={!guestName.trim()}>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {guestsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : guests.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t('guests.noGuests')}</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {guests.map((guest) => (
              <div key={guest.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePresence(guest)}
                    disabled={!isEventDay}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      guest.isPresent
                        ? 'bg-green-500 border-green-500 text-white'
                        : isEventDay
                          ? 'border-gray-300 hover:border-green-400'
                          : 'border-gray-200 cursor-not-allowed'
                    }`}
                    title={isEventDay ? t('guests.togglePresence') : t('guests.presenceOnlyEventDay')}
                  >
                    {guest.isPresent && <CheckSquare className="w-3.5 h-3.5" />}
                  </button>
                  <span className={`text-sm ${guest.isPresent ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                    {guest.name}
                  </span>
                  {guest.isPresent && (
                    <span className="badge badge-success text-xs">{t('guests.present')}</span>
                  )}
                </div>
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="p-1 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isConcierge && (
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onEdit} className="btn-primary flex items-center justify-center gap-2">
            <Pencil className="w-4 h-4" />
            {t('common.edit')}
          </button>
          {reservation.status !== 'cancelled' && (
            <button type="button" onClick={onCancel} className="btn-danger flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              {t('common.cancel')}
            </button>
          )}
        </div>
      )}
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
