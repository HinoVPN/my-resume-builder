import { jsPDF } from 'jspdf';
import type { ResumeData } from '../types/resume';

// PDF dimensions in mm (A4)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// Font sizes
const FONT_SIZES = {
  name: 20,
  title: 14,
  contact: 10,
  heading: 16,
  subheading: 12,
  body: 10,
  small: 9
};

// Helper function to clean HTML content
const cleanHtmlContent = (html: string): string => {
  if (!html) return '';
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper function to parse HTML and extract bullet points
const parseHtmlToBullets = (html: string): string[] => {
  if (!html) return [];
  
  const bullets: string[] = [];
  
  // Split by list items
  const listItems = html.split(/<li[^>]*>/gi);
  
  for (let i = 1; i < listItems.length; i++) {
    const item = listItems[i];
    const endIndex = item.indexOf('</li>');
    const content = endIndex !== -1 ? item.substring(0, endIndex) : item;
    const cleanContent = cleanHtmlContent(content);
    
    if (cleanContent) {
      bullets.push(cleanContent);
    }
  }
  
  // If no list items found, try to split by line breaks or paragraphs
  if (bullets.length === 0) {
    const cleanText = cleanHtmlContent(html);
    if (cleanText) {
      // Split by common bullet indicators or line breaks
      const lines = cleanText.split(/[•\-\*]\s*|[\n\r]+/).filter(line => line.trim());
      bullets.push(...lines);
    }
  }
  
  return bullets;
};

// Helper function to split text into lines that fit within width
const splitTextToFit = (pdf: jsPDF, text: string, maxWidth: number, fontSize: number): string[] => {
  pdf.setFontSize(fontSize);
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, split it
        lines.push(word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Helper function to add a section heading
const addSectionHeading = (pdf: jsPDF, text: string, yPosition: number): number => {
  pdf.setFontSize(FONT_SIZES.heading);
  pdf.setFont('helvetica', 'bold');
  pdf.text(text, MARGIN, yPosition);
  
  // Add underline
  const textWidth = pdf.getTextWidth(text);
  pdf.line(MARGIN, yPosition + 2, MARGIN + textWidth, yPosition + 2);
  
  return yPosition + 10;
};

// Helper function to check if we need a new page
const checkPageBreak = (pdf: jsPDF, currentY: number, neededSpace: number): number => {
  if (currentY + neededSpace > PAGE_HEIGHT - MARGIN) {
    pdf.addPage();
    return MARGIN + 10;
  }
  return currentY;
};

export const generatePdf = async (resumeData: ResumeData, language: 'en' | 'zh-TW' = 'en') => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let yPosition = MARGIN + 10;

  // Helper function to get localized month (for Chinese version)
  const getLocalizedMonth = (englishMonth: string): string => {
    if (language === 'zh-TW') {
      const monthMap: { [key: string]: string } = {
        'January': '1月', 'February': '2月', 'March': '3月', 'April': '4月',
        'May': '5月', 'June': '6月', 'July': '7月', 'August': '8月',
        'September': '9月', 'October': '10月', 'November': '11月', 'December': '12月'
      };
      return monthMap[englishMonth] || englishMonth;
    }
    return englishMonth;
  };

  // Header Section - Name
  pdf.setFontSize(FONT_SIZES.name);
  pdf.setFont('helvetica', 'bold');
  const name = resumeData.personalInfo.fullName || 'Your Name';
  const nameWidth = pdf.getTextWidth(name);
  pdf.text(name, (PAGE_WIDTH - nameWidth) / 2, yPosition);
  yPosition += 8;

  // Job Title
  if (resumeData.personalInfo.jobTitle) {
    pdf.setFontSize(FONT_SIZES.title);
    pdf.setFont('helvetica', 'normal');
    const jobTitle = resumeData.personalInfo.jobTitle;
    const jobTitleWidth = pdf.getTextWidth(jobTitle);
    pdf.text(jobTitle, (PAGE_WIDTH - jobTitleWidth) / 2, yPosition);
    yPosition += 8;
  }

  // Contact Information
  pdf.setFontSize(FONT_SIZES.contact);
  pdf.setFont('helvetica', 'normal');
  
  const contactInfo: string[] = [];
  if (resumeData.personalInfo.email) contactInfo.push(`Email: ${resumeData.personalInfo.email}`);
  if (resumeData.personalInfo.phone) contactInfo.push(`Phone: ${resumeData.personalInfo.phone}`);
  if (resumeData.personalInfo.location) contactInfo.push(`Location: ${resumeData.personalInfo.location}`);
  if (resumeData.personalInfo.website) contactInfo.push(`Website: ${resumeData.personalInfo.website}`);
  if (resumeData.personalInfo.linkedin) contactInfo.push(`LinkedIn: ${resumeData.personalInfo.linkedin}`);

  for (const info of contactInfo) {
    const infoWidth = pdf.getTextWidth(info);
    pdf.text(info, (PAGE_WIDTH - infoWidth) / 2, yPosition);
    yPosition += 4;
  }

  yPosition += 5;

  // Professional Summary
  if (resumeData.professionalSummary) {
    yPosition = checkPageBreak(pdf, yPosition, 20);
    yPosition = addSectionHeading(pdf, language === 'zh-TW' ? '專業摘要' : 'Professional Summary', yPosition);
    
    const summaryText = cleanHtmlContent(resumeData.professionalSummary);
    const summaryLines = splitTextToFit(pdf, summaryText, CONTENT_WIDTH, FONT_SIZES.body);
    
    pdf.setFontSize(FONT_SIZES.body);
    pdf.setFont('helvetica', 'normal');
    
    for (const line of summaryLines) {
      yPosition = checkPageBreak(pdf, yPosition, 5);
      pdf.text(line, MARGIN, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  // Work Experience
  if (resumeData.workExperiences.length > 0) {
    yPosition = checkPageBreak(pdf, yPosition, 20);
    yPosition = addSectionHeading(pdf, language === 'zh-TW' ? '工作經驗' : 'Work Experience', yPosition);

    for (const experience of resumeData.workExperiences) {
      yPosition = checkPageBreak(pdf, yPosition, 25);
      
      // Job Title and Date
      pdf.setFontSize(FONT_SIZES.subheading);
      pdf.setFont('helvetica', 'bold');
      
      const dateRange = `${getLocalizedMonth(experience.startMonth)} ${experience.startYear} - ${
        experience.isCurrentJob 
          ? (language === 'zh-TW' ? '至今' : 'Present') 
          : `${getLocalizedMonth(experience.endMonth)} ${experience.endYear}`
      }`;
      
      pdf.text(experience.jobTitle, MARGIN, yPosition);
      const dateWidth = pdf.getTextWidth(dateRange);
      pdf.text(dateRange, PAGE_WIDTH - MARGIN - dateWidth, yPosition);
      yPosition += 5;
      
      // Company and Location
      pdf.setFontSize(FONT_SIZES.body);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${experience.companyName} • ${experience.location}`, MARGIN, yPosition);
      yPosition += 6;
      
      // Responsibilities
      if (experience.responsibilities) {
        const bullets = parseHtmlToBullets(experience.responsibilities);
        for (const bullet of bullets) {
          yPosition = checkPageBreak(pdf, yPosition, 8);
          pdf.text('•', MARGIN, yPosition);
          
          const bulletLines = splitTextToFit(pdf, bullet, CONTENT_WIDTH - 10, FONT_SIZES.body);
          for (let i = 0; i < bulletLines.length; i++) {
            if (i > 0) {
              yPosition = checkPageBreak(pdf, yPosition, 5);
            }
            pdf.text(bulletLines[i], MARGIN + 6, yPosition);
            if (i < bulletLines.length - 1) yPosition += 4;
          }
          yPosition += 5;
        }
      }
      yPosition += 3;
    }
  }

  // Education
  if (resumeData.education.length > 0) {
    yPosition = checkPageBreak(pdf, yPosition, 20);
    yPosition = addSectionHeading(pdf, language === 'zh-TW' ? '教育背景' : 'Education', yPosition);

    for (const edu of resumeData.education) {
      yPosition = checkPageBreak(pdf, yPosition, 20);
      
      // Course/Degree and Date
      pdf.setFontSize(FONT_SIZES.subheading);
      pdf.setFont('helvetica', 'bold');
      
      const courseText = edu.courseOrQualification || 
        (edu.degreeType && edu.fieldOfStudy ? `${edu.degreeType} in ${edu.fieldOfStudy}` : '') ||
        `${(edu as any).degree || edu.educationLevel} in ${(edu as any).major || edu.fieldOfStudy}`;
      
      const dateRange = (() => {
        if (edu.startMonth && edu.startYear) {
          const start = `${getLocalizedMonth(edu.startMonth)}, ${edu.startYear}`;
          if (edu.isCurrentlyEnrolled) {
            return `${start} - ${language === 'zh-TW' ? '至今' : 'Present'}`;
          } else if (edu.endMonth && edu.endYear) {
            return `${start} - ${getLocalizedMonth(edu.endMonth)}, ${edu.endYear}`;
          }
        }
        return `${edu.startYear} - ${edu.endYear}`;
      })();
      
      pdf.text(courseText, MARGIN, yPosition);
      const eduDateWidth = pdf.getTextWidth(dateRange);
      pdf.text(dateRange, PAGE_WIDTH - MARGIN - eduDateWidth, yPosition);
      yPosition += 5;
      
      // Institution
      pdf.setFontSize(FONT_SIZES.body);
      pdf.setFont('helvetica', 'normal');
      pdf.text(edu.institution || edu.schoolName || '', MARGIN, yPosition);
      yPosition += 6;
      
      // Highlights
      const highlights = edu.highlights || edu.description || (edu as any).additionalInfo;
      if (highlights) {
        const bullets = parseHtmlToBullets(highlights);
        for (const bullet of bullets) {
          yPosition = checkPageBreak(pdf, yPosition, 8);
          pdf.text('•', MARGIN, yPosition);
          
          const bulletLines = splitTextToFit(pdf, bullet, CONTENT_WIDTH - 10, FONT_SIZES.body);
          for (let i = 0; i < bulletLines.length; i++) {
            if (i > 0) {
              yPosition = checkPageBreak(pdf, yPosition, 5);
            }
            pdf.text(bulletLines[i], MARGIN + 6, yPosition);
            if (i < bulletLines.length - 1) yPosition += 4;
          }
          yPosition += 5;
        }
      }
      yPosition += 3;
    }
  }

  // Skills
  if (resumeData.skills.length > 0) {
    yPosition = checkPageBreak(pdf, yPosition, 30);
    yPosition = addSectionHeading(pdf, language === 'zh-TW' ? '技能' : 'Skills', yPosition);

    pdf.setFontSize(FONT_SIZES.body);
    pdf.setFont('helvetica', 'normal');

    // Create skills table
    const skillsPerRow = 2;
    const colWidth = CONTENT_WIDTH / skillsPerRow;
    
    for (let i = 0; i < resumeData.skills.length; i += skillsPerRow) {
      yPosition = checkPageBreak(pdf, yPosition, 8);
      
      for (let j = 0; j < skillsPerRow && i + j < resumeData.skills.length; j++) {
        const skill = resumeData.skills[i + j];
        const x = MARGIN + j * colWidth;
        const skillText = `${skill.name} (${skill.years ? skill.years + ' years' : ''} - ${skill.level})`;
        pdf.text(skillText, x, yPosition);
      }
      yPosition += 6;
    }
    yPosition += 3;
  }

  // Optional Sections
  if (resumeData.optionalSections.certificates.length > 0) {
    yPosition = checkPageBreak(pdf, yPosition, 20);
    yPosition = addSectionHeading(pdf, language === 'zh-TW' ? '證書' : 'Certificates', yPosition);

    pdf.setFontSize(FONT_SIZES.body);
    pdf.setFont('helvetica', 'normal');

    for (const cert of resumeData.optionalSections.certificates) {
      yPosition = checkPageBreak(pdf, yPosition, 8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cert.name, MARGIN, yPosition);
      const certDateWidth = pdf.getTextWidth(cert.date);
      pdf.text(cert.date, PAGE_WIDTH - MARGIN - certDateWidth, yPosition);
      yPosition += 4;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(cert.issuer, MARGIN, yPosition);
      yPosition += 8;
    }
  }

  if (resumeData.optionalSections.languages.length > 0) {
    yPosition = checkPageBreak(pdf, yPosition, 15);
    yPosition = addSectionHeading(pdf, language === 'zh-TW' ? '語言能力' : 'Languages', yPosition);

    pdf.setFontSize(FONT_SIZES.body);
    pdf.setFont('helvetica', 'normal');

    const languageText = resumeData.optionalSections.languages
      .map(lang => `${lang.name} (${lang.proficiency})`)
      .join(', ');
    
    const languageLines = splitTextToFit(pdf, languageText, CONTENT_WIDTH, FONT_SIZES.body);
    for (const line of languageLines) {
      yPosition = checkPageBreak(pdf, yPosition, 5);
      pdf.text(line, MARGIN, yPosition);
      yPosition += 5;
    }
    yPosition += 5;
  }

  if (resumeData.optionalSections.hobbies) {
    yPosition = checkPageBreak(pdf, yPosition, 15);
    yPosition = addSectionHeading(pdf, language === 'zh-TW' ? '興趣愛好' : 'Hobbies & Interests', yPosition);

    pdf.setFontSize(FONT_SIZES.body);
    pdf.setFont('helvetica', 'normal');

    const hobbiesLines = splitTextToFit(pdf, resumeData.optionalSections.hobbies, CONTENT_WIDTH, FONT_SIZES.body);
    for (const line of hobbiesLines) {
      yPosition = checkPageBreak(pdf, yPosition, 5);
      pdf.text(line, MARGIN, yPosition);
      yPosition += 5;
    }
  }

  // Generate filename and save
  const fileName = resumeData.personalInfo.fullName 
    ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
    : 'My_Resume.pdf';

  pdf.save(fileName);
  
  return true;
};
