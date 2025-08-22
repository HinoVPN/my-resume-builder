import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, LevelFormat, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '../types/resume';
import { createHeading, createParagraphsFromHtml, createInstitutionHeader, createSubHeading, createTwoColumnTable, createWorkExperienceTable } from './docxGeneratorUtils';
import { 
  getLocalizedMonths, 
  getDocumentConfig
} from '../types/resume';
import { COMMON_CONSTANTS } from '../types/commonConstants';

export const createDocument = (resumeData: ResumeData, language: string = 'en') => {
  console.log(`Starting ${language} DOCX generation...`, resumeData);
  
  const config = getDocumentConfig(language);
  const children: (Paragraph | Table)[] = [];

  // Localization helpers
  const localizedMonths = getLocalizedMonths(language);

  const getLocalizedMonth = (englishMonth: string): string => {
    if (language === 'en') return englishMonth;
    const englishMonths = getLocalizedMonths('en');
    const index = englishMonths.indexOf(englishMonth);
    return index !== -1 ? localizedMonths[index] : englishMonth;
  };

  // Removed getLocalizedProficiency function - no longer needed with remark field

  // Header Section - Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resumeData.personalInfo.fullName || config.labels.yourName,
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 100,
      },
    })
  );

  // Job Title
  if (resumeData.personalInfo.jobTitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.jobTitle,
            size: 24,
            color: '000000',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 100,
        },
      })
    );
  }

  // Contact Information
  const contactLines: string[][] = [[], [], [], []];
  
  // Distribute contact info across lines
  if (resumeData.personalInfo.email) contactLines[0].push(`${config.labels.email}${resumeData.personalInfo.email}`);
  if (resumeData.personalInfo.phone) contactLines[0].push(`${config.labels.phone}${resumeData.personalInfo.phone}`);
  if (resumeData.personalInfo.location) contactLines[1].push(`${config.labels.location}${resumeData.personalInfo.location}`);
  if (resumeData.personalInfo.website) contactLines[2].push(`${config.labels.website}${resumeData.personalInfo.website}`);
  if (resumeData.personalInfo.linkedin) contactLines[3].push(`${config.labels.linkedin}${resumeData.personalInfo.linkedin}`);

  // Add contact lines
  contactLines.forEach(line => {
    if (line.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.join(' | '),
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 10,
          },
          border: {
            bottom: {
              color: 'auto',
              space: 1,
              style: BorderStyle.NONE,
              size: 6,
            },
          },
        })
      );
    }
  });

  // Professional Summary
  if (resumeData.professionalSummary) {
    children.push(createHeading(config.labels.professionalSummary));
    const summaryParagraphs = createParagraphsFromHtml(resumeData.professionalSummary || '');
    children.push(...summaryParagraphs);
  }

  // Work Experience
  if (resumeData.workExperiences.length > 0) {
    children.push(createHeading(config.labels.workExperience));

    resumeData.workExperiences.forEach((experience) => {
      // Format date range based on language
      const dateRange = language === COMMON_CONSTANTS.LANGUAGE['ZH-TW'] 
        ? `${experience.startYear}年 ${getLocalizedMonth(experience.startMonth)} - ${
            experience.isCurrentJob ? config.labels.present : `${experience.endYear}年 ${getLocalizedMonth(experience.endMonth)}`
          }`
        : `${getLocalizedMonth(experience.startMonth)} ${experience.startYear} - ${
            experience.isCurrentJob ? config.labels.present : `${getLocalizedMonth(experience.endMonth)} ${experience.endYear}`
          }`;

      // Work Experience Table
      children.push(createWorkExperienceTable(
        experience.jobTitle,
        dateRange,
        experience.companyName,
        experience.location,
      ));

      // Responsibilities
      if (experience.responsibilities) {
        const responsibilityParagraphs = createParagraphsFromHtml(experience.responsibilities || '');
        children.push(...responsibilityParagraphs);
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ text: ' ' })],
        })
      );
    });
  }

  // Education
  if (resumeData.education.length > 0) {
    children.push(createHeading(config.labels.education));

    resumeData.education.forEach((edu) => {
      // Format date range based on language
      const dateRange = (() => {
        if (edu.startMonth && edu.startYear) {
          if (language === COMMON_CONSTANTS.LANGUAGE['ZH-TW']) {
            const start = `${edu.startYear}年 ${getLocalizedMonth(edu.startMonth)}`;
            if (edu.isCurrentStudy) {
              return `${start} - 目前`;
            } else if (edu.endMonth && edu.endYear) {
              return `${start} - ${edu.endYear}年 ${getLocalizedMonth(edu.endMonth)}`;
            }
          } else {
            const start = `${getLocalizedMonth(edu.startMonth)}, ${edu.startYear}`;
            if (edu.isCurrentStudy) {
              return `${start} - Present`;
            } else if (edu.endMonth && edu.endYear) {
              return `${start} - ${getLocalizedMonth(edu.endMonth)}, ${edu.endYear}`;
            }
          }
        }
        // Fallback for legacy structure
        return `${edu.startYear} - ${edu.endYear}`;
      })();

      // Education table
      const educationTable = new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: edu.courseOrQualification,
                        bold: true,
                        size: 22,
                      }),
                    ],
                    spacing: {
                      after: 30,
                    },
                  }),
                ],
                width: {
                  size: 65,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: dateRange,
                        size: 20,
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: {
                      after: 30,
                    },
                  }),
                ],
                width: {
                  size: 35,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: edu.institution || '',
                        bold: false,
                        size: 20,
                      }),
                    ],
                    spacing: {
                      after: 150,
                    },
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
              }),
            ],
          }),
        ],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
      });
      
      children.push(educationTable);
      
      // Course highlights
      const highlights = edu.highlights || '';
      if (highlights) {
        const highlightsParagraphs = createParagraphsFromHtml(highlights || '');
        children.push(...highlightsParagraphs);
      }
    });
  }



  // Skills
  if (resumeData.skills.length > 0) {
    children.push(createHeading(config.labels.skills));

    resumeData.skills.forEach((skill) => {
      // Skill table
      const skillTable = createTwoColumnTable(
        skill.name,
        20,
        skill.years ? `${skill.years} years` : '-',
        20,
        90,
        WidthType.PERCENTAGE,
        10,
        WidthType.PERCENTAGE,
        100,
        WidthType.PERCENTAGE
      );
  
      children.push(skillTable);
    });

  }

  // Optional Sections
  if (resumeData.optionalSections.certificates.length > 0) {
    children.push(createHeading(config.labels.certificates));

    resumeData.optionalSections.certificates.forEach((cert) => {
      children.push(createInstitutionHeader(cert.name, cert.date));
      children.push(createSubHeading(cert.issuer));
    });
  }

  if (resumeData.optionalSections.languages.length > 0) {
    children.push(createHeading(config.labels.languages));

    const languageText = resumeData.optionalSections.languages
      .map(lang => lang.remark 
        ? (language === COMMON_CONSTANTS.LANGUAGE['ZH-TW'] 
           ? `${lang.name}（${lang.remark}）`
           : `${lang.name} (${lang.remark})`)
        : lang.name
      )
      .join(language === COMMON_CONSTANTS.LANGUAGE['ZH-TW'] ? '、' : ', ') + (language === COMMON_CONSTANTS.LANGUAGE['ZH-TW'] ? '' : '.');
    
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: languageText,
            size: 20,
          }),
        ],
        spacing: {
          after: 200,
        },
      })
    );
  }

  if (resumeData.optionalSections.hobbies) {
    children.push(createHeading(config.labels.hobbiesInterests));

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.optionalSections.hobbies,
            size: 20,
          }),
        ],
        spacing: {
          after: 200,
        },
      })
    );
  }

  console.log(`Creating ${language} document with`, children.length, 'elements...');

  // Create the document
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.DECIMAL,
              text: "%1.%2.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
            {
              level: 2,
              format: LevelFormat.DECIMAL,
              text: "%1.%2.%3.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(1.5), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return doc;
};

export const generateDocx = async (resumeData: ResumeData, language: string = 'en') => {
  try {
    const doc = createDocument(resumeData, language);

    console.log('Converting to blob...');
    const blob = await Packer.toBlob(doc);
    
    console.log('Blob created, size:', blob.size);
    
    const fileName = resumeData.personalInfo.fullName 
      ? language === COMMON_CONSTANTS.LANGUAGE['ZH-TW']
        ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_履歷.docx`
        : `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.docx`
      : language === COMMON_CONSTANTS.LANGUAGE['ZH-TW'] ? '我的履歷.docx' : 'My_Resume.docx';
    
    console.log('Downloading file:', fileName);
    
    saveAs(blob, fileName);
    
    console.log(`${language} DOCX generation completed successfully`);
    return true;
  } catch (error) {
    console.error(`Error generating ${language} DOCX:`, error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      browser: navigator.userAgent
    });
    throw error;
  }
};

export const generateDocxBlob = async (resumeData: ResumeData, language: string = 'en'): Promise<Blob> => {
  try {
    const doc = createDocument(resumeData, language);

    console.log('Converting to blob...');
    const blob = await Packer.toBlob(doc);
    
    console.log('Blob created, size:', blob.size);
     
    return blob;
  } catch (error) {
    console.error(`Error generating ${language} DOCX blob:`, error);
    throw error;
  }
};
