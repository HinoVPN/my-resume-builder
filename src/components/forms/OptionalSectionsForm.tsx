import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { updateOptionalSections } from '../../store/resumeSlice';
import { type Certificate, type Language, LANGUAGE_PROFICIENCY } from '../../types/resume';

const OptionalSectionsForm: React.FC = () => {
  const optionalSections = useAppSelector(state => state.resume.optionalSections);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [hobbies, setHobbies] = useState(optionalSections.hobbies);
  const [certificates, setCertificates] = useState<Certificate[]>(optionalSections.certificates);
  const [languages, setLanguages] = useState<Language[]>(optionalSections.languages);
  
  const [expandedSections, setExpandedSections] = useState({
    hobbies: true,
    certificates: true,
    languages: true
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addCertificate = () => {
    const newCertificate: Certificate = {
      id: generateId(),
      name: '',
      issuer: '',
      date: ''
    };
    setCertificates([...certificates, newCertificate]);
  };

  const removeCertificate = (id: string) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: string) => {
    setCertificates(certificates.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const addLanguage = () => {
    const newLanguage: Language = {
      id: generateId(),
      name: '',
      proficiency: 'Conversational'
    };
    setLanguages([...languages, newLanguage]);
  };

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter(lang => lang.id !== id));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string | Language['proficiency']) => {
    setLanguages(languages.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const optionalSections = {
      hobbies,
      certificates: certificates.filter(cert => cert.name && cert.issuer),
      languages: languages.filter(lang => lang.name)
    };
    
    dispatch(updateOptionalSections(optionalSections));
    navigate('/preview');
  };

  const handleBack = () => {
    navigate('/skills');
  };

  const getProficiencyColor = (proficiency: Language['proficiency']) => {
    switch (proficiency) {
      case 'Basic': return 'bg-red-100 text-red-800';
      case 'Conversational': return 'bg-yellow-100 text-yellow-800';
      case 'Fluent': return 'bg-blue-100 text-blue-800';
      case 'Native': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Optional Sections</h2>
        <p className="text-gray-600">
          Add additional information to make your resume stand out. All sections are optional.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hobbies Section */}
        <div className="border border-gray-200 rounded-lg mb-4">
          <button
            type="button"
            onClick={() => toggleSection('hobbies')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <h3 className="text-lg font-medium text-gray-900">Hobbies & Interests</h3>
            {expandedSections.hobbies ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.hobbies && (
            <div className="p-4 border-t border-gray-200">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hobbies & Interests
                </label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Photography, Hiking, Playing Guitar, Reading, Volunteer Work"
                />
                <div className="mt-2 text-sm text-gray-500">
                  Separate multiple hobbies with commas. Keep it professional and relevant when possible.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Certificates Section */}
        <div className="border border-gray-200 rounded-lg mb-4">
          <button
            type="button"
            onClick={() => toggleSection('certificates')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <h3 className="text-lg font-medium text-gray-900">
              Certificates ({certificates.length})
            </h3>
            {expandedSections.certificates ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.certificates && (
            <div className="p-4 border-t border-gray-200">
              {certificates.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No certificates added yet</p>
                  <button
                    type="button"
                    onClick={addCertificate}
                    className="btn-primary flex items-center mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certificate
                  </button>
                </div>
              ) : (
                <>
                  {certificates.map((certificate, index) => (
                    <div key={certificate.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Certificate #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeCertificate(certificate.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Certificate Name
                          </label>
                          <input
                            type="text"
                            value={certificate.name}
                            onChange={(e) => updateCertificate(certificate.id, 'name', e.target.value)}
                            className="form-input"
                            placeholder="e.g., AWS Certified Solutions Architect"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issuing Organization
                          </label>
                          <input
                            type="text"
                            value={certificate.issuer}
                            onChange={(e) => updateCertificate(certificate.id, 'issuer', e.target.value)}
                            className="form-input"
                            placeholder="e.g., Amazon Web Services"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date Obtained
                        </label>
                        <input
                          type="text"
                          value={certificate.date}
                          onChange={(e) => updateCertificate(certificate.id, 'date', e.target.value)}
                          className="form-input"
                          placeholder="e.g., March 2024, 2024"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={addCertificate}
                      className="btn-secondary flex items-center mx-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Certificate
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Languages Section */}
        <div className="border border-gray-200 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => toggleSection('languages')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <h3 className="text-lg font-medium text-gray-900">
              Languages ({languages.length})
            </h3>
            {expandedSections.languages ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSections.languages && (
            <div className="p-4 border-t border-gray-200">
              {languages.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No languages added yet</p>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="btn-primary flex items-center mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Language
                  </button>
                </div>
              ) : (
                <>
                  {languages.map((language, index) => (
                    <div key={language.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Language #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeLanguage(language.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language
                          </label>
                          <input
                            type="text"
                            value={language.name}
                            onChange={(e) => updateLanguage(language.id, 'name', e.target.value)}
                            className="form-input"
                            placeholder="e.g., Spanish, Mandarin, French"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proficiency Level
                          </label>
                          <select
                            value={language.proficiency}
                            onChange={(e) => updateLanguage(language.id, 'proficiency', e.target.value as Language['proficiency'])}
                            className="form-select"
                          >
                            {LANGUAGE_PROFICIENCY.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(language.proficiency)}`}>
                          {language.proficiency}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="btn-secondary flex items-center mx-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Language
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
            className="btn-primary flex items-center"
          >
            Preview Resume
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default OptionalSectionsForm;
