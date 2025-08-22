import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addEducation, updateEducation, removeEducation } from '../../store/resumeSlice';
import { 
  type Education, 
  getLocalizedMonths
} from '../../types/resume';
import RichTextEditor from '../common/RichTextEditor';

const EducationForm: React.FC = () => {
  const educationsFromStore = useAppSelector(state => state.resume.education);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [educations, setEducations] = useState<Education[]>(educationsFromStore);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addNewEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      courseOrQualification: '',
      institution: '',
      startYear: '',
      startMonth: '',
      endYear: '',
      endMonth: '',
      isCurrentStudy: false,
      highlights: ''
    };
    setEducations([...educations, newEducation]);
  };

  const removeEducationItem = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const updateEducationField = <K extends keyof Education>(id: string, field: K, value: Education[K]) => {
    setEducations(educations.map(edu => 
      edu.id === id 
        ? { 
            ...edu, 
            [field]: value,
            // Clear end date if currently studying
            ...(field === 'isCurrentStudy' && value === true 
              ? { endMonth: '', endYear: '' } 
              : {})
          } 
        : edu
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update Redux store with all educations
    educations.forEach(edu => {
      const existingEdu = educationsFromStore.find(existing => existing.id === edu.id);
      if (existingEdu) {
        dispatch(updateEducation({ id: edu.id, data: edu }));
      } else {
        dispatch(addEducation(edu));
      }
    });
    // Remove educations that were deleted
    educationsFromStore.forEach(existing => {
      if (!educations.find(edu => edu.id === existing.id)) {
        dispatch(removeEducation(existing.id));
      }
    });
    navigate('/skills');
  };

  const handleBack = () => {
    navigate('/experience');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i + 10).toString()).reverse();
  const localizedMonths = getLocalizedMonths(i18n.language);

  const isFormValid = educations.length === 0 || educations.every(edu => 
    edu.courseOrQualification && edu.institution && edu.startYear && 
    ((edu.isCurrentStudy || false) || edu.endYear) &&
    (edu.isCurrentStudy || edu.endYear)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('education.title')}</h2>
        <p className="text-gray-600">
          {t('education.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {educations.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mb-4">
            <p className="text-gray-500 mb-4">{t('education.noEducation')}</p>
            <button
              type="button"
              onClick={addNewEducation}
              className="btn-primary flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('education.addButton')}
            </button>
          </div>
        )}

        {educations.map((education, index) => (
          <div key={education.id} className="bg-gray-50 p-6 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('education.educationNumber', { number: index + 1 })}
              </h3>
              <button
                type="button"
                onClick={() => removeEducationItem(education.id)}
                className="btn-danger flex items-center text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>


              {/* Course or Qualification */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('education.courseOrQualificationLabel')} *
                </label>
                <input
                  type="text"
                  value={education.courseOrQualification || ''}
                  onChange={(e) => updateEducationField(education.id, 'courseOrQualification', e.target.value)}
                  className="form-input"
                  placeholder={t('education.placeholders.courseOrQualification')}
                  required
                />
              </div>



            {/* Institution */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('education.institutionLabel')} *
              </label>
              <input
                type="text"
                value={education.institution || ''}
                onChange={(e) => updateEducationField(education.id, 'institution', e.target.value)}
                className="form-input"
                placeholder={t('education.placeholders.institution')}
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('education.startDateLabel')} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={education.startMonth}
                    onChange={(e) => updateEducationField(education.id, 'startMonth', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">{t('common.select')}</option>
                    {localizedMonths.map((month, index) => (
                      <option key={month} value={getLocalizedMonths('en')[index]}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={education.startYear}
                    onChange={(e) => updateEducationField(education.id, 'startYear', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">{t('common.select')}</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('education.endDateLabel')} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={education.endMonth}
                    onChange={(e) => updateEducationField(education.id, 'endMonth', e.target.value)}
                    className={`form-select ${education.isCurrentStudy ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required={!education.isCurrentStudy}
                    disabled={education.isCurrentStudy}
                  >
                    <option value="">{t('common.select')}</option>
                    {localizedMonths.map((month, index) => (
                      <option key={month} value={getLocalizedMonths('en')[index]}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={education.endYear}
                    onChange={(e) => updateEducationField(education.id, 'endYear', e.target.value)}
                    className={`form-select ${education.isCurrentStudy ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required={!education.isCurrentStudy}
                    disabled={education.isCurrentStudy}
                  >
                    <option value="">{t('common.select')}</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status Checkbox */}
            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={education.isCurrentStudy || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    console.log('Checkbox clicked:', isChecked, 'for education:', education.id);
                    // Update all fields in one operation
                    setEducations(educations.map(edu => 
                      edu.id === education.id 
                        ? { 
                            ...edu, 
                            isCurrentStudy: isChecked,
                            endMonth: isChecked ? '' : edu.endMonth,
                            endYear: isChecked ? '' : edu.endYear
                          }
                        : edu
                    ));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('education.currentStudyLabel')}</span>
              </label>
            </div>

            {/* Course Highlights */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('education.highlightsLabel')}
              </label>
              <RichTextEditor
                value={education.highlights || ''}
                onChange={(value) => updateEducationField(education.id, 'highlights', value)}
                placeholder={t('education.placeholders.highlights')}
              />
              <div className="mt-2 text-sm text-gray-500">
                <strong>{t('common.tip')}:</strong> {t('education.tips.highlights')}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">{t('common.tip')}:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• {t('education.tips.general')}</p>
                <p>• {t('education.tips.simplified')}</p>
              </div>
            </div>
          </div>
        ))}

        {educations.length > 0 && (
          <button
            type="button"
            onClick={addNewEducation}
            className="btn-secondary flex items-center mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('education.addButton')}
          </button>
        )}

        <div className="flex justify-between">
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
            className={`btn-primary flex items-center ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
          >
            {t('education.nextButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationForm;