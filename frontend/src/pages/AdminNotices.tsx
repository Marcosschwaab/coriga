import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Notice } from '../types';
import { Modal } from '../components/Modal';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { Megaphone, Plus, Pencil, Trash2, Calendar } from 'lucide-react';

export function AdminNoticesPage() {
  const { t } = useTranslation();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    api.notices.list(page).then((res) => {
      setNotices(res.data);
      setTotalPages(res.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  const handleSave = async (data: Partial<Notice>) => {
    try {
      if (editingNotice) {
        await api.notices.update(editingNotice.id, data);
        showToast(t('notices.updatedSuccess'));
      } else {
        await api.notices.create(data);
        showToast(t('notices.createdSuccess'));
      }
      setShowModal(false);
      setEditingNotice(null);
      api.notices.list(page).then((res) => {
        setNotices(res.data);
        setTotalPages(res.totalPages);
      });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('notices.confirmDelete'))) return;
    try {
      await api.notices.remove(id);
      showToast(t('notices.deletedSuccess'));
      api.notices.list(page).then((res) => {
        setNotices(res.data);
        setTotalPages(res.totalPages);
      });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loading text={t('notices.title')} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-indigo-600" />
          {t('notices.title')}
        </h1>
        <button onClick={() => { setEditingNotice(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('notices.addNotice')}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.title')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.date')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((n) => (
              <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{n.title}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingNotice(n); setShowModal(true); }} className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title={t('common.edit')}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600" title={t('common.delete')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notices.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('notices.noNotices')}</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingNotice(null); }} title={editingNotice ? t('notices.editNotice') : t('notices.addNotice')}>
        <NoticeForm notice={editingNotice} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingNotice(null); }} />
      </Modal>
    </div>
  );
}

function NoticeForm({ notice, onSave, onCancel }: {
  notice: Notice | null;
  onSave: (data: Partial<Notice>) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(notice?.title || '');
  const [content, setContent] = useState(notice?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">{t('common.title')}</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
      </div>
      <div>
        <label className="label">{t('common.content')}</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input" rows={6} required />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{notice ? t('common.update') : t('common.create')}</button>
      </div>
    </form>
  );
}
