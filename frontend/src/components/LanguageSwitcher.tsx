import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt-BR' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      title={i18n.language === 'en' ? t('language.portuguese') : t('language.english')}
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{i18n.language === 'en' ? 'EN' : 'PT'}</span>
    </button>
  );
}
