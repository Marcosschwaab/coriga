import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ListRestart } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  limit?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 30, 50, 100];

export function Pagination({ page, totalPages, limit = 50, onPageChange, onLimitChange }: PaginationProps) {
  const { t } = useTranslation();

  if (!onLimitChange && totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      {onLimitChange && (
        <div className="flex items-center gap-2">
          <ListRestart className="w-4 h-4 text-gray-400" />
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt} / {t('common.page')}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">
          {t('common.page')} {page} {t('common.of')} {totalPages}
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 py-1.5 text-sm text-gray-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    p === page
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
