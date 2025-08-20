import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit, Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PreviewPage: React.FC = () => {
  const resumeData = useAppSelector(state => state.resume);
  const navigate = useNavigate();
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    try {
      // Create canvas from the resume element
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content is longer than one page, we might need to handle multiple pages
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // For longer content, add multiple pages
        let position = 0;
        let remainingHeight = imgHeight;
        
        while (remainingHeight > 0) {
          // const pageHeight = Math.min(pdfHeight, remainingHeight);
          
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            imgData, 
            'PNG', 
            0, 
            -position, 
            imgWidth, 
            imgHeight
          );
          
          position += pdfHeight;
          remainingHeight -= pdfHeight;
        }
      }

      // Download the PDF
      const fileName = resumeData.personalInfo.fullName 
        ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
        : 'My_Resume.pdf';
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    }
  };

  const formatDateRange = (startMonth: string, startYear: string, endMonth: string, endYear: string, isCurrent: boolean) => {
    const start = `${startMonth} ${startYear}`;
    const end = isCurrent ? 'Present' : `${endMonth} ${endYear}`;
    return `${start} - ${end}`;
  };

  const formatEducationDateRange = (startYear: string, endYear: string) => {
    return `${startYear} - ${endYear}`;
  };

  const getSkillLevelWidth = (level: string) => {
    switch (level) {
      case 'Beginner': return 'w-1/4';
      case 'Intermediate': return 'w-2/4';
      case 'Advanced': return 'w-3/4';
      case 'Expert': return 'w-full';
      default: return 'w-2/4';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/optional')}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Resume
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-4xl mx-auto p-8">
        <div 
          ref={resumeRef}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
          style={{ minHeight: '11in' }}
        >
          <div className="p-8">
            {/* Header */}
            <header className="text-center border-b border-gray-200 pb-6 mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {resumeData.personalInfo.fullName || 'Your Name'}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {resumeData.personalInfo.jobTitle}
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
                {resumeData.personalInfo.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {resumeData.personalInfo.email}
                  </div>
                )}
                {resumeData.personalInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {resumeData.personalInfo.phone}
                  </div>
                )}
                {resumeData.personalInfo.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {resumeData.personalInfo.location}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
                {resumeData.personalInfo.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <span className="break-all">{resumeData.personalInfo.website}</span>
                  </div>
                )}
                {resumeData.personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-1" />
                    <span className="break-all">{resumeData.personalInfo.linkedin}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Professional Summary */}
            {resumeData.professionalSummary && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Professional Summary
                </h2>
                <div 
                  className="text-gray-700 prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: resumeData.professionalSummary }}
                  style={{ lineHeight: '1.0' }}
                />
              </section>
            )}

            {/* Work Experience */}
            {resumeData.workExperiences.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Work Experience
                </h2>
                <div className="space-y-6">
                  {resumeData.workExperiences.map((experience) => (
                    <div key={experience.id} className="break-inside-avoid">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {experience.jobTitle}
                          </h3>
                          <p className="text-gray-700 font-medium">
                            {experience.companyName} • {experience.location}
                          </p>
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                          {formatDateRange(
                            experience.startMonth,
                            experience.startYear,
                            experience.endMonth,
                            experience.endYear,
                            experience.isCurrentJob
                          )}
                        </span>
                      </div>
                      {/* Full-width responsibilities with formatting support */}
                      <div className="w-full mt-3">
                        <div 
                          className="text-gray-700 prose prose-sm max-w-none" 
                          dangerouslySetInnerHTML={{ __html: experience.responsibilities }}
                          style={{ lineHeight: '1.0' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Education
                </h2>
                <div className="space-y-4">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {edu.degree} in {edu.major}
                          </h3>
                          <p className="text-gray-700">{edu.schoolName}</p>
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                          {formatEducationDateRange(edu.startYear, edu.endYear)}
                        </span>
                      </div>
                      {edu.additionalInfo && (
                        <p className="text-gray-600 text-sm mt-1">{edu.additionalInfo}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {resumeData.skills.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{skill.name}</span>
                      <div className="flex items-center ml-4">
                        <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className={`h-2 bg-blue-600 rounded-full ${getSkillLevelWidth(skill.level)}`}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-16">{skill.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Optional Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Certificates */}
              {resumeData.optionalSections.certificates.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    Certificates
                  </h2>
                  <div className="space-y-3">
                    {resumeData.optionalSections.certificates.map((cert) => (
                      <div key={cert.id}>
                        <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {cert.issuer} • {cert.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {resumeData.optionalSections.languages.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    Languages
                  </h2>
                  <div className="space-y-2">
                    {resumeData.optionalSections.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between items-center">
                        <span className="text-gray-700">{lang.name}</span>
                        <span className="text-sm text-gray-600">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Hobbies */}
            {resumeData.optionalSections.hobbies && (
              <section className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Hobbies & Interests
                </h2>
                <p className="text-gray-700">{resumeData.optionalSections.hobbies}</p>
              </section>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            🔒 <strong>Privacy Protected:</strong> All your data is processed locally and never stored on our servers. 
            Please save your generated PDF file safely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
