import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Edit, RefreshCw } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { generateDocx } from '../utils/docxGenerator';
import { generateDocxTC } from '../utils/docxGeneratorTC';
import { downloadPlainTextResume } from '../utils/docxGeneratorFallback';
import { renderAsync } from 'docx-preview';

const PreviewPage: React.FC = () => {
  const resumeData = useAppSelector(state => state.resume);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const docxPreviewRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);

  const generateDocxBlob = async (): Promise<Blob> => {
      // We'll create new functions that return blobs instead of downloading
      if (i18n.language === 'zh-TW') {
        const { generateDocxBlobTC } = await import('../utils/docxGeneratorTC');
        return await generateDocxBlobTC(resumeData as any);
      } else {
        const { generateDocxBlob } = await import('../utils/docxGenerator');
        return await generateDocxBlob(resumeData as any);
      }
  };

  const generatePreview = async (isLanguageChange: boolean = false) => {
    if (!docxPreviewRef.current) return;
    
    setIsGeneratingPreview(true);
    try {
      // Clear previous content
      docxPreviewRef.current.innerHTML = '';
      
      // Show language-specific loading message
      if (isLanguageChange) {
        const loadingMessage = i18n.language === 'zh-TW' 
          ? '正在重新生成預覽...' 
          : 'Regenerating preview...';
        docxPreviewRef.current.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: #3b82f6; border: 2px dashed #3b82f6; border-radius: 8px; margin: 1rem;">
            <h3>${loadingMessage}</h3>
            <p>${i18n.language === 'zh-TW' ? '切換語言後重新生成文檔預覽' : 'Regenerating document preview after language change'}</p>
          </div>
        `;
      }

      //wait for 0.3 seconds before generating preview
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const blob = await generateDocxBlob();
      
      // Use docx-preview to render the document
      await renderAsync(blob, docxPreviewRef.current, undefined, {
        className: 'docx-preview',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: true, // Let CSS handle fonts
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        experimental: true,
        trimXmlDeclaration: true,
        debug: false
      });
      
      // Apply additional styling after rendering
      if (docxPreviewRef.current) {
        // Force font inheritance on all elements
        const allElements = docxPreviewRef.current.querySelectorAll('*');
        allElements.forEach(element => {
          const htmlElement = element as HTMLElement;
          // Remove inline font styles to let CSS take precedence
          if (htmlElement.style.fontFamily) {
            htmlElement.style.removeProperty('font-family');
          }
          // Ensure consistent text color
          if (htmlElement.style.color && htmlElement.style.color !== '#000000') {
            htmlElement.style.color = '#000000';
          }
        });
      }
      
      setPreviewGenerated(true);
    } catch (error) {
      console.error('Failed to preview DOCX:', error);
      if (docxPreviewRef.current) {
        const errorMessage = i18n.language === 'zh-TW' 
          ? '生成 DOCX 預覽失敗' 
          : 'Failed to generate DOCX preview';
        const suggestionMessage = i18n.language === 'zh-TW' 
          ? '請嘗試下載文檔' 
          : 'Please try downloading the document instead.';
        
        docxPreviewRef.current.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: #ef4444; border: 2px dashed #ef4444; border-radius: 8px; margin: 1rem;">
            <h3>${errorMessage}</h3>
            <p>${suggestionMessage}</p>
          </div>
        `;
      }
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Auto-generate preview when component mounts, data changes, or language changes
  useEffect(() => {
    generatePreview();
  }, [resumeData, i18n.language]);

  // Additional effect specifically for language changes to ensure proper regeneration
  useEffect(() => {
    if (previewGenerated) {
      // Force regeneration when language changes
      generatePreview(true);
    }
  }, [i18n.language]);

  const handleDownloadDocx = async () => {
    try {
      // Use Traditional Chinese version if language is zh-TW
      if (i18n.language === 'zh-TW') {
        await generateDocxTC(resumeData as any);
      } else {
        await generateDocx(resumeData as any);
      }
    } catch (error) {
      console.error('Failed to generate DOCX:', error);
      alert(t('preview.downloadError'));
      downloadPlainTextResume(resumeData as any);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/optional')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">
              {t('preview.title')}
            </h1>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/personal')}
                className="btn-secondary flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('preview.editResume')}
              </button>
              <button
                onClick={() => generatePreview(false)}
                disabled={isGeneratingPreview}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingPreview ? 'animate-spin' : ''}`} />
                {isGeneratingPreview 
                  ? (i18n.language === 'zh-TW' ? '生成中...' : 'Generating...')
                  : (i18n.language === 'zh-TW' ? '刷新預覽' : 'Refresh Preview')
                }
              </button>
              <button
                onClick={handleDownloadDocx}
                className="btn-primary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('preview.downloadWord')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DOCX Preview */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {isGeneratingPreview && (
            <div className="flex items-center justify-center p-8 bg-gray-50">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-lg text-gray-700">
                {i18n.language === 'zh-TW' ? '正在生成 DOCX 預覽...' : 'Generating DOCX preview...'}
              </span>
            </div>
          )}
          
          <div 
            ref={docxPreviewRef}
            className="docx-preview-container"
            data-language={i18n.language}
            style={{
              minHeight: isGeneratingPreview ? '0' : '600px',
              backgroundColor: '#ffffff',
              width: '100%'
            }}
          />
          
          {!isGeneratingPreview && !previewGenerated && (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <span>
                {i18n.language === 'zh-TW' ? '預覽將在生成後顯示' : 'Preview will appear here once generated'}
              </span>
            </div>
          )}
        </div>

        {/* Information Cards */}
        <div className="space-y-4 mt-6">
          {/* Document Info */}
          <div className="text-center p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              📄 <strong>{t('preview.documentInfo.title')}</strong> {t('preview.documentInfo.content')} 
              <span className="hidden sm:inline">{t('preview.documentInfo.details')}</span>
            </p>
          </div>

          {/* Mobile Device Notice */}
          <div className="text-center p-3 md:p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-xs sm:text-sm text-orange-800">
              <p className="mb-2 sm:mb-0">
                📱 <strong>{t('preview.mobileNotice.title')}</strong> {t('preview.mobileNotice.subtitle')}
              </p>
              <div className="space-y-1 sm:space-y-0 text-left sm:text-center">
                <div>• {t('preview.mobileNotice.options.option1')}</div>
                <div>• {t('preview.mobileNotice.options.option2')}</div>
                <div>• {t('preview.mobileNotice.options.option3')}</div>
                <div>• {t('preview.mobileNotice.options.option4')}</div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              🔒 <strong>{t('preview.privacyNotice.title')}</strong> {t('preview.privacyNotice.content')} 
              <span className="hidden sm:inline">{t('preview.privacyNotice.reminder')}</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PreviewPage;