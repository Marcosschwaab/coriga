import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Holiday } from '../types';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PartyPopper, Plus, Pencil, Trash2, Calendar, Tag, FileText, Filter, CalendarDays } from 'lucide-react';

export function HolidaysPage() {
  const { t } = useTranslation();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const { showToast } = useToast();

  useEffect(() => {
    api.holidays.list(yearFilter).then(setHolidays);
  }, [yearFilter]);

  const handleSave = async (data: Partial<Holiday>) => {
    try {
      if (editingHoliday) {
        await api.holidays.update(editingHoliday.id, data);
        showToast(t('holidays.updatedSuccess'));
      } else {
        await api.holidays.create(data);
        showToast(t('holidays.createdSuccess'));
      }
      setShowModal(false);
      setEditingHoliday(null);
      api.holidays.list(yearFilter).then(setHolidays);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('holidays.confirmDelete'))) return;
    try {
      await api.holidays.remove(id);
      showToast(t('holidays.deletedSuccess'));
      api.holidays.list(yearFilter).then(setHolidays);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PartyPopper className="w-7 h-7 text-indigo-600" />
          {t('holidays.title')}
        </h1>
        <button onClick={() => { setEditingHoliday(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('holidays.addHoliday')}
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">{t('holidays.year')}:</label>
          <input
            type="number"
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            className="input max-w-[120px]"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.name')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.date')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.type')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.notes')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{h.name}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(h.date + 'T00:00:00').toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${h.type === 'national' ? 'badge-info' : h.type === 'municipal' ? 'badge-warning' : 'badge-gray'}`}>
                    {h.type === 'national' ? t('holidays.national') : h.type === 'municipal' ? t('holidays.municipal') : t('holidays.condominium')}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{h.notes || '-'}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingHoliday(h); setShowModal(true); }} className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title={t('common.edit')}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(h.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600" title={t('common.delete')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {holidays.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('holidays.noHolidays')}</p>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingHoliday(null); }} title={editingHoliday ? t('holidays.editHoliday') : t('holidays.addHoliday')}>
        <HolidayForm holiday={editingHoliday} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingHoliday(null); }} />
      </Modal>
    </div>
  );
}

function HolidayForm({ holiday, onSave, onCancel }: {
  holiday: Holiday | null;
  onSave: (data: Partial<Holiday>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(holiday?.name || '');
  const [date, setDate] = useState(holiday?.date || '');
  const [type, setType] = useState<'national' | 'municipal' | 'condominium'>(holiday?.type || 'national');
  const [notes, setNotes] = useState(holiday?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, date, type, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">{t('holidays.holidayName')}</label>
        <div className="relative">
          <PartyPopper className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div>
        <label className="label">{t('common.date')}</label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div>
        <label className="label">{t('common.type')}</label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="input pl-10">
            <option value="national">{t('holidays.national')}</option>
            <option value="municipal">{t('holidays.municipal')}</option>
            <option value="condominium">{t('holidays.condominium')}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">{t('common.notes')}</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input pl-10" rows={3} />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{holiday ? t('common.update') : t('common.create')}</button>
      </div>
    </form>
  );
}
