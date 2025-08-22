import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StepIndicator from './StepIndicator';
import LanguageSwitcher from './common/LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isPreviewPage = location.pathname === '/preview';
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between lg:items-start lg:flex-row flex-col flex-wrap items-center">
            <div className="flex-1 ">
              <h1 className="text-3xl font-bold text-gray-900 text-center">
                {t('app.title')}
              </h1>
              <p className="text-gray-600 text-center mt-2">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="ml-4 mt-2 lg:mt-0">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {!isPreviewPage && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <StepIndicator />
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pb-8">
        {children}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            {t('app.privacy')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
