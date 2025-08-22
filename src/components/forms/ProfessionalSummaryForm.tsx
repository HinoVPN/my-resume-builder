import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateProfessionalSummary } from '../../store/resumeSlice';
import RichTextEditor from '../common/RichTextEditor';

const ProfessionalSummaryForm: React.FC = () => {
  const professionalSummary = useAppSelector(state => state.resume.professionalSummary);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [summary, setSummary] = useState(professionalSummary);

  useEffect(() => {
    setSummary(professionalSummary);
  }, [professionalSummary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfessionalSummary(summary));
    navigate('/experience');
  };

  const handleBack = () => {
    dispatch(updateProfessionalSummary(summary));
    navigate('/');
  };

  // Professional Summary is now optional
  const isFormValid = true;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('summary.title')} ({t('common.optional')})</h2>
        <p className="text-gray-600">
          {t('summary.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('summary.title')}
          </label>
          <RichTextEditor
            value={summary}
            onChange={(content) => setSummary(content)}
            placeholder={t('summary.placeholder')}
            height={200}
          />
          <div className="mt-2 text-sm text-gray-500">
            <strong>{t('common.tip')}:</strong> {t('summary.tip')}
          </div>
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
            className={`btn-primary flex items-center ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
          >
            {t('summary.nextButton')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalSummaryForm;
