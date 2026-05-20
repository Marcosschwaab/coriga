import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { PricingConfig } from '../types';
import { useToast } from '../components/Toast';
import { Settings, DollarSign, CalendarDays, CalendarRange, PartyPopper, Save } from 'lucide-react';

export function PricingPage() {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [weekdayPrice, setWeekdayPrice] = useState('');
  const [weekendPrice, setWeekendPrice] = useState('');
  const [holidayPrice, setHolidayPrice] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api.pricingConfig.get().then((data) => {
      setConfig(data);
      setWeekdayPrice(data.weekdayPrice.toString());
      setWeekendPrice(data.weekendPrice.toString());
      setHolidayPrice(data.holidayPrice.toString());
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.pricingConfig.update({
        weekdayPrice: Number(weekdayPrice),
        weekendPrice: Number(weekendPrice),
        holidayPrice: Number(holidayPrice),
      });
      showToast(t('pricing.updatedSuccess'));
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (!config) return <div className="text-center py-12">{t('common.loading')}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="w-7 h-7 text-indigo-600" />
        {t('pricing.title')}
      </h1>

      <div className="card max-w-lg">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-4 bg-indigo-50 rounded-xl">
            <label className="label text-indigo-700">{t('pricing.weekdayPrice')}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input
                type="number"
                step="0.01"
                value={weekdayPrice}
                onChange={(e) => setWeekdayPrice(e.target.value)}
                className="input pl-10 bg-white"
                required
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-indigo-600">
              <CalendarDays className="w-3.5 h-3.5" />
              <p className="text-sm">{t('pricing.weekdayHelper')}</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl">
            <label className="label text-amber-700">{t('pricing.weekendPrice')}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="number"
                step="0.01"
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(e.target.value)}
                className="input pl-10 bg-white"
                required
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-amber-600">
              <CalendarRange className="w-3.5 h-3.5" />
              <p className="text-sm">{t('pricing.weekendHelper')}</p>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl">
            <label className="label text-purple-700">{t('pricing.holidayPrice')}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="number"
                step="0.01"
                value={holidayPrice}
                onChange={(e) => setHolidayPrice(e.target.value)}
                className="input pl-10 bg-white"
                required
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-purple-600">
              <PartyPopper className="w-3.5 h-3.5" />
              <p className="text-sm">{t('pricing.holidayHelper')}</p>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {t('pricing.savePricing')}
          </button>
        </form>
      </div>
    </div>
  );
}
