import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { addEducation, updateEducation, removeEducation } from '../../store/resumeSlice';
import { type Education, DEGREES } from '../../types/resume';
import RichTextEditor from '../common/RichTextEditor';

const EducationForm: React.FC = () => {
  const educations = useAppSelector(state => state.resume.education);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addNewEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      schoolName: '',
      major: '',
      degree: '',
      startYear: '',
      endYear: '',
      additionalInfo: ''
    };
    dispatch(addEducation(newEducation));
  };

  const removeEducationItem = (id: string) => {
    dispatch(removeEducation(id));
  };

  const updateEducationField = (id: string, field: keyof Education, value: string) => {
    const education = educations.find(edu => edu.id === id);
    if (education) {
      const updatedEducation = { ...education, [field]: value };
      dispatch(updateEducation({ id, data: updatedEducation }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/skills');
  };

  const handleBack = () => {
    navigate('/experience');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i + 10).toString()).reverse();

  const isFormValid = educations.length === 0 || educations.every(edu => 
    edu.schoolName && edu.major && edu.degree && edu.startYear && edu.endYear
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Education</h2>
        <p className="text-gray-600">
          Add your educational background, including degrees, certifications, and relevant coursework.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {educations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No education added yet</p>
            <button
              type="button"
              onClick={addNewEducation}
              className="btn-primary flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </button>
          </div>
        ) : (
          <>
            {educations.map((education, index) => (
              <div key={education.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Education #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeEducationItem(education.id)}
                    className="btn-danger flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    value={education.schoolName}
                    onChange={(e) => updateEducationField(education.id, 'schoolName', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Stanford University"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Major/Field of Study *
                    </label>
                    <input
                      type="text"
                      value={education.major}
                      onChange={(e) => updateEducationField(education.id, 'major', e.target.value)}
                      className="form-input"
                      placeholder="e.g., Computer Science, Business Administration"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Degree *
                    </label>
                    <select
                      value={education.degree}
                      onChange={(e) => updateEducationField(education.id, 'degree', e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Select Degree</option>
                      {DEGREES.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Year *
                    </label>
                    <select
                      value={education.startYear}
                      onChange={(e) => updateEducationField(education.id, 'startYear', e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Year *
                    </label>
                    <select
                      value={education.endYear}
                      onChange={(e) => updateEducationField(education.id, 'endYear', e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information (Optional)
                  </label>
                  <RichTextEditor
                    value={education.additionalInfo || ''}
                    onChange={(content) => updateEducationField(education.id, 'additionalInfo', content)}
                    placeholder="Add additional information such as:&#10;• GPA: 3.8/4.0&#10;• Honors: Summa Cum Laude&#10;• Relevant Coursework: Data Structures, Algorithms&#10;• Awards and Recognition"
                    height={200}
                  />
                </div>
              </div>
            ))}

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={addNewEducation}
                className="btn-secondary flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Education
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
            Back
          </button>
          <button 
            type="submit" 
            className={`btn-primary flex items-center ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
          >
            Next: Skills
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationForm;
