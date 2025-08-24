import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateSectionOrdering } from '../../store/resumeSlice';

interface SectionInfo {
  id: string;
  labelKey: string;
  enabled: boolean;
  order: number;
}

const OrderingForm: React.FC = () => {
  const resumeData = useAppSelector(state => state.resume);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get current section ordering or create default
  const getDefaultSections = useCallback((): SectionInfo[] => {
    const sections: SectionInfo[] = [
      { id: 'contactInfo', labelKey: 'ordering.sections.contactInfo', enabled: true, order: 1 },
      { id: 'professionalSummary', labelKey: 'ordering.sections.professionalSummary', enabled: !!resumeData.professionalSummary.content, order: 2 },
      { id: 'workExperience', labelKey: 'ordering.sections.workExperience', enabled: resumeData.workExperiences.length > 0, order: 3 },
      { id: 'education', labelKey: 'ordering.sections.education', enabled: resumeData.education.length > 0, order: 4 },
      { id: 'skills', labelKey: 'ordering.sections.skills', enabled: resumeData.skills.length > 0, order: 5 },
      { id: 'certificates', labelKey: 'ordering.sections.certificates', enabled: resumeData.optionalSections.certificates.length > 0, order: 6 },
      { id: 'languages', labelKey: 'ordering.sections.languages', enabled: resumeData.optionalSections.languages.length > 0, order: 7 },
      { id: 'hobbies', labelKey: 'ordering.sections.hobbies', enabled: !!resumeData.optionalSections.hobbies, order: 8 }
    ];

    // Add custom sections
    if (resumeData.optionalSections.customSections) {
      resumeData.optionalSections.customSections.forEach((customSection, index) => {
        sections.push({
          id: `custom_${customSection.id}`,
          labelKey: customSection.title,
          enabled: true,
          order: 9 + index
        });
      });
    }
    return sections;
  }, [resumeData]);

  const [sections, setSections] = useState<SectionInfo[]>(() => {
    if (resumeData.sectionOrdering && resumeData.sectionOrdering.length > 0) {
      return resumeData.sectionOrdering;
    }
    return getDefaultSections();
  });

  // Update sections when resume data changes
  useEffect(() => {
    if (!resumeData.sectionOrdering || resumeData.sectionOrdering.length === 0) {
      setSections(getDefaultSections());
    }
  }, [resumeData.sectionOrdering, getDefaultSections]);

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const enabledSectionsList = sections
      .filter(section => section.enabled)
      .sort((a, b) => a.order - b.order);
    
    const currentIndex = enabledSectionsList.findIndex(section => section.id === sectionId);
    
    if (currentIndex === -1) return;
    
    let targetIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < enabledSectionsList.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return; // Can't move further
    }
    
    // Create a new array with swapped elements
    const newEnabledList = [...enabledSectionsList];
    [newEnabledList[currentIndex], newEnabledList[targetIndex]] = 
    [newEnabledList[targetIndex], newEnabledList[currentIndex]];
    
    // Update order values sequentially for enabled sections
    const updatedSections = sections.map(section => {
      if (section.enabled) {
        const newIndex = newEnabledList.findIndex(s => s.id === section.id);
        return { ...section, order: newIndex + 1 };
      }
      return section;
    });
    
    setSections(updatedSections);
  };

  const toggleSectionEnabled = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newEnabled = !section.enabled;
        
        // If enabling a section, give it an order at the end of enabled sections
        if (newEnabled) {
          const maxEnabledOrder = Math.max(
            ...sections.filter(s => s.enabled).map(s => s.order),
            0
          );
          return { ...section, enabled: newEnabled, order: maxEnabledOrder + 1 };
        }
        
        return { ...section, enabled: newEnabled };
      }
      return section;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateSectionOrdering(sections));
    navigate('/preview');
  };

  const handleBack = () => {
    navigate('/optional');
  };

  const getSectionDisplayName = (section: SectionInfo) => {
    if (section.id.startsWith('custom_')) {
      return section.labelKey; // Custom section titles are stored directly
    }
    return t(section.labelKey);
  };

  const enabledSections = sections.filter(section => section.enabled);
  const disabledSections = sections.filter(section => !section.enabled);

  // Debug: Log sections state (uncomment if needed for debugging)
  // useEffect(() => {
  //   console.log('Current sections:', sections.map(s => ({ 
  //     id: s.id, 
  //     enabled: s.enabled, 
  //     order: s.order,
  //     labelKey: s.labelKey 
  //   })));
  // }, [sections]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('ordering.title')}</h2>
        <p className="text-gray-600">
          {t('ordering.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Enabled Sections */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('ordering.enabledSections')} ({enabledSections.length})
          </h3>
          
          <div className="space-y-2">
            {enabledSections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between group hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <span className="bg-blue-600 text-white text-sm font-medium px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">
                      {getSectionDisplayName(section)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Move up button */}
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('ordering.moveUp')}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    
                    {/* Move down button */}
                    <button
                      type="button"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === enabledSections.length - 1}
                      className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('ordering.moveDown')}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    
                    {/* Disable button */}
                    <button
                      type="button"
                      onClick={() => toggleSectionEnabled(section.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-300 hover:border-blue-400"
                    >
                      {t('ordering.disable')}
                    </button>
                  </div>
                </div>
              ))}
          </div>
          
          {enabledSections.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              {t('ordering.noEnabledSections')}
            </div>
          )}
        </div>

        {/* Disabled Sections */}
        {disabledSections.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('ordering.disabledSections')} ({disabledSections.length})
            </h3>
            
            <div className="space-y-2">
              {disabledSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="bg-gray-400 text-white text-sm font-medium px-2 py-1 rounded">
                      —
                    </span>
                    <span className="font-medium text-gray-500">
                      {getSectionDisplayName(section)}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => toggleSectionEnabled(section.id)}
                    className="text-sm text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-300 hover:border-green-400"
                  >
                    {t('ordering.enable')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">{t('ordering.tips.title')}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t('ordering.tips.tip1')}</li>
            <li>• {t('ordering.tips.tip2')}</li>
            <li>• {t('ordering.tips.tip3')}</li>
            <li>• {t('ordering.tips.tip4')}</li>
          </ul>
        </div>

        <div className="flex justify-between mt-8">
          <button 
            type="button" 
            onClick={handleBack}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </button>
          <button 
            type="submit" 
            className="btn-primary flex items-center"
          >
            {t('ordering.previewButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderingForm;
