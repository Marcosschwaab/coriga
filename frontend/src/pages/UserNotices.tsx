import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Notice } from '../types';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { Megaphone, Calendar } from 'lucide-react';

export function UserNoticesPage() {
  const { t } = useTranslation();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.notices.list(page, 10).then((res) => {
      setNotices(res.data);
      setTotalPages(res.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Loading text={t('notices.title')} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-indigo-600" />
          {t('notices.title')}
        </h1>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="card">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-lg font-semibold text-gray-800">{n.title}</h2>
              <span className="flex items-center gap-1.5 text-sm text-gray-400 shrink-0">
                <Calendar className="w-4 h-4" />
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600 whitespace-pre-wrap">{n.content}</p>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="card text-center py-8 text-gray-500">
            {t('notices.noNotices')}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
