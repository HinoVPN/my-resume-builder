import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateProfessionalSummary } from '../../store/resumeSlice';
import RichTextEditor from '../common/RichTextEditor';

const ProfessionalSummaryForm: React.FC = () => {
  const professionalSummary = useAppSelector(state => state.resume.professionalSummary);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary (Optional)</h2>
        <p className="text-gray-600">
          Your "elevator pitch" - convince employers to keep reading. You can use formatting like <strong>bold</strong>, <em>italics</em>, and bullet points.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professional Summary
          </label>
          <RichTextEditor
            value={summary}
            onChange={(content) => setSummary(content)}
            placeholder="Summarize your professional background, core skills, and career objectives. You can use bold, italic, and bullet points."
            height={200}
          />
          <div className="mt-2 text-sm text-gray-500">
            <strong>Tip:</strong> Use formatting to highlight key achievements. Numbers and metrics make your summary more compelling.
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button 
            type="button" 
            onClick={handleBack}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button 
            type="submit" 
            className={`btn-primary flex items-center ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
          >
            Next: Work Experience
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalSummaryForm;
