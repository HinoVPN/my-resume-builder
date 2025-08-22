import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addWorkExperience, updateWorkExperience, removeWorkExperience } from '../../store/resumeSlice';
import { type WorkExperience, getLocalizedMonths } from '../../types/resume';
import RichTextEditor from '../common/RichTextEditor';

const WorkExperienceForm: React.FC = () => {
  const workExperiences = useAppSelector(state => state.resume.workExperiences);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [experiences, setExperiences] = useState<WorkExperience[]>(workExperiences);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: generateId(),
      companyName: '',
      jobTitle: '',
      location: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isCurrentJob: false,
      responsibilities: ''
    };
    setExperiences([...experiences, newExperience]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update Redux store with all experiences
    experiences.forEach(exp => {
      const existingExp = workExperiences.find(existing => existing.id === exp.id);
      if (existingExp) {
        dispatch(updateWorkExperience({ id: exp.id, data: exp }));
      } else {
        dispatch(addWorkExperience(exp));
      }
    });
    // Remove experiences that were deleted
    workExperiences.forEach(existing => {
      if (!experiences.find(exp => exp.id === existing.id)) {
        dispatch(removeWorkExperience(existing.id));
      }
    });
    navigate('/education');
  };

  const handleBack = () => {
    navigate('/summary');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
  const localizedMonths = getLocalizedMonths(i18n.language);

  const isFormValid = experiences.length === 0 || experiences.every(exp => 
    exp.companyName && exp.jobTitle && exp.startMonth && exp.startYear && exp.responsibilities &&
    (exp.isCurrentJob || (exp.endMonth && exp.endYear))
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('experience.title')}</h2>
        <p className="text-gray-600">
          {t('experience.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {experiences.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">{t('experience.noExperience')}</p>
            <button
              type="button"
              onClick={addExperience}
              className="btn-primary flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('experience.addButton')}
            </button>
          </div>
        ) : (
          <>
            {experiences.map((experience, index) => (
              <div key={experience.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('experience.experienceNumber', { number: index + 1 })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeExperience(experience.id)}
                    className="btn-danger flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('experience.company')} *
                    </label>
                    <input
                      type="text"
                      value={experience.companyName}
                      onChange={(e) => updateExperience(experience.id, 'companyName', e.target.value)}
                      className="form-input"
                      placeholder={t('experience.placeholders.company')}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('experience.position')} *
                    </label>
                    <input
                      type="text"
                      value={experience.jobTitle}
                      onChange={(e) => updateExperience(experience.id, 'jobTitle', e.target.value)}
                      className="form-input"
                      placeholder={t('experience.placeholders.position')}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('experience.city')}
                  </label>
                  <input
                    type="text"
                    value={experience.location}
                    onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                    className="form-input"
                    placeholder={t('experience.placeholders.city')}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                          {t('experience.employmentPeriod')} *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('experience.startMonth')}</label>
                      <select
                        value={experience.startMonth}
                        onChange={(e) => updateExperience(experience.id, 'startMonth', e.target.value)}
                        className="form-select"
                        required
                      >
                        <option value="">{t('common.select')}</option>
                        {localizedMonths.map((month, index) => (
                          <option key={month} value={getLocalizedMonths('en')[index]}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('experience.startYear')}</label>
                      <select
                        value={experience.startYear}
                        onChange={(e) => updateExperience(experience.id, 'startYear', e.target.value)}
                        className="form-select"
                        required
                      >
                        <option value="">{t('common.select')}</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('experience.endMonth')}</label>
                      <select
                        value={experience.endMonth}
                        onChange={(e) => updateExperience(experience.id, 'endMonth', e.target.value)}
                        className={`form-select ${experience.isCurrentJob ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        required={!experience.isCurrentJob}
                        disabled={experience.isCurrentJob}
                      >
                        <option value="">{t('common.select')}</option>
                        {localizedMonths.map((month, index) => (
                          <option key={month} value={getLocalizedMonths('en')[index]}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('experience.endYear')}</label>
                      <select
                        value={experience.endYear}
                        onChange={(e) => updateExperience(experience.id, 'endYear', e.target.value)}
                        className={`form-select ${experience.isCurrentJob ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        required={!experience.isCurrentJob}
                        disabled={experience.isCurrentJob}
                      >
                        <option value="">{t('common.select')}</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={experience.isCurrentJob}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          console.log('Checkbox clicked:', isChecked, 'for experience:', experience.id);
                          // Update all fields in one operation
                          setExperiences(experiences.map(exp => 
                            exp.id === experience.id 
                              ? { 
                                  ...exp, 
                                  isCurrentJob: isChecked,
                                  endMonth: isChecked ? '' : exp.endMonth,
                                  endYear: isChecked ? '' : exp.endYear
                                }
                              : exp
                          ));
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t('experience.currentJob')}</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('experience.responsibilities')} *
                  </label>
                  <RichTextEditor
                    value={experience.responsibilities}
                    onChange={(content) => updateExperience(experience.id, 'responsibilities', content)}
                    placeholder={t('experience.placeholders.responsibilities')}
                    height={180}
                    required={true}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    <strong>{t('common.tip')}:</strong> {t('experience.tip')}
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={addExperience}
                className="btn-secondary flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('experience.addAnotherButton')}
              </button>
            </div>
          </>
        )}

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
            className={`btn-primary flex items-center ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
          >
            {t('experience.nextButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkExperienceForm;
