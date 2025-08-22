import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, Edit, RefreshCw } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { renderAsync } from 'docx-preview';
import { COMMON_CONSTANTS } from '../types/commonConstants';
import { generateDocx, generateDocxBlob } from '../utils/docxGenerator';
import type { ResumeData } from '../types/resume';


const PreviewPage: React.FC = () => {
  const resumeData = useAppSelector(state => state.resume);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const docxPreviewRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);

  const generateDocxBlobPreview = useCallback(async (resumeData: ResumeData): Promise<Blob> => {
      // We'll create new functions that return blobs instead of downloading
      if (i18n.language === COMMON_CONSTANTS.LANGUAGE['ZH-TW']) {
        return await generateDocxBlob(resumeData, COMMON_CONSTANTS.LANGUAGE['ZH-TW']);
      } else {
        return await generateDocxBlob(resumeData, COMMON_CONSTANTS.LANGUAGE['EN']);
      }
  }, [i18n.language]);

  const generatePreview = useCallback(async (isLanguageChange: boolean = false) => {
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
      
      const blob = await generateDocxBlobPreview(resumeData);
      
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
  }, [resumeData, i18n.language, generateDocxBlobPreview]);

  // Auto-generate preview when component mounts, data changes, or language changes
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const handleDownloadDocx = async () => {
    try {
      // Use Traditional Chinese version if language is zh-TW
      if (i18n.language === COMMON_CONSTANTS.LANGUAGE['ZH-TW']) {
        await generateDocx(resumeData, COMMON_CONSTANTS.LANGUAGE['ZH-TW']);
      } else {
        await generateDocx(resumeData, COMMON_CONSTANTS.LANGUAGE['EN']);
      }
    } catch (error) {
      console.error('Failed to generate DOCX:', error);
      alert(t('preview.downloadError'));
    }
  };

  //TODO: Add PDF download
  // const handleDownloadPdf = async () => {
  //   try {
  //     // Show loading state
  //     const loadingToast = document.createElement('div');
  //     loadingToast.style.cssText = `
  //       position: fixed;
  //       top: 20px;
  //       right: 20px;
  //       background: #3b82f6;
  //       color: white;
  //       padding: 12px 20px;
  //       border-radius: 8px;
  //       z-index: 10000;
  //       font-family: system-ui;
  //       box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  //     `;
  //     loadingToast.textContent = i18n.language === 'zh-TW' ? '正在生成 PDF...' : 'Generating PDF...';
  //     document.body.appendChild(loadingToast);

  //     // Generate PDF using the same data structure as DOCX
  //     const language = i18n.language as 'en' | 'zh-TW';
  //     await generatePdf(resumeData as any, language);

  //     // Remove loading toast
  //     document.body.removeChild(loadingToast);

  //     // Show success message
  //     const successToast = document.createElement('div');
  //     successToast.style.cssText = loadingToast.style.cssText.replace('#3b82f6', '#10b981');
  //     successToast.textContent = i18n.language === 'zh-TW' ? 'PDF 已成功下載！' : 'PDF downloaded successfully!';
  //     document.body.appendChild(successToast);
  //     setTimeout(() => {
  //       if (document.body.contains(successToast)) {
  //         document.body.removeChild(successToast);
  //       }
  //     }, 3000);

  //   } catch (error) {
  //     console.error('Failed to generate PDF:', error);
      
  //     // Remove loading toast if it exists
  //     const loadingToast = document.querySelector('div[style*="正在生成 PDF"], div[style*="Generating PDF"]');
  //     if (loadingToast) {
  //       document.body.removeChild(loadingToast);
  //     }

  //     alert(i18n.language === 'zh-TW' ? 'PDF 生成失敗，請稍後再試' : 'Failed to generate PDF. Please try again.');
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {isGeneratingPreview && (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg text-gray-700">
          {i18n.language === 'zh-TW' ? '正在生成預覽...' : 'Generating preview...'}
        </span>
      </div>
      )}

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
                onClick={handleDownloadDocx}
                className="btn-primary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('preview.downloadWord')}
              </button>

              {/* 
              //TODO: Add PDF download
              <button
                onClick={handleDownloadPdf}
                className="btn-primary flex items-center bg-red-600 hover:bg-red-700"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {i18n.language === COMMON_CONSTANTS.LANGUAGE['ZH-TW'] ? '下載 PDF' : 'Download PDF'}
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* DOCX Preview */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
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