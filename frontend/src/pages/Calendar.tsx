import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Reservation, Holiday, Resident } from '../types';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  PartyPopper,
  DollarSign,
  AlertCircle,
  LoaderCircle,
  CalendarDays,
  Users,
} from 'lucide-react';

export function CalendarPage() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const { showToast } = useToast();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dayNames = t('calendar.dayNames', { returnObjects: true }) as string[];
  const monthNames = t('calendar.monthNames', { returnObjects: true }) as string[];

  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    api.reservations.list(monthStr, filterStatus || undefined).then(setReservations);
    api.holidays.list(year).then(setHolidays);
    api.residents.list().then(setResidents);
  }, [year, month, filterStatus]);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const days: { date: string; day: number; currentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    days.push({ date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, day, currentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, day: i, currentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    days.push({ date: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, day: i, currentMonth: false });
  }

  const getReservationForDate = (date: string) => reservations.find((r) => r.date === date);
  const getHolidayForDate = (date: string) => holidays.find((h) => h.date === date);

  const handleDayClick = (date: string) => {
    setSelectedDay(date);
    setShowModal(true);
  };

  const handleCreateReservation = async (residentId: number, notes: string) => {
    try {
      await api.reservations.create({ residentId, date: selectedDay!, notes });
      showToast(t('calendar.createdSuccess'));
      setShowModal(false);
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      api.reservations.list(monthStr, filterStatus || undefined).then(setReservations);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!confirm(t('calendar.confirmCancelReservation'))) return;
    try {
      await api.reservations.cancel(id);
      showToast(t('calendar.cancelledSuccess'));
      setShowModal(false);
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      api.reservations.list(monthStr, filterStatus || undefined).then(setReservations);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="w-7 h-7 text-indigo-600" />
          {t('calendar.title')}
        </h1>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">{t('common.allStatus')}</option>
            <option value="reserved">{t('calendar.reserved')}</option>
            <option value="cancelled">{t('calendar.cancelled')}</option>
            <option value="completed">{t('calendar.completed')}</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-semibold">{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((dayInfo, idx) => {
            const reservation = getReservationForDate(dayInfo.date);
            const holiday = getHolidayForDate(dayInfo.date);
            const isToday = dayInfo.date === new Date().toISOString().split('T')[0];

            let bgColor = dayInfo.currentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400';
            let borderColor = 'border-transparent';

            if (reservation) {
              if (reservation.status === 'cancelled') {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-200';
              } else if (reservation.payment?.status === 'paid') {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-200';
              } else if (reservation.payment?.status === 'partially_paid') {
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-200';
              } else {
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-200';
              }
            } else if (holiday) {
              bgColor = 'bg-purple-50';
              borderColor = 'border-purple-200';
            }

            if (isToday) {
              borderColor = 'border-indigo-500';
            }

            return (
              <button
                key={idx}
                onClick={() => dayInfo.currentMonth && handleDayClick(dayInfo.date)}
                className={`min-h-[80px] p-2 border ${borderColor} ${bgColor} rounded-lg text-left hover:shadow-md transition-shadow ${!dayInfo.currentMonth ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className={`text-sm ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center' : ''}`}>
                  {dayInfo.day}
                </span>
                {reservation && dayInfo.currentMonth && (
                  <div className="mt-1">
                    <p className="text-xs font-medium truncate">{reservation.resident?.name}</p>
                    <p className="text-xs text-gray-500">${Number(reservation.price).toFixed(2)}</p>
                    {reservation.payment?.status === 'paid' && <span className="text-xs text-green-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> {t('calendar.paid')}</span>}
                    {reservation.payment?.status === 'pending' && <span className="text-xs text-yellow-600 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {t('calendar.pending')}</span>}
                    {reservation.payment?.status === 'partially_paid' && <span className="text-xs text-blue-600 flex items-center gap-0.5"><LoaderCircle className="w-3 h-3" /> {t('calendar.partiallyPaid')}</span>}
                    {reservation.status === 'cancelled' && <span className="text-xs text-red-600 flex items-center gap-0.5"><XCircle className="w-3 h-3" /> {t('calendar.cancelled')}</span>}
                  </div>
                )}
                {holiday && !reservation && dayInfo.currentMonth && (
                  <p className="text-xs text-purple-600 mt-1 truncate flex items-center gap-0.5"><PartyPopper className="w-3 h-3 inline" />{holiday.name}</p>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-50 border border-green-200 rounded" /><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-sm text-gray-600">{t('calendar.paid')}</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded" /><Clock className="w-4 h-4 text-yellow-600" /><span className="text-sm text-gray-600">{t('calendar.pending')}</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded" /><LoaderCircle className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-600">{t('calendar.partiallyPaid')}</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-50 border border-red-200 rounded" /><XCircle className="w-4 h-4 text-red-600" /><span className="text-sm text-gray-600">{t('calendar.cancelled')}</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded" /><PartyPopper className="w-4 h-4 text-purple-600" /><span className="text-sm text-gray-600">{t('calendar.holiday')}</span></div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedDay ? formatDate(selectedDay) : ''}>
        {selectedDay && (() => {
          const reservation = getReservationForDate(selectedDay);
          const holiday = getHolidayForDate(selectedDay);

          if (reservation) {
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">{t('calendar.resident')}</p>
                    <p className="font-medium">{reservation.resident?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">{t('common.status')}</p>
                    <span className={`badge ${reservation.status === 'reserved' ? 'badge-info' : reservation.status === 'cancelled' ? 'badge-danger' : 'badge-success'}`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">{t('nav.payments')}</p>
                    <span className={`badge ${reservation.payment?.status === 'paid' ? 'badge-success' : reservation.payment?.status === 'pending' ? 'badge-warning' : reservation.payment?.status === 'partially_paid' ? 'badge-info' : 'badge-danger'}`}>
                      {reservation.payment?.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">{t('common.price')}</p>
                    <p className="font-medium">${Number(reservation.price).toFixed(2)}</p>
                  </div>
                </div>
                {reservation.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">{t('common.notes')}</p>
                    <p>{reservation.notes}</p>
                  </div>
                )}
                {reservation.status !== 'cancelled' && (
                  <button onClick={() => handleCancelReservation(reservation.id)} className="btn-danger w-full flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {t('calendar.cancelReservation')}
                  </button>
                )}
              </div>
            );
          }

          return (
            <CreateReservationForm
              date={selectedDay}
              residents={residents}
              holiday={holiday}
              onSubmit={handleCreateReservation}
              onCancel={() => setShowModal(false)}
            />
          );
        })()}
      </Modal>
    </div>
  );
}

function CreateReservationForm({ date, residents, holiday, onSubmit, onCancel }: {
  date: string;
  residents: Resident[];
  holiday: Holiday | undefined;
  onSubmit: (residentId: number, notes: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [residentId, setResidentId] = useState('');
  const [notes, setNotes] = useState('');

  const activeResidents = residents.filter((r) => r.isActive);

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (residentId) onSubmit(Number(residentId), notes); }} className="space-y-4">
      <div>
        <label className="label">{t('calendar.selectResident')}</label>
        <select value={residentId} onChange={(e) => setResidentId(e.target.value)} className="input" required>
          <option value="">{t('calendar.chooseResident')}</option>
          {activeResidents.map((r) => (
            <option key={r.id} value={r.id}>{r.name} - {r.address}</option>
          ))}
        </select>
      </div>
      {holiday && (
        <div className="p-3 bg-purple-50 rounded-lg flex items-center gap-2">
          <PartyPopper className="w-4 h-4 text-purple-600" />
          <p className="text-sm text-purple-700">{holiday.name} ({holiday.type})</p>
        </div>
      )}
      <div>
        <label className="label">{t('common.notes')}</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" rows={3} />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{t('calendar.createReservation')}</button>
      </div>
    </form>
  );
}
