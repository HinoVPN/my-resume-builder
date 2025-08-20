import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateProfessionalSummary } from '../../store/resumeSlice';
import { Editor } from '@hugerte/hugerte-react';

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
          <div style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
            <Editor
              value={summary}
              onEditorChange={(content) => setSummary(content)}
              init={{
                height: 200,
                menubar: false,
                plugins: [
                  'lists', 'link', 'charmap', 'anchor', 'searchreplace', 'visualblocks',
                  'insertdatetime', 'table', 'help', 'wordcount'
                ],
                toolbar: 'bold italic underline | bullist numlist | undo redo',
                font_family_formats: 'Inter=Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
                font_size_formats: '14px',
                content_style: `
                  body { 
                    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
                    font-size: 14px !important; 
                    line-height: 1.0 !important; 
                    margin: 8px 12px !important;
                    color: #374151 !important;
                    background-color: #ffffff !important;
                  }
                  * {
                    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-size: 14px !important;
                  }
                  p { 
                    margin: 0 !important; 
                    line-height: 1.0 !important;
                    font-family: inherit !important;
                  }
                  ul, ol { 
                    margin: 0 !important; 
                    padding-left: 20px !important; 
                    line-height: 1.0 !important;
                  }
                  li { 
                    margin: 0 !important; 
                    line-height: 1.0 !important;
                  }
                  strong {
                    font-weight: 600 !important;
                    color: #374151 !important;
                  }
                `,
                placeholder: 'Summarize your professional background, core skills, and career objectives. You can use bold, italic, and bullet points.',
                branding: false,
                resize: true,
                statusbar: false
              }}
            />
          </div>
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
