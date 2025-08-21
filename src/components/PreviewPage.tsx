import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { generateDocx } from '../utils/docxGenerator';
import { downloadPlainTextResume } from '../utils/docxGeneratorFallback';


const PreviewPage: React.FC = () => {
  const resumeData = useAppSelector(state => state.resume);
  const navigate = useNavigate();
  const resumeRef = useRef<HTMLDivElement>(null);
  const handleDownloadDocx = async () => {
    try {
      console.log('Resume Data:', resumeData);
      console.log('Starting DOCX download...');
      await generateDocx(resumeData);
      console.log('DOCX download completed');
      // Don't show alert since the file should download automatically
    } catch (error) {
      console.error('Error generating DOCX:', error);
      
      // Detect mobile devices
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      let errorMessage = 'Failed to generate Word document. ';
      
      if (isMobile) {
        errorMessage = '📱 Word download may not work on mobile devices. ';
        errorMessage += 'Please try:\n\n';
        errorMessage += '1. Use the "Download Text" button as an alternative\n';
        errorMessage += '2. Open this page on a desktop/laptop computer\n';
        errorMessage += '3. Email yourself this page link to access on a computer\n\n';
        errorMessage += 'This is due to iOS/Android browser limitations with file downloads.';
      } else {
        if (error instanceof Error) {
          if (error.message.includes('Buffer') || error.message.includes('nodebuffer')) {
            errorMessage += 'Browser compatibility issue. Try using a different browser.';
          } else if (error.message.includes('saveAs')) {
            errorMessage += 'Issue with file download. Please try again.';
          } else if (error.message.includes('platform')) {
            errorMessage += 'Platform compatibility issue.';
          } else {
            errorMessage += `Error: ${error.message}`;
          }
        } else {
          errorMessage += 'Unknown error occurred.';
        }
        errorMessage += '\n\nPlease check the browser console for more details and try again.';
      }
      
      alert(errorMessage);
    }
  };



  const handleDownloadText = async () => {
    try {
      console.log('Downloading plain text resume...');
      downloadPlainTextResume(resumeData);
      console.log('Plain text download completed');
    } catch (error) {
      console.error('Plain text download failed:', error);
      alert(`Plain text download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Mobile Layout: Stack vertically */}
          <div className="flex flex-col space-y-4 sm:hidden">
            <button
              onClick={() => navigate('/optional')}
              className="btn-secondary flex items-center justify-center w-full py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit
            </button>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary flex items-center justify-center w-full py-3"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Resume
              </button>
              <button
                onClick={handleDownloadDocx}
                className="btn-primary flex items-center justify-center w-full py-3"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Word
              </button>
              <button
                onClick={handleDownloadText}
                className="btn-secondary flex items-center justify-center w-full py-3"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Text
              </button>
            </div>
          </div>

          {/* Tablet/Desktop Layout: Horizontal */}
          <div className="hidden sm:flex justify-between items-center">
            <button
              onClick={() => navigate('/optional')}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit
            </button>
            
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Edit Resume</span>
                <span className="md:hidden">Edit</span>
              </button>
              <button
                onClick={handleDownloadDocx}
                className="btn-primary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Download Word</span>
                <span className="md:hidden">Word</span>
              </button>
              <button
                onClick={handleDownloadText}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Download Text</span>
                <span className="md:hidden">Text</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview - Professional DOCX Style */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div 
          ref={resumeRef}
          className="bg-white shadow-lg resume-content docx-style"
          style={{ 
            maxWidth: '100%',
            width: 'min(8.5in, 100vw - 2rem)',
            minHeight: '11in',
            backgroundColor: '#ffffff', 
            color: '#000000',
            margin: '0 auto',
            padding: 'clamp(0.5in, 5vw, 1in)',
            boxSizing: 'border-box',
            fontFamily: 'Times, "Times New Roman", serif',
            fontSize: 'clamp(10pt, 2.5vw, 12pt)',
            lineHeight: '1.15'
          }}
        >
          {/* Header */}
          <header className="text-center mb-6" style={{ paddingBottom: '12pt' }}>
            <h1 style={{ 
              fontSize: 'clamp(16pt, 4vw, 32pt)', 
              fontWeight: 'bold', 
              margin: '0 0 6pt 0',
              color: '#000000'
            }}>
              {resumeData.personalInfo.fullName || 'Your Name'}
            </h1>
            {resumeData.personalInfo.jobTitle && (
              <p style={{ 
                fontSize: 'clamp(12pt, 3vw, 24pt)', 
                margin: '0 0 12pt 0',
                color: '#666666'
              }}>
                {resumeData.personalInfo.jobTitle}
              </p>
            )}
            
            <div style={{ 
              textAlign: 'center', 
              fontSize: '11pt', 
              color: '#333333',
              lineHeight: '1.2'
            }}>
              {(() => {
                const line1: string[] = [];
                const line2: string[] = [];
                const line3: string[] = [];
                const line4: string[] = [];
                
                
                // First line: Email and Phone
                if (resumeData.personalInfo.email) line1.push(`Email: ${resumeData.personalInfo.email}`);
                if (resumeData.personalInfo.phone) line1.push(`Phone: ${resumeData.personalInfo.phone}`);
                
                // Second line: Location, Website, LinkedIn
                if (resumeData.personalInfo.location) line2.push(`Location: ${resumeData.personalInfo.location}`);
                if (resumeData.personalInfo.website) line3.push(`Website: ${resumeData.personalInfo.website}`);
                if (resumeData.personalInfo.linkedin) line4.push(`LinkedIn: ${resumeData.personalInfo.linkedin}`);
                
                return (
                  <div>
                    {line1.length > 0 && (
                      <div style={{ margin: '2pt 0' }}>
                        {line1.join(' • ')}
                      </div>
                    )}
                    {line2.length > 0 && (
                      <div style={{ margin: '2pt 0' }}>
                        {line2.join(' • ')}
                      </div>
                    )}
                    {line3.length > 0 && (
                      <div style={{ margin: '2pt 0' }}>
                        {line3.join(' • ')}
                      </div>
                    )}
                    {line4.length > 0 && (
                      <div style={{ margin: '2pt 0' }}>
                        {line4.join(' • ')}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </header>

          {/* Professional Summary */}
          {resumeData.professionalSummary && (
            <section style={{ marginBottom: '18pt' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                margin: '0 0 6pt 0',
                borderBottom: '1px solid #ccc',
                paddingBottom: '3pt',
                color: '#000000'
              }}>
                Professional Summary
              </h2>
              <div 
                className="html-content"
                style={{ 
                  fontSize: '12pt',
                  lineHeight: '1.15',
                  color: '#333333',
                  margin: '6pt 0'
                }}
                dangerouslySetInnerHTML={{ __html: resumeData.professionalSummary }}
              />
            </section>
          )}

          {/* Work Experience */}
          {resumeData.workExperiences.length > 0 && (
            <section style={{ marginBottom: '18pt' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                margin: '0 0 6pt 0',
                borderBottom: '1px solid #ccc',
                paddingBottom: '3pt',
                color: '#000000'
              }}>
                Work Experience
              </h2>
              <div>
                {resumeData.workExperiences.map((experience, index) => (
                  <div key={experience.id} style={{ 
                    marginBottom: index < resumeData.workExperiences.length - 1 ? '12pt' : '0',
                    pageBreakInside: 'avoid'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '3pt'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '13pt', 
                          fontWeight: 'bold',
                          margin: '0',
                          color: '#000000'
                        }}>
                          {experience.jobTitle}
                        </h3>
                        <p style={{ 
                          fontSize: '12pt',
                          margin: '0',
                          color: '#666666'
                        }}>
                          {experience.companyName} • {experience.location}
                        </p>
                      </div>
                      <span style={{ 
                        fontSize: '11pt',
                        color: '#666666',
                        marginLeft: '12pt',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatDateRange(
                          experience.startMonth,
                          experience.startYear,
                          experience.endMonth,
                          experience.endYear,
                          experience.isCurrentJob
                        )}
                      </span>
                    </div>
                    <div style={{ marginTop: '6pt' }}>
                      <div 
                        className="html-content"
                        style={{ 
                          fontSize: '12pt',
                          lineHeight: '1.15',
                          color: '#333333'
                        }}
                        dangerouslySetInnerHTML={{ __html: experience.responsibilities }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <section style={{ marginBottom: '18pt' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                margin: '0 0 6pt 0',
                borderBottom: '1px solid #ccc',
                paddingBottom: '3pt',
                color: '#000000'
              }}>
                Education
              </h2>
              <div>
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} style={{ 
                    marginBottom: index < resumeData.education.length - 1 ? '9pt' : '0',
                    pageBreakInside: 'avoid'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '3pt'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '13pt', 
                          fontWeight: 'bold',
                          margin: '0',
                          color: '#000000'
                        }}>
                          {edu.degree} in {edu.major}
                        </h3>
                        <p style={{ 
                          fontSize: '12pt',
                          margin: '0',
                          color: '#666666'
                        }}>
                          {edu.schoolName}
                        </p>
                      </div>
                      <span style={{ 
                        fontSize: '11pt',
                        color: '#666666',
                        marginLeft: '12pt',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatEducationDateRange(edu.startYear, edu.endYear)}
                      </span>
                    </div>
                    {edu.additionalInfo && (
                      <div 
                        className="html-content"
                        style={{ 
                          fontSize: '12pt',
                          lineHeight: '1.15',
                          color: '#333333',
                          margin: '3pt 0 0 0'
                        }}
                        dangerouslySetInnerHTML={{ __html: edu.additionalInfo }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <section style={{ marginBottom: '18pt' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                margin: '0 0 6pt 0',
                borderBottom: '1px solid #ccc',
                paddingBottom: '3pt',
                color: '#000000'
              }}>
                Skills
              </h2>
              <div className="overflow-x-auto">
                <table style={{ 
                  width: '100%', 
                  minWidth: '600px',
                  borderCollapse: 'collapse',
                  marginTop: '6pt'
                }}>
                <thead>
                  <tr>
                    <th style={{ 
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#000000',
                      padding: '6pt',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa',
                      textAlign: 'left',
                      width: '30%'
                    }}>
                      Skill
                    </th>
                    <th style={{ 
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#000000',
                      padding: '6pt',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa',
                      textAlign: 'center',
                      width: '6%'
                    }}>
                      Years
                    </th>
                    <th style={{ 
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#000000',
                      padding: '6pt',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa',
                      textAlign: 'center',
                      width: '14%'
                    }}>
                      Level
                    </th>
                    <th style={{ 
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#000000',
                      padding: '6pt',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa',
                      textAlign: 'left',
                      width: '30%'
                    }}>
                      Skill
                    </th>
                    <th style={{ 
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#000000',
                      padding: '6pt',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa',
                      textAlign: 'center',
                      width: '6%'
                    }}>
                      Years
                    </th>
                    <th style={{ 
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: '#000000',
                      padding: '6pt',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa',
                      textAlign: 'center',
                      width: '14%'
                    }}>
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rows = [];
                    for (let i = 0; i < resumeData.skills.length; i += 2) {
                      const skill1 = resumeData.skills[i];
                      const skill2 = resumeData.skills[i + 1];
                      
                      rows.push(
                        <tr key={i}>
                          <td style={{ 
                            fontSize: '12pt',
                            color: '#333333',
                            padding: '6pt',
                            border: '1px solid #ccc',
                            verticalAlign: 'top',
                            width: '30%'
                          }}>
                            {skill1.name}
                          </td>
                          <td style={{ 
                            fontSize: '12pt',
                            color: '#666666',
                            padding: '6pt',
                            border: '1px solid #ccc',
                            verticalAlign: 'top',
                            textAlign: 'center',
                            width: '6%'
                          }}>
                            {skill1.years || '-'}
                          </td>
                          <td style={{ 
                            fontSize: '12pt',
                            color: '#666666',
                            padding: '6pt',
                            border: '1px solid #ccc',
                            verticalAlign: 'top',
                            textAlign: 'center',
                            width: '14%'
                          }}>
                            {skill1.level}
                          </td>
                          <td style={{ 
                            fontSize: '12pt',
                            color: '#333333',
                            padding: '6pt',
                            border: '1px solid #ccc',
                            verticalAlign: 'top',
                            width: '30%'
                          }}>
                            {skill2?.name || ''}
                          </td>
                          <td style={{ 
                            fontSize: '12pt',
                            color: '#666666',
                            padding: '6pt',
                            border: '1px solid #ccc',
                            verticalAlign: 'top',
                            textAlign: 'center',
                            width: '6%'
                          }}>
                            {skill2?.years || (skill2 ? '-' : '')}
                          </td>
                          <td style={{ 
                            fontSize: '12pt',
                            color: '#666666',
                            padding: '6pt',
                            border: '1px solid #ccc',
                            verticalAlign: 'top',
                            textAlign: 'center',
                            width: '14%'
                          }}>
                            {skill2?.level || ''}
                          </td>
                        </tr>
                      );
                    }
                    return rows;
                  })()}
                </tbody>
              </table>
              </div>
            </section>
          )}

          {/* Certificates */}
          {resumeData.optionalSections.certificates.length > 0 && (
            <section style={{ marginBottom: '18pt' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                margin: '0 0 6pt 0',
                borderBottom: '1px solid #ccc',
                paddingBottom: '3pt',
                color: '#000000'
              }}>
                Certificates
              </h2>
              <div>
                {resumeData.optionalSections.certificates.map((cert, index) => (
                  <div key={cert.id} style={{ 
                    marginBottom: index < resumeData.optionalSections.certificates.length - 1 ? '9pt' : '0'
                  }}>
                    <h3 style={{ 
                      fontSize: '13pt', 
                      fontWeight: 'bold',
                      margin: '0',
                      color: '#000000'
                    }}>
                      {cert.name}
                    </h3>
                    <p style={{ 
                      fontSize: '12pt',
                      margin: '0',
                      color: '#666666'
                    }}>
                      {cert.issuer} • {cert.date}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {resumeData.optionalSections.languages.length > 0 && (
            <section style={{ marginBottom: '18pt' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                margin: '0 0 6pt 0',
                borderBottom: '1px solid #ccc',
                paddingBottom: '3pt',
                color: '#000000'
              }}>
                Languages
              </h2>
              <div>
                {resumeData.optionalSections.languages.map((lang, index) => (
                  <div key={lang.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: index < resumeData.optionalSections.languages.length - 1 ? '3pt' : '0'
                  }}>
                    <span style={{ 
                      fontSize: '12pt',
                      color: '#333333'
                    }}>
                      {lang.name}
                    </span>
                    <span style={{ 
                      fontSize: '12pt',
                      color: '#666666'
                    }}>
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hobbies */}
          {resumeData.optionalSections.hobbies && (
            <section style={{ marginBottom: '18pt' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                margin: '0 0 6pt 0',
                borderBottom: '1px solid #ccc',
                paddingBottom: '3pt',
                color: '#000000'
              }}>
                Hobbies & Interests
              </h2>
              <p style={{ 
                fontSize: '12pt',
                lineHeight: '1.15',
                color: '#333333',
                margin: '6pt 0 0 0'
              }}>
                {resumeData.optionalSections.hobbies}
              </p>
            </section>
          )}
        </div>

        {/* Information Cards */}
        <div className="space-y-4 mt-6">
          {/* Document Info */}
          <div className="text-center p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              📄 <strong>Professional Resume Preview:</strong> This preview matches the DOCX format exactly. 
              <span className="hidden sm:inline">The design uses professional Word document styling with Times New Roman font, proper spacing, and standard business formatting.</span>
            </p>
          </div>

          {/* Mobile Device Notice */}
          <div className="text-center p-3 md:p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-xs sm:text-sm text-orange-800">
              <p className="mb-2 sm:mb-0">
                📱 <strong>Mobile Users (iPhone/iPad):</strong> If the Word download doesn't work, try:
              </p>
              <div className="space-y-1 sm:space-y-0 text-left sm:text-center">
                <div>• Use the View option instead of Download, then forward to your computer</div>
                <div>• Use the "Download Text" option as an alternative</div>
                <div>• Open this page on a desktop/laptop computer</div>
                <div>• Email yourself the link to access on a computer</div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              🔒 <strong>Privacy Protected:</strong> All your data is processed locally and never stored on our servers. 
              <span className="hidden sm:inline">Please save your generated document safely.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
