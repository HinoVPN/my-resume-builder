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
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
