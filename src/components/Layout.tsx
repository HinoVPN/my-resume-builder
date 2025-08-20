import React from 'react';
import { useLocation } from 'react-router-dom';
import StepIndicator from './StepIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isPreviewPage = location.pathname === '/preview';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Resume Builder
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Create your professional resume in minutes
          </p>
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
            🔒 Your privacy is protected. All data is processed locally and never stored on our servers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
