import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { User } from '../types';
import { Modal } from '../components/Modal';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { UserCog, Plus, Search, Pencil, Trash2, AtSign, Shield } from 'lucide-react';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { showToast } = useToast();

  const fetchUsers = (p: number, l: number) => {
    return api.users.list(search || undefined, p, l).then((res) => {
      setUsers(res.data);
      setTotalPages(res.totalPages);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers(page, limit).finally(() => setLoading(false));
  }, [search, page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSave = async (data: Partial<User> & { password?: string }) => {
    try {
      if (editingUser) {
        const payload: any = {};
        if (data.username) payload.username = data.username;
        if (data.email) payload.email = data.email;
        if (data.role) payload.role = data.role;
        if (data.password) payload.password = data.password;
        await api.users.update(editingUser.id, payload);
        showToast(t('users.updatedSuccess'));
      } else {
        await api.users.create(data as any);
        showToast(t('users.createdSuccess'));
      }
      setShowModal(false);
      setEditingUser(null);
      fetchUsers(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('users.confirmDelete'))) return;
    try {
      await api.users.remove(id);
      showToast(t('users.deletedSuccess'));
      fetchUsers(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loading text={t('users.title')} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCog className="w-7 h-7 text-indigo-600" />
          {t('users.title')}
        </h1>
        <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('users.addUser')}
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
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
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('users.username')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('users.email')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('users.role')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{u.username}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <AtSign className="w-3.5 h-3.5" />
                    {u.email}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    <span className="capitalize">{t(`common.${u.role}`)}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingUser(u); setShowModal(true); }} className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title={t('common.edit')}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600" title={t('common.delete')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('users.noUsers')}</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} limit={limit} onPageChange={setPage} onLimitChange={handleLimitChange} />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingUser(null); }} title={editingUser ? t('users.editUser') : t('users.addUser')}>
        <UserForm user={editingUser} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingUser(null); }} />
      </Modal>
    </div>
  );
}

function UserForm({ user, onSave, onCancel }: {
  user: User | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(user?.role || 'user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { username, email, role };
    if (password) data.password = password;
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">{t('users.username')}</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input" required />
      </div>
      <div>
        <label className="label">{t('users.email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
      </div>
      <div>
        <label className="label">{t('users.password')}{user && t('users.passwordOptional')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required={!user} placeholder={user ? t('users.leaveBlank') : ''} />
      </div>
      <div>
        <label className="label">{t('users.role')}</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
          <option value="user">{t('common.user')}</option>
          <option value="admin">{t('common.admin')}</option>
          <option value="concierge">{t('common.concierge')}</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{user ? t('common.update') : t('common.create')}</button>
      </div>
    </form>
  );
}
