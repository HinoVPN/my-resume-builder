import type { ResumeData } from '../types/resume';

export const generatePlainTextResume = (resumeData: ResumeData): string => {
  let content = '';
  
  // Header
  content += `${resumeData.personalInfo.fullName || 'Your Name'}\n`;
  if (resumeData.personalInfo.jobTitle) {
    content += `${resumeData.personalInfo.jobTitle}\n`;
  }
  content += '\n';
  
  // Contact Info
  const contactInfo: string[] = [];
  if (resumeData.personalInfo.email) contactInfo.push(`Email: ${resumeData.personalInfo.email}`);
  if (resumeData.personalInfo.phone) contactInfo.push(`Phone: ${resumeData.personalInfo.phone}`);
  if (resumeData.personalInfo.location) contactInfo.push(`Location: ${resumeData.personalInfo.location}`);
  if (resumeData.personalInfo.website) contactInfo.push(`Website: ${resumeData.personalInfo.website}`);
  if (resumeData.personalInfo.linkedin) contactInfo.push(`LinkedIn: ${resumeData.personalInfo.linkedin}`);
  
  if (contactInfo.length > 0) {
    content += contactInfo.join(' | ') + '\n';
    content += '='.repeat(50) + '\n\n';
  }
  
  // Professional Summary
  if (resumeData.professionalSummary) {
    content += 'PROFESSIONAL SUMMARY\n';
    content += '-'.repeat(20) + '\n';
    const summaryText = resumeData.professionalSummary
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();
    content += summaryText + '\n\n';
  }
  
  // Work Experience
  if (resumeData.workExperiences.length > 0) {
    content += 'WORK EXPERIENCE\n';
    content += '-'.repeat(15) + '\n';
    
    resumeData.workExperiences.forEach((exp) => {
      content += `${exp.jobTitle}\n`;
      content += `${exp.companyName} • ${exp.location}\n`;
      const dateRange = `${exp.startMonth} ${exp.startYear} - ${
        exp.isCurrentJob ? 'Present' : `${exp.endMonth} ${exp.endYear}`
      }`;
      content += `${dateRange}\n`;
      
      if (exp.responsibilities) {
        const respText = exp.responsibilities
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .trim();
        content += `${respText}\n`;
      }
      content += '\n';
    });
  }
  
  // Education
  if (resumeData.education.length > 0) {
    content += 'EDUCATION\n';
    content += '-'.repeat(9) + '\n';
    
    resumeData.education.forEach((edu) => {
      // Handle new education structure
      const degreeText = (() => {
        if (edu.degreeType && edu.fieldOfStudy) {
          let text = `${edu.degreeType} in ${edu.fieldOfStudy}`;
          if (edu.honoursClassification && edu.honoursClassification !== 'None') {
            text += ` with ${edu.honoursClassification}`;
          }
          return text;
        }
        // Fallback for legacy structure
        const degree = (edu as any).degree || edu.educationLevel;
        const major = (edu as any).major || edu.fieldOfStudy;
        return `${degree} in ${major}`;
      })();
      content += `${degreeText}\n`;
      // Handle date range
      const dateRange = (() => {
        if (edu.startMonth && edu.startYear) {
          const start = `${edu.startMonth} ${edu.startYear}`;
          if (edu.isCurrentlyEnrolled) {
            return `${start} - Present`;
          } else if (edu.endMonth && edu.endYear) {
            return `${start} - ${edu.endMonth} ${edu.endYear}`;
          } else {
            return `${edu.startYear} - ${edu.endYear}`;
          }
        }
        return `${edu.startYear} - ${edu.endYear}`;
      })();
      content += `${edu.schoolName} | ${dateRange}\n`;
      
      // Handle description
      const description = edu.description || (edu as any).additionalInfo;
      if (description) {
        content += `${description.replace(/<[^>]*>/g, '')}\n`;
      }
      content += '\n';
    });
  }
  
  // Skills
  if (resumeData.skills.length > 0) {
    content += 'SKILLS\n';
    content += '-'.repeat(6) + '\n';
    
    resumeData.skills.forEach((skill) => {
      const skillText = `${skill.name} (${skill.level})${skill.years ? ` - ${skill.years} years` : ''}`;
      content += `• ${skillText}\n`;
    });
    content += '\n';
  }
  
  // Certificates
  if (resumeData.optionalSections.certificates.length > 0) {
    content += 'CERTIFICATES\n';
    content += '-'.repeat(12) + '\n';
    
    resumeData.optionalSections.certificates.forEach((cert) => {
      content += `${cert.name}\n`;
      content += `${cert.issuer} • ${cert.date}\n\n`;
    });
  }
  
  // Languages
  if (resumeData.optionalSections.languages.length > 0) {
    content += 'LANGUAGES\n';
    content += '-'.repeat(9) + '\n';
    
    resumeData.optionalSections.languages.forEach((lang) => {
      content += `${lang.name} - ${lang.proficiency}\n`;
    });
    content += '\n';
  }
  
  // Hobbies
  if (resumeData.optionalSections.hobbies) {
    content += 'HOBBIES & INTERESTS\n';
    content += '-'.repeat(18) + '\n';
    content += resumeData.optionalSections.hobbies + '\n';
  }
  
  return content;
};

export const downloadPlainTextResume = (resumeData: ResumeData) => {
  try {
    const content = generatePlainTextResume(resumeData);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    const fileName = resumeData.personalInfo.fullName 
      ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.txt`
      : 'My_Resume.txt';
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error generating plain text resume:', error);
    throw error;
  }
};
