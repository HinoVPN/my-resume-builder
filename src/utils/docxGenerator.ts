import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, TabStopPosition, TabStopType, LevelFormat, convertInchesToTwip } from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '../types/resume';
// Note: For English version, we don't need localization functions but keep imports for consistency

// Enhanced HTML parser for complex TinyMCE content
const parseHtmlContent = (html: string): Array<{content: string, type: 'paragraph' | 'bullet' | 'numbered', level: number, alignment?: string, formatting?: Array<{text: string, bold?: boolean, italic?: boolean, underline?: boolean}>}> => {
  if (!html) return [];
  console.log('HTML:', html);
  
  const result: Array<{content: string, type: 'paragraph' | 'bullet' | 'numbered', level: number, alignment?: string, formatting?: Array<{text: string, bold?: boolean, italic?: boolean, underline?: boolean}>}> = [];
  
  // Split by major block elements but keep them
  const blocks = html.split(/(<\/?(?:p|li|ul|ol)[^>]*>)/gi);
  
  let currentListType: 'bullet' | 'numbered' | null = null;
  let listLevel = 0;
  const listStack: Array<'bullet' | 'numbered'> = [];
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;
    
    // Check for list start tags
    if (/<ul[^>]*>/gi.test(block)) {
      listStack.push('bullet');
      currentListType = 'bullet';
      listLevel++;
      continue;
    }
    
    if (/<ol[^>]*>/gi.test(block)) {
      listStack.push('numbered');
      currentListType = 'numbered';
      listLevel++;
      continue;
    }
    
    // Check for list end tags
    if (/<\/ul>/gi.test(block)) {
      listStack.pop();
      listLevel = Math.max(0, listLevel - 1);
      currentListType = listStack.length > 0 ? listStack[listStack.length - 1] : null;
      continue;
    }
    
    if (/<\/ol>/gi.test(block)) {
      listStack.pop();
      listLevel = Math.max(0, listLevel - 1);
      currentListType = listStack.length > 0 ? listStack[listStack.length - 1] : null;
      continue;
    }
    
    // Process list items
    if (/<li[^>]*>/gi.test(block)) {
      // Get the content until the next tag or end
      let content = '';
      let j = i + 1;
      while (j < blocks.length && !/<\/?(?:li|ul|ol|p)[^>]*>/gi.test(blocks[j])) {
        content += blocks[j];
        j++;
      }
      
      // Parse content with formatting
      const formattedContent = parseHtmlWithFormatting(content);
      if (formattedContent.length > 0) {
        // Join all formatted parts into a single content string for now
        // We'll enhance this further to support mixed formatting
        const cleanContent = formattedContent.map(part => part.text).join('');
        if (cleanContent) {
          result.push({
            content: cleanContent,
            type: currentListType || 'bullet',
            level: Math.max(0, listLevel - 1),
            formatting: formattedContent
          });
        }
      }
      i = j - 1;
      continue;
    }
    
    // Process paragraphs
    if (/<p[^>]*>/gi.test(block)) {
      // Extract alignment from style
      const alignmentMatch = block.match(/text-align:\s*(left|center|right|justify)/i);
      const alignment = alignmentMatch ? alignmentMatch[1].toLowerCase() : 'left';
      
      // Get the content until the next tag
      let content = '';
      let j = i + 1;
      while (j < blocks.length && !/<\/?(?:p|li|ul|ol)[^>]*>/gi.test(blocks[j])) {
        content += blocks[j];
        j++;
      }
      
      // Parse content with formatting
      const formattedContent = parseHtmlWithFormatting(content);
      if (formattedContent.length > 0) {
        const cleanContent = formattedContent.map(part => part.text).join('');
        if (cleanContent && cleanContent !== '&nbsp;') {
          result.push({
            content: cleanContent,
            type: 'paragraph',
            level: 0,
            alignment: alignment,
            formatting: formattedContent
          });
        }
      }
      i = j - 1;
      continue;
    }
    
    // Handle standalone content (not in tags)
    if (!/<[^>]*>/g.test(block)) {
      const cleanContent = cleanHtmlContent(block);
      if (cleanContent) {
        result.push({
          content: cleanContent,
          type: 'paragraph',
          level: 0
        });
      }
    }
  }
  
  return result;
};

