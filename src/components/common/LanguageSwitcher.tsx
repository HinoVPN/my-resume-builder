import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {t('language.switch')}
        </span>
      </button>
      
      <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
            i18n.language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
        >
          {t('language.english')}
        </button>
        <button
          onClick={() => handleLanguageChange('zh-TW')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
            i18n.language === 'zh-TW' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
        >
          {t('language.chineseTraditional')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
