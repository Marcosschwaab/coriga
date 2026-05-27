import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Resident } from '../types';
import { Modal } from '../components/Modal';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { Users, Plus, Search, Pencil, UserMinus, Mail, Phone, MapPin, User, AtSign } from 'lucide-react';

export function ResidentsPage() {
  const { t } = useTranslation();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const { showToast } = useToast();

  const fetchResidents = (p: number, l: number) => {
    return api.residents.list(search, p, l).then((res) => {
      setResidents(res.data);
      setTotalPages(res.totalPages);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchResidents(page, limit).finally(() => setLoading(false));
  }, [search, page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSave = async (data: Partial<Resident>) => {
    try {
      if (editingResident) {
        await api.residents.update(editingResident.id, data);
        showToast(t('residents.updatedSuccess'));
      } else {
        await api.residents.create(data);
        showToast(t('residents.createdSuccess'));
      }
      setShowModal(false);
      setEditingResident(null);
      fetchResidents(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('residents.confirmDeactivate'))) return;
    try {
      await api.residents.remove(id);
      showToast(t('residents.deactivatedSuccess'));
      fetchResidents(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loading text={t('residents.title')} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-7 h-7 text-indigo-600" />
          {t('residents.title')}
        </h1>
        <button onClick={() => { setEditingResident(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('residents.addResident')}
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('residents.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('residents.fullName')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('residents.phone')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('residents.address')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('residents.email')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.status')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident) => (
              <tr key={resident.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{resident.name}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3.5 h-3.5" />
                    {resident.phone}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-3.5 h-3.5" />
                    {resident.address}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="w-3.5 h-3.5" />
                    {resident.email}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge ${resident.isActive ? 'badge-success' : 'badge-gray'}`}>
                    {resident.isActive ? t('residents.active') : t('residents.inactive')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingResident(resident); setShowModal(true); }}
                      className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
                      title={t('common.edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {resident.isActive && (
                      <button
                        onClick={() => handleDelete(resident.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        title={t('residents.deactivate')}
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {residents.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('residents.noResidents')}</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} limit={limit} onPageChange={setPage} onLimitChange={handleLimitChange} />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingResident(null); }} title={editingResident ? t('residents.editResident') : t('residents.addResident')}>
        <ResidentForm resident={editingResident} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingResident(null); }} />
      </Modal>
    </div>
  );
}

function ResidentForm({ resident, onSave, onCancel }: {
  resident: Resident | null;
  onSave: (data: Partial<Resident>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(resident?.name || '');
  const [phone, setPhone] = useState(resident?.phone || '');
  const [address, setAddress] = useState(resident?.address || '');
  const [email, setEmail] = useState(resident?.email || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, phone, address, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">{t('residents.fullName')}</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div>
        <label className="label">{t('residents.phone')}</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div>
        <label className="label">{t('residents.address')}</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div>
        <label className="label">{t('residents.email')}</label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" required />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{resident ? t('common.update') : t('common.create')}</button>
      </div>
    </form>
  );
}