// Enhanced function to parse HTML content with formatting
const parseHtmlWithFormatting = (content: string): Array<{text: string, bold?: boolean, italic?: boolean, underline?: boolean}> => {
  if (!content) return [];
  
  const result: Array<{text: string, bold?: boolean, italic?: boolean, underline?: boolean}> = [];
  
  // Split content by formatting tags while keeping the tags
  const parts = content.split(/(<\/?(?:strong|b|em|i|u|span)[^>]*>)/gi);
  
  let currentBold = false;
  let currentItalic = false;
  let currentUnderline = false;
  
  for (const part of parts) {
    if (/<strong[^>]*>|<b[^>]*>/gi.test(part)) {
      currentBold = true;
    } else if (/<\/strong>|<\/b>/gi.test(part)) {
      currentBold = false;
    } else if (/<em[^>]*>|<i[^>]*>/gi.test(part)) {
      currentItalic = true;
    } else if (/<\/em>|<\/i>/gi.test(part)) {
      currentItalic = false;
    } else if (/<span[^>]*text-decoration:\s*underline[^>]*>|<u[^>]*>/gi.test(part)) {
      currentUnderline = true;
    } else if (/<\/span>|<\/u>/gi.test(part)) {
      // Only reset underline if this span was for underline
      if (/<\/u>/gi.test(part) || (/<\/span>/gi.test(part) && currentUnderline)) {
        currentUnderline = false;
      }
    } else if (!/<[^>]*>/g.test(part)) {
      // This is actual text content
      const cleanText = part
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      
      if (cleanText) {
        result.push({
          text: cleanText,
          bold: currentBold,
          italic: currentItalic,
          underline: currentUnderline
        });
      }
    }
  }
  
  return result;
};

// Helper function to clean HTML content while preserving formatting context
const cleanHtmlContent = (content: string): string => {
  if (!content) return '';
  
  return String(content)
    // Remove HTML tags but keep content
    .replace(/<[^>]*>/g, '')
    
    // Convert HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};


// Helper function to create institution header with tab stops like the reference
const createInstitutionHeader = (institutionName: string, dateText: string): Paragraph => {
  return new Paragraph({
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX
      }
    ],
    children: [
      new TextRun({
        text: institutionName,
        bold: true,
        size: 22,
      }),
      new TextRun({
        text: `\t${dateText}`,
        bold: true,
        size: 22,
      })
    ],
    spacing: {
      before: 200,
      after: 30,
    },
  });
};

const createLanguageHeader = (languageName: string, proficiency: string): Paragraph => {
  return new Paragraph({
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX
      }
    ],
    children: [
      new TextRun({
        text: languageName,
        bold: true,
        size: 22,
      }),
      new TextRun({
        text: `\t${proficiency}`,
        bold: true,
        size: 22,
      })
    ],
    spacing: {
      after: 30,
    },
  });
};

// Helper function to create role text
const createSubHeading = (text: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: 20,
      })
    ],
    spacing: {
      after: 100,
    },
  });
};


// Helper function to create headings with thematic break
const createHeading = (text: string): Paragraph => {
  return new Paragraph({
    children: [
            new TextRun({
              text: text,
              bold: true,
              size: 28,
              color: '000000',
            }),
          ],
    heading: HeadingLevel.HEADING_1,
    thematicBreak: true,
    spacing: {
      before: 300,
      after: 200,
    },
  });
};

// Enhanced function to convert parsed HTML content to Word paragraphs
const createParagraphsFromHtml = (html: string): Paragraph[] => {
  const parsedContent = parseHtmlContent(html);
  const paragraphs: Paragraph[] = [];
  
  parsedContent.forEach(item => {
    if (item.type === 'paragraph') {
      // Convert alignment
      let alignment;
      switch (item.alignment) {
        case 'center':
          alignment = AlignmentType.CENTER;
          break;
        case 'right':
          alignment = AlignmentType.RIGHT;
          break;
        case 'justify':
          alignment = AlignmentType.JUSTIFIED;
          break;
        default:
          alignment = AlignmentType.LEFT;
      }
      
      // Create TextRuns with formatting
      const textRuns: TextRun[] = [];
      if (item.formatting && item.formatting.length > 0) {
        item.formatting.forEach(formatPart => {
          textRuns.push(
            new TextRun({
              text: formatPart.text,
              bold: formatPart.bold,
              italics: formatPart.italic,
              underline: formatPart.underline ? {} : undefined,
              size: 20,
            })
          );
        });
      } else {
        // Fallback to simple text run
        textRuns.push(
          new TextRun({
            text: item.content,
            size: 20,
          })
        );
      }
      
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          alignment: alignment,
          spacing: {
            after: 100,
          },
        })
      );
    } else if (item.type === 'bullet' || item.type === 'numbered') {
      // Create bullet or numbered list with proper level and formatting
      const textRuns: TextRun[] = [];
      if (item.formatting && item.formatting.length > 0) {
        item.formatting.forEach(formatPart => {
          textRuns.push(
            new TextRun({
              text: formatPart.text,
              bold: formatPart.bold,
              italics: formatPart.italic,
              underline: formatPart.underline ? {} : undefined,
              size: 20,
            })
          );
        });
      } else {
        textRuns.push(
          new TextRun({
            text: item.content,
            size: 20,
          })
        );
      }
      
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          bullet: item.type === 'bullet' ? {
            level: item.level
          } : undefined,
          numbering: item.type === 'numbered' ? {
            reference: "default-numbering",
            level: item.level
          } : undefined,
          spacing: {
            after: 50,
          },
        })
      );
    }
  });
  
  return paragraphs;
};

