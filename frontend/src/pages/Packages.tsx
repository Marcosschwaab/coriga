import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { PackageOrder, Recipient } from '../types';
import { Loading } from '../components/Loading';
import { Pagination } from '../components/Pagination';
import { useToast } from '../components/Toast';
import { Package, Plus, Search, Camera, Trash2, Calendar, Hash, User, MapPin, Building, Globe, Check, Pencil, X } from 'lucide-react';
import Tesseract from 'tesseract.js';

export function PackagesPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [packages, setPackages] = useState<PackageOrder[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageOrder | null>(null);

  const fetchPackages = (p: number, l: number) => {
    return api.packages.list(search || undefined, p, l).then((res) => {
      setPackages(res.data);
      setTotalPages(res.totalPages);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchPackages(page, limit).finally(() => setLoading(false));
  }, [search, page, limit]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleEdit = (pkg: PackageOrder) => {
    setEditingPkg(pkg);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('packages.confirmDelete'))) return;
    try {
      await api.packages.remove(id);
      showToast(t('packages.deletedSuccess'));
      fetchPackages(page, limit);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loading text={t('packages.title')} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-7 h-7 text-indigo-600" />
          {t('packages.title')}
        </h1>
        <button onClick={() => { setShowForm(!showForm); setEditingPkg(null); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('packages.registerPackage')}
        </button>
      </div>

      {showForm ? (
        <PackageForm
          pkg={editingPkg}
          onSave={async () => {
            setShowForm(false);
            setEditingPkg(null);
            await fetchPackages(page, limit);
          }}
          onCancel={() => { setShowForm(false); setEditingPkg(null); }}
        />
      ) : (
        <>
          <div className="card mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('packages.searchPlaceholder')}
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('packages.trackingCode')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('packages.recipient')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('packages.receivedAt')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-sm">
                        <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                        {pkg.codigoRastreio}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{pkg.recipient?.nome}</p>
                          <p className="text-xs text-gray-500">{pkg.recipient?.endereco}, {pkg.recipient?.bairro}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(pkg.dataRecebimento + 'T00:00:00').toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(pkg)} className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600" title={t('common.edit')}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(pkg.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600" title={t('common.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {packages.length === 0 && (
              <p className="text-center py-8 text-gray-500">{t('packages.noPackages')}</p>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} limit={limit} onPageChange={setPage} onLimitChange={handleLimitChange} />
        </>
      )}
    </div>
  );
}

function PackageForm({ pkg, onSave, onCancel }: { pkg?: PackageOrder | null; onSave: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(pkg?.recipient ?? null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const [nome, setNome] = useState(pkg?.recipient?.nome ?? '');
  const [endereco, setEndereco] = useState(pkg?.recipient?.endereco ?? '');
  const [cep, setCep] = useState(pkg?.recipient?.cep ?? '');
  const [cidade, setCidade] = useState(pkg?.recipient?.cidade ?? '');
  const [bairro, setBairro] = useState(pkg?.recipient?.bairro ?? '');
  const [codigoRastreio, setCodigoRastreio] = useState(pkg?.codigoRastreio ?? '');
  const [dataRecebimento, setDataRecebimento] = useState(pkg?.dataRecebimento ?? new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      api.packages.listRecipients(searchTerm, 1, 20).then((res) => setRecipients(res.data));
    } else {
      setRecipients([]);
    }
  }, [searchTerm]);

  const selectRecipient = (r: Recipient) => {
    setSelectedRecipient(r);
    setNome(r.nome);
    setEndereco(r.endereco);
    setCep(r.cep);
    setCidade(r.cidade);
    setBairro(r.bairro);
    setSearchOpen(false);
    setSearchTerm('');
  };

  const clearRecipient = () => {
    setSelectedRecipient(null);
    setNome('');
    setEndereco('');
    setCep('');
    setCidade('');
    setBairro('');
  };

  const runOcr = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setOcrProcessing(true);
    try {
      const { data } = await Tesseract.recognize(url, 'por', {
        logger: () => {},
      });
      const text = data.text;
      const lines = text.split('\n').filter(Boolean);

      const trackingMatch = text.match(/[A-Z]{2}\d{9}[A-Z]{2}/i);
      if (trackingMatch) setCodigoRastreio(trackingMatch[0].toUpperCase());

      const zipMatch = text.match(/\d{5}-?\d{3}/);
      if (zipMatch) setCep(zipMatch[0].replace(/-/g, ''));

      if (lines.length > 0 && !nome) setNome(lines[0] || '');
      if (lines.length > 1) setEndereco(lines[1] || '');
      if (lines.length > 2) setBairro(lines[2] || '');

      showToast(t('packages.ocrSuccess'));
    } catch (err) {
      showToast(t('packages.ocrError'), 'error');
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runOcr(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (pkg) {
        await api.packages.update(pkg.id, { codigoRastreio, dataRecebimento });
        showToast(t('packages.updatedSuccess'));
      } else {
        let recipientId: number;

        if (selectedRecipient) {
          recipientId = selectedRecipient.id;
        } else {
          const existing = await api.packages.listRecipients(nome);
          const found = existing.data.find(
            (r) => r.nome.toLowerCase() === nome.toLowerCase()
          );

          if (found) {
            showToast(t('packages.recipientExists'), 'error');
            return;
          }

          const newRecipient = await api.packages.createRecipient({ nome, endereco, cep, cidade, bairro });
          recipientId = newRecipient.id;
        }

        await api.packages.create({ codigoRastreio, recipientId, dataRecebimento });
        showToast(t('packages.createdSuccess'));
      }
      onSave();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{pkg ? t('packages.editPackage') : t('packages.registerPackage')}</h2>
          <div className="flex gap-2">
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2" disabled={ocrProcessing}>
              {ocrProcessing ? (
                <span className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {t('packages.scanLabel')}
            </button>
          </div>
        </div>

        {previewUrl && (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 max-h-48">
            <img src={previewUrl} alt="Label preview" className="w-full object-contain max-h-48" />
            <button type="button" onClick={() => { setPreviewUrl(null); URL.revokeObjectURL(previewUrl); }} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 flex items-center gap-2"><User className="w-4 h-4" />{t('packages.recipientData')}</h3>

            <div className="relative">
              <label className="label">{t('packages.fullName')}</label>
              <input
                type="text"
                value={selectedRecipient ? nome : searchTerm || nome}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setNome(e.target.value);
                  setSelectedRecipient(null);
                  setSearchOpen(true);
                }}
                onFocus={() => { if (searchTerm.length >= 2) setSearchOpen(true); }}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="input"
                required
                autoComplete="off"
              />
              {selectedRecipient && (
                <button type="button" onClick={clearRecipient} className="absolute right-3 top-9 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {searchOpen && recipients.length > 0 && !selectedRecipient && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {recipients.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-indigo-50 transition-colors text-gray-700"
                      onMouseDown={() => selectRecipient(r)}
                    >
                      <span className="font-medium">{r.nome}</span>
                      <span className="text-gray-400 ml-2">{r.endereco}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">{t('packages.address')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="input pl-10" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('packages.zipCode')}</label>
                <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label">{t('packages.neighborhood')}</label>
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} className="input" required />
              </div>
            </div>
            <div>
              <label className="label">{t('packages.city')}</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="input pl-10" required />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 flex items-center gap-2"><Package className="w-4 h-4" />{t('packages.packageData')}</h3>
            <div>
              <label className="label">{t('packages.trackingCode')}</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={codigoRastreio} onChange={(e) => setCodigoRastreio(e.target.value)} className="input pl-10 font-mono" required placeholder="Ex: BR123456789BR" />
              </div>
            </div>
            <div>
              <label className="label">{t('packages.receivedAt')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={dataRecebimento} onChange={(e) => setDataRecebimento(e.target.value)} className="input pl-10" required />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">{t('common.cancel')}</button>
          <button type="submit" className="btn-primary flex-1">{pkg ? t('common.update') : t('packages.registerPackage')}</button>
        </div>
      </form>
    </div>
  );
}
