import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updatePersonalInfo } from '../../store/resumeSlice';
import { type PersonalInfo } from '../../types/resume';

const PersonalInfoForm: React.FC = () => {
  const personalInfo = useAppSelector(state => state.resume.personalInfo);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PersonalInfo>(personalInfo);

  useEffect(() => {
    setFormData(personalInfo);
  }, [personalInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updatePersonalInfo(formData));
    navigate('/summary');
  };

  const isFormValid = formData.fullName && formData.email && formData.phone && formData.location;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('personalInfo.title')}</h2>
        <p className="text-gray-600">{t('personalInfo.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            {t('personalInfo.fullName')} *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="form-input"
            placeholder={t('personalInfo.placeholders.fullName')}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            {t('personalInfo.jobTitle')}
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="form-input"
            placeholder={t('personalInfo.placeholders.jobTitle')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('personalInfo.email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder={t('personalInfo.placeholders.email')}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              {t('personalInfo.phone')} *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder={t('personalInfo.placeholders.phone')}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            {t('personalInfo.location')} *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
            placeholder={t('personalInfo.placeholders.location')}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              {t('personalInfo.website')}
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="form-input"
              placeholder={t('personalInfo.placeholders.website')}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              {t('personalInfo.linkedin')}
            </label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="form-input"
              placeholder={t('personalInfo.placeholders.linkedin')}
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <div></div> {/* Empty div for spacing */}
          <button 
            type="submit" 
            className={`btn-primary flex items-center ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
          >
            {t('personalInfo.nextButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
