import { Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopPosition, TabStopType } from 'docx';


// Enhanced HTML parser for complex TinyMCE content
export const parseHtmlContent = (html: string): Array<{content: string, type: 'paragraph' | 'bullet' | 'numbered', level: number, alignment?: string, formatting?: Array<{text: string, bold?: boolean, italic?: boolean, underline?: boolean}>}> => {
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
export const parseHtmlWithFormatting = (content: string): Array<{text: string, bold?: boolean, italic?: boolean, underline?: boolean}> => {
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
export const cleanHtmlContent = (content: string): string => {
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
export const createInstitutionHeader = (institutionName: string, dateText: string): Paragraph => {
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

export const createLanguageHeader = (languageName: string, proficiency: string): Paragraph => {
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
export const createSubHeading = (text: string): Paragraph => {
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
export const createHeading = (text: string): Paragraph => {
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
export const createParagraphsFromHtml = (html: string): Paragraph[] => {
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