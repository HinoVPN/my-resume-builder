import React from 'react';
import { Editor } from '@hugerte/hugerte-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  required?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your content here...',
  height = 200,
  className = '',
  required = false
}) => {
  return (
    <div className={`rich-text-editor ${className}`} style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
      <Editor
        value={value}
        onEditorChange={onChange}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'lists', 'link', 'charmap', 'anchor', 'searchreplace', 'visualblocks',
            'insertdatetime', 'table', 'help', 'wordcount'
          ],
          toolbar: 'bold italic underline | bullist numlist | alignleft aligncenter alignright alignjustify | undo redo',
          // 解決格式問題的設定
          paste_as_text: true,
          paste_auto_cleanup_on_paste: true,
          paste_remove_styles: true,
          paste_remove_styles_if_webkit: true,
          paste_strip_class_attributes: 'all',
          valid_elements: 'p,strong,em,u,ul,ol,li,br',
          valid_styles: {},
          forced_root_block: 'p',
          force_br_newlines: false,
          remove_redundant_brs: true,
          font_family_formats: 'Inter=Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
          font_size_formats: '14px',
          content_style: `
            body { 
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
              font-size: 14px !important; 
              line-height: 1.4 !important; 
              margin: 8px 12px !important;
              color: #374151 !important;
              background-color: #ffffff !important;
            }
            * {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              font-size: 14px !important;
            }
            p { 
              margin: 0 0 8px 0 !important; 
              line-height: 1.4 !important;
              font-family: inherit !important;
            }
            p:last-child {
              margin-bottom: 0 !important;
            }
            ul, ol { 
              margin: 0 0 8px 0 !important; 
              padding-left: 20px !important; 
              line-height: 1.4 !important;
            }
            ul:last-child, ol:last-child {
              margin-bottom: 0 !important;
            }
            li { 
              margin: 0 0 4px 0 !important; 
              line-height: 1.4 !important;
            }
            li:last-child {
              margin-bottom: 0 !important;
            }
            strong, b {
              font-weight: 600 !important;
              color: #374151 !important;
            }
            em, i {
              font-style: italic !important;
              color: #374151 !important;
            }
            u {
              text-decoration: underline !important;
              color: #374151 !important;
            }
          `,
          placeholder: placeholder,
          branding: false,
          resize: true,
          statusbar: false,
          block_formats: 'Paragraph=p;',
          // Prevent heading formats to maintain consistency
          formats: {
            bold: { inline: 'strong' },
            italic: { inline: 'em' },
            underline: { inline: 'u' }
          },
          // Setup function to add custom validation if needed
          setup: (editor) => {
            // Hide hugerte logs
            const originalConsoleLog = console.log;
            console.log = (...args) => {
              const message = args.join(' ');
              if (message.includes('isEventProp') || message.includes('hugerte')) {
                return; // Skip hugerte logs
              }
              originalConsoleLog.apply(console, args);
            };

            if (required) {
              editor.on('blur', () => {
                const content = editor.getContent({ format: 'text' }).trim();
                const container = editor.getContainer();
                if (!content) {
                  container.style.borderColor = '#ef4444';
                } else {
                  container.style.borderColor = '#d1d5db';
                }
              });
            }

            editor.on('PastePreProcess', (e) => {
              let content = e.content;
              
              // Handle special characters and bullet conversion first
              content = content
                // Convert various bullet characters to standard format
                .replace(/[•·‣⁃▪▫◦‧∙⋅]/g, '• ')
                .replace(/[–—]/g, '- ')  // Convert en-dash and em-dash to regular dash
                .replace(/['']/g, "'")   // Convert smart quotes to regular quotes
                .replace(/[""]/g, '"')   // Convert smart double quotes to regular quotes
                .replace(/…/g, '...')    // Convert ellipsis to three dots
                .replace(/­/g, '')       // Remove soft hyphens
                .replace(/\u00A0/g, ' ') // Convert non-breaking space to regular space
                
                // Handle <br> tags - convert to paragraph breaks (more comprehensive)
                .replace(/<br\s*\/?\s*>/gi, '\n') // First convert all br variations to newlines
                .replace(/\n+/g, '\n') // Consolidate multiple newlines
                
                // Process content to handle newlines properly within existing paragraphs
                .replace(/<p>([^<]*)\n([^<]*)<\/p>/gi, (_match, before, after) => {
                  // Split content by newlines and wrap each in p tags
                  const parts = (before + '\n' + after).split('\n').filter(part => part.trim());
                  return parts.map(part => `<p>${part.trim()}</p>`).join('');
                })
                
                // Handle standalone newlines (convert to paragraph breaks)
                .replace(/\n/g, '</p><p>')
                .replace(/<p><\/p>/g, '') // Remove empty paragraphs
                .replace(/^<\/p>/, '') // Remove leading closing p tag  
                .replace(/<p>$/, '') // Remove trailing opening p tag
                
                // Handle paragraph-wrapped bullet points first
                .replace(/<p>(\s*)•\s+([^<]+)<\/p>/gi, '<li>$2</li>')
                .replace(/<p>(\s*)o\s+([^<]+)<\/p>/gi, '<li>$2</li>')
                .replace(/<p>(\s*)-\s+([^<]+)<\/p>/gi, '<li>$2</li>')
                .replace(/<p>(\s*)\*\s+([^<]+)<\/p>/gi, '<li>$2</li>')
                
                // Handle regular text bullet points
                .replace(/^(\s*)•\s+(.+)$/gm, '<li>$2</li>')
                .replace(/^(\s*)o\s+(.+)$/gm, '<li>$2</li>')
                .replace(/^(\s*)-\s+(.+)$/gm, '<li>$2</li>')
                .replace(/^(\s*)\*\s+(.+)$/gm, '<li>$2</li>')
                
                // Clean up and wrap consecutive list items in <ul> tags
                .replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/gs, (match) => {
                  return '<ul>' + match + '</ul>';
                })
                
                // Handle mixed content - convert remaining bullet lines inside paragraphs
                .replace(/<p>([^<]*•[^<]*)<\/p>/gi, (match, content) => {
                  // Split by bullet points within the paragraph
                  const parts = content.split(/\s*•\s+/);
                  if (parts.length > 1) {
                    parts.shift(); // Remove first empty part
                    return '<ul>' + parts.map((part: string) => `<li>${part.trim()}</li>`).join('') + '</ul>';
                  }
                  return match;
                });
              
              // Step 1: Remove all comments and Word-specific markup
              content = content
                // Remove Word comments and conditional markup
                .replace(/<!\[if[^>]*\]>.*?<!\[endif\]>/gi, '')
                .replace(/<!--.*?-->/gi, '')
                .replace(/<!\[CDATA\[.*?\]\]>/gi, '')
                
                // Remove Word-specific tags
                .replace(/<o:p[^>]*>.*?<\/o:p>/gi, '')
                .replace(/<o:[^>]*>.*?<\/o:[^>]*>/gi, '')
                .replace(/<w:[^>]*>.*?<\/w:[^>]*>/gi, '')
                .replace(/<m:[^>]*>.*?<\/m:[^>]*>/gi, '')
                
                // Remove span tags but preserve their text content (handle nested spans)
                .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
                .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
                .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
                .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
                
                // Preserve bold formatting - convert all bold variants to <strong>
                .replace(/<b\b[^>]*>(.*?)<\/b>/gi, '<strong>$1</strong>')
                .replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, '<strong>$1</strong>')
                
                // Preserve italic formatting - convert all italic variants to <em>
                .replace(/<i\b[^>]*>(.*?)<\/i>/gi, '<em>$1</em>')
                .replace(/<em\b[^>]*>(.*?)<\/em>/gi, '<em>$1</em>')
                
                // Preserve underline formatting - convert all underline variants to <u>
                .replace(/<u\b[^>]*>(.*?)<\/u>/gi, '<u>$1</u>')
                
                // Remove all other formatting but preserve the text content
                .replace(/<div[^>]*>(.*?)<\/div>/gi, '<p>$1</p>')
                .replace(/<font[^>]*>(.*?)<\/font>/gi, '$1')
                .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '<p><strong>$1</strong></p>')
                
                // Clean up attributes from remaining tags
                .replace(/(<(?:p|strong|em|u|ul|ol|li|br)\s+)[^>]*>/gi, '$1>')
                
                // Clean up HTML entities and extra spaces
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&bull;/g, '•')
                .replace(/&middot;/g, '·')
                
                // Clean up multiple spaces and trim
                .replace(/\s+/g, ' ')
                .trim()
                
                // Clean up empty tags
                .replace(/<p\s*><\/p>/gi, '')
                .replace(/<strong\s*><\/strong>/gi, '')
                .replace(/<em\s*><\/em>/gi, '')
                .replace(/<u\s*><\/u>/gi, '')
                
                // Clean up any remaining empty paragraphs
                .replace(/<p[^>]*>\s*<\/p>/gi, '');
              
              e.content = content;
            });

            // Handle paste events to ensure consistent formatting
            editor.on('PastePostProcess', (e) => {
              // Clean up the pasted content node
              const node = e.node;
              
              // Remove unwanted attributes and elements
              const elementsToClean = node.querySelectorAll('*');
              elementsToClean.forEach((el) => {
                const tagName = el.tagName.toLowerCase();
                
                // Remove all attributes from all elements
                const attributes = Array.from(el.attributes);
                attributes.forEach(attr => {
                  el.removeAttribute(attr.name);
                });
                
                // Replace span elements with their content (in case any slipped through)
                if (tagName === 'span' && el.parentNode) {
                  const parent = el.parentNode;
                  while (el.firstChild) {
                    parent.insertBefore(el.firstChild, el);
                  }
                  parent.removeChild(el);
                }
                
                // Replace any unwanted tags with their text content
                if (!['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br'].includes(tagName) && el.parentNode) {
                  const textNode = document.createTextNode(el.textContent || '');
                  el.parentNode.replaceChild(textNode, el);
                }
              });
            });
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