const createDocument = (resumeData: ResumeData) => {
  console.log('Starting DOCX generation...', resumeData);
    
    // Create sections array for the document
    const children: (Paragraph | Table)[] = [];

    // Helper function to get localized month (for English, returns as-is)
    const getLocalizedMonth = (englishMonth: string): string => {
      return englishMonth; // For English version, keep months as-is
    };

    // Header Section
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.fullName || 'Your Name',
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

    // Add first line if it has content
    if (line1.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line1.join(' • '),
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 10,
          },
        })
      );
    }

    // Add second line if it has content
    if (line2.length > 0) {
      children.push(
        new Paragraph({ 
          children: [
            new TextRun({
              text: line2.join(' • '),
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

        // Add second line if it has content
    if (line3.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line3.join(' • '),
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

        // Add second line if it has content
    if (line4.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line4.join(' • '),
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

    // Professional Summary
    if (resumeData.professionalSummary) {
      children.push(createHeading('Professional Summary'));

      // Use enhanced HTML parsing
      const summaryParagraphs = createParagraphsFromHtml(resumeData.professionalSummary || '');
      children.push(...summaryParagraphs);
    }

        // Work Experience
    if (resumeData.workExperiences.length > 0) {
      children.push(createHeading('Work Experience'));

      resumeData.workExperiences.forEach((experience) => {
        // Company and Date using tab stops like the reference
        const dateRange = `${getLocalizedMonth(experience.startMonth)} ${experience.startYear} - ${
          experience.isCurrentJob ? 'Present' : `${getLocalizedMonth(experience.endMonth)} ${experience.endYear}`
        }`;

        // Work experience entry using table format for proper alignment
        const workExperienceTable = new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: experience.jobTitle,
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
                          text: `${experience.companyName} • ${experience.location}`,
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
        
        children.push(workExperienceTable);
        
        // Responsibilities using enhanced HTML parsing
        if (experience.responsibilities) {
          const responsibilityParagraphs = createParagraphsFromHtml(experience.responsibilities || '');
          children.push(...responsibilityParagraphs);
        }
      });
    }

    // Education
    if (resumeData.education.length > 0) {
      children.push(createHeading('Education'));

      resumeData.education.forEach((edu) => {
        // School and Date using tab stops
        const dateRange = (() => {
          if (edu.startMonth && edu.startYear) {
            const start = `${getLocalizedMonth(edu.startMonth)}, ${edu.startYear}`;
            if (edu.isCurrentlyEnrolled) {
              return `${start} - Present`;
            } else if (edu.endMonth && edu.endYear) {
              return `${start} - ${getLocalizedMonth(edu.endMonth)}, ${edu.endYear}`;
            } else {
              // Fallback for legacy structure
              return `${edu.startYear} - ${edu.endYear}`;
            }
          }
          // Fallback for legacy structure
          return `${edu.startYear} - ${edu.endYear}`;
        })();
        // Education entry using table format for proper alignment
        const courseText = (() => {
          // New simplified structure
          if (edu.courseOrQualification) {
            return edu.courseOrQualification;
          }
          
          // Legacy support
          if (edu.degreeType && edu.fieldOfStudy) {
            let text = `${edu.degreeType} in ${edu.fieldOfStudy}`;
            if (edu.honoursClassification && edu.honoursClassification !== 'None') {
              text += ` with ${edu.honoursClassification}`;
            }
            return text;
          }
          
          // Ultimate fallback
          const degree = (edu as any).degree || edu.educationLevel;
          const major = (edu as any).major || edu.fieldOfStudy;
          return `${degree} in ${major}`;
        })();

        // Create table for degree and date alignment
        const educationTable = new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: courseText,
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
                          bold: false,
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
                          text: edu.institution || edu.schoolName || '',
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
        
        // Course highlights using enhanced HTML parsing
        const highlights = edu.highlights || edu.description || (edu as any).additionalInfo;
        if (highlights) {
          const highlightsParagraphs = createParagraphsFromHtml(highlights || '');
          children.push(...highlightsParagraphs);
        }
      });
    }

    // Skills
    if (resumeData.skills.length > 0) {
      children.push(createHeading('Skills'));

      // Create skills table (6 columns: Skill | Years | Level | Skill | Years | Level)
      const skillRows: TableRow[] = [];
      
      // Add header row
      skillRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Skill',
                      size: 20,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              width: {
                size: 30,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Years',
                      size: 20,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 6,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Level',
                      size: 20,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 14,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Skill',
                      size: 20,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              width: {
                size: 30,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Years',
                      size: 20,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 6,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Level',
                      size: 20,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 14,
                type: WidthType.PERCENTAGE,
              },
            }),
          ],
        })
      );
      
      // Add data rows
      for (let i = 0; i < resumeData.skills.length; i += 2) {
        const skill1 = resumeData.skills[i];
        const skill2 = resumeData.skills[i + 1];

        skillRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: skill1.name,
                        size: 20,
                        color: '000000',
                      }),
                    ],
                  }),
                ],
                width: {
                  size: 30,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: skill1.years ? skill1.years.toString() : '-',
                        size: 20,
                        color: '000000',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: {
                  size: 6,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: skill1.level,
                        size: 20,
                        color: '000000',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: {
                  size: 14,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: skill2?.name || '',
                        size: 20,
                        color: '000000',
                      }),
                    ],
                  }),
                ],
                width: {
                  size: 30,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: skill2?.years ? skill2.years.toString() : (skill2 ? '-' : ''),
                        size: 20,
                        color: '000000',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: {
                  size: 6,
                  type: WidthType.PERCENTAGE,
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: skill2?.level || '',
                        size: 20,
                        color: '000000',
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: {
                  size: 14,
                  type: WidthType.PERCENTAGE,
                },
              }),
            ],
          })
        );
      }

      children.push(
        new Table({
          rows: skillRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        })
      );
    }

    // Optional Sections
    if (resumeData.optionalSections.certificates.length > 0) {
      children.push(createHeading('Certificates'));

      resumeData.optionalSections.certificates.forEach((cert) => {
        children.push(createInstitutionHeader(cert.name, cert.date));
        children.push(createSubHeading(cert.issuer));
      });
    }

    if (resumeData.optionalSections.languages.length > 0) {
      children.push(createHeading('Languages'));

      resumeData.optionalSections.languages.forEach((lang) => {
        children.push(createLanguageHeader(lang.name, lang.proficiency));
      });

      // Create languages as a single paragraph like skills in the reference
      const languageText = resumeData.optionalSections.languages
        .map(lang => `${lang.name} (${lang.proficiency})`)
        .join(', ') + '.';
      
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
      children.push(createHeading('Hobbies & Interests'));

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

         console.log('Creating document with', children.length, 'elements...');

     // Create the document with numbering support
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
}

export const generateDocx = async (resumeData: ResumeData) => {
  try {
    const doc = createDocument(resumeData);

    console.log('Converting to blob...');
    // Generate and download the document using toBlob (browser-compatible)
    const blob = await Packer.toBlob(doc);
    
    console.log('Blob created, size:', blob.size);
    
    const fileName = resumeData.personalInfo.fullName 
      ? `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.docx`
      : 'My_Resume.docx';
    
    console.log('Downloading file:', fileName);
    
    saveAs(blob, fileName);
    
    console.log('DOCX generation completed successfully');
    return true;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      browser: navigator.userAgent
    });
    throw error;
  }
};

export const generateDocxBlob = async (resumeData: ResumeData): Promise<Blob> => {
  try {
    const doc = createDocument(resumeData);

    console.log('Converting to blob...');
    // Generate and download the document using toBlob (browser-compatible)
    const blob = await Packer.toBlob(doc);
    
    console.log('Blob created, size:', blob.size);
     
    return blob;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      browser: navigator.userAgent
    });
    throw error;
  }
};


