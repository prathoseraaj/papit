import React, { useState, useRef, useEffect } from "react";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  value, 
  onChange, 
  fileName = "Untitled.txt",
  onFileNameChange 
}) => {
  const [content, setContent] = useState(value);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileNameInputRef = useRef<HTMLInputElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false);

  // Update content when value prop changes
  useEffect(() => {
    if (value !== content && !isUpdatingFromProps) {
      setContent(value);
      if (contentRef.current && contentRef.current.innerHTML !== value) {
        // Save cursor position
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        const cursorOffset = range?.startOffset || 0;
        
        contentRef.current.innerHTML = value;
        
        // Restore cursor position if possible
        if (selection && range && contentRef.current.firstChild) {
          try {
            range.setStart(contentRef.current.firstChild, Math.min(cursorOffset, contentRef.current.textContent?.length || 0));
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (error) {
            // Fallback: place cursor at end
            range.selectNodeContents(contentRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            console.log(error)
          }
        }
      }
    }
  }, [value, content, isUpdatingFromProps]);

  // Update fileName when prop changes
  useEffect(() => {
    setCurrentFileName(fileName);
  }, [fileName]);

  // Close download menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    
    if (showDownloadMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDownloadMenu]);

  // Focus file name input when editing starts
  useEffect(() => {
    if (isEditingFileName && fileNameInputRef.current) {
      fileNameInputRef.current.focus();
      fileNameInputRef.current.select();
    }
  }, [isEditingFileName]);

  const handleInput = () => {
    if (contentRef.current && !isUpdatingFromProps) {
      const newContent = contentRef.current.innerHTML;
      setContent(newContent);
      setIsUpdatingFromProps(true);
      onChange(newContent);
      setTimeout(() => setIsUpdatingFromProps(false), 0);
    }
  };

  const handleFileNameChange = (newName: string) => {
    setCurrentFileName(newName);
    onFileNameChange?.(newName);
  };

  const handleFileNameSubmit = () => {
    setIsEditingFileName(false);
    if (currentFileName.trim()) {
      handleFileNameChange(currentFileName.trim());
    } else {
      setCurrentFileName(fileName); // Reset to original if empty
    }
  };

  const downloadAsWord = () => {
    const htmlContent = contentRef.current?.innerHTML || '';
    const wordContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${currentFileName}</title>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
    
    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileName.replace(/\.[^/.]+$/, '')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const downloadAsPDF = () => {
    // For PDF generation, we'll create a print-friendly version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = contentRef.current?.innerHTML || '';
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${currentFileName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
    setShowDownloadMenu(false);
  };

  const toggleUnderline = () => {
    if (typeof document !== 'undefined') {
      document.execCommand('underline');
      handleInput();
    }
  };

  const toggleBold = () => {
    if (typeof document !== 'undefined') {
      document.execCommand('bold');
      handleInput();
    }
  };

  const toggleItalic = () => {
    if (typeof document !== 'undefined') {
      document.execCommand('italic');
      handleInput();
    }
  };

  const toggleHeading = (level: 1 | 2) => {
    if (typeof document !== 'undefined') {
      document.execCommand('formatBlock', false, `h${level}`);
      handleInput();
    }
  };

  const setTextAlign = (alignment: 'left' | 'center' | 'right') => {
    if (typeof document !== 'undefined') {
      document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1));
      handleInput();
    }
  };

  const setLink = () => {
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        // If text is selected, create a link with that text
        const url = window.prompt('Enter URL:');
        if (url && typeof document !== 'undefined') {
          document.execCommand('createLink', false, url);
          handleInput();
        }
      } else {
        // If no text selected, prompt for both text and URL
        const linkText = window.prompt('Enter link text:');
        if (linkText) {
          const url = window.prompt('Enter URL:');
          if (url && typeof document !== 'undefined') {
            document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${linkText}</a>`);
            handleInput();
          }
        }
      }
    }
  };

  const setFontSize = (size: string) => {
    if (typeof document !== 'undefined') {
      document.execCommand('fontSize', false, size);
      handleInput();
    }
  };

  const isActive = (command: string) => {
    return typeof document !== 'undefined' ? document.queryCommandState(command) : false;
  };

  return (
    <div className="w-full h-full border border-[#252525] flex flex-col bg-[#131313]">
      {/* Formatting Toolbar with File Name */}
      <div className="flex flex-wrap items-center justify-between p-2 gap-2 border-b border-[#252525] bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center gap-1">
        <FormatButton
          active={isActive('bold')}
          onClick={toggleBold}
          title="Bold (Ctrl+B)"
        >
          <span className="font-bold">B</span>
        </FormatButton>
        
        <FormatButton
          active={isActive('italic')}
          onClick={toggleItalic}
          title="Italic (Ctrl+I)"
        >
          <span className="italic">I</span>
        </FormatButton>
        
        <FormatButton
          active={isActive('underline')}
          onClick={toggleUnderline}
          title="Underline (Ctrl+U)"
        >
          <span className="underline">U</span>
        </FormatButton>
        
        <FormatButton
          active={false}
          onClick={() => toggleHeading(1)}
          title="Heading 1"
        >
          H1
        </FormatButton>
        
        <FormatButton
          active={false}
          onClick={() => toggleHeading(2)}
          title="Heading 2"
        >
          H2
        </FormatButton>
        
        <FormatButton
          active={isActive('justifyLeft')}
          onClick={() => setTextAlign('left')}
          title="Align left"
        >
          <AlignLeftIcon />
        </FormatButton>
        
        <FormatButton
          active={isActive('justifyCenter')}
          onClick={() => setTextAlign('center')}
          title="Align center"
        >
          <AlignCenterIcon />
        </FormatButton>
        
        <FormatButton
          active={isActive('justifyRight')}
          onClick={() => setTextAlign('right')}
          title="Align right"
        >
          <AlignRightIcon />
        </FormatButton>
        
        <FormatButton
          active={false}
          onClick={setLink}
          title="Insert/Create Link - Select text first to make it a link, or click to add new link"
        >
          <LinkIcon />
        </FormatButton>

        {/* Font Size Controls */}
        <div className="flex items-center gap-1 ml-2 border-l border-[#252525] pl-2">
          <span className="text-gray-400 text-xs">Size:</span>
          <FormatButton
            active={false}
            onClick={() => setFontSize('1')}
            title="Small text"
          >
            <span className="text-xs">A</span>
          </FormatButton>
          
          <FormatButton
            active={false}
            onClick={() => setFontSize('3')}
            title="Normal text"
          >
            <span className="text-sm">A</span>
          </FormatButton>
          
          <FormatButton
            active={false}
            onClick={() => setFontSize('5')}
            title="Large text"
          >
            <span className="text-base">A</span>
          </FormatButton>
          
          <FormatButton
            active={false}
            onClick={() => setFontSize('7')}
            title="Extra large text"
          >
            <span className="text-lg">A</span>
          </FormatButton>
        </div>
        </div>

        {/* File Name Section with Three-Dot Menu */}
        <div className="flex items-center gap-2 border-l border-[#252525] pl-4 relative">
          {isEditingFileName ? (
            <input
              ref={fileNameInputRef}
              type="text"
              value={currentFileName}
              onChange={(e) => setCurrentFileName(e.target.value)}
              onBlur={handleFileNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFileNameSubmit();
                if (e.key === 'Escape') {
                  setCurrentFileName(fileName);
                  setIsEditingFileName(false);
                }
              }}
              className="bg-[#2a2a2a] text-gray-200 px-2 py-1 rounded text-xs border border-gray-600 focus:border-blue-500 focus:outline-none min-w-[120px]"
            />
          ) : (
            <span
              onClick={() => setIsEditingFileName(true)}
              className="text-gray-200 text-xs cursor-pointer hover:text-white hover:bg-[#2a2a2a] px-2 py-1 rounded transition-colors"
              title="Click to rename file"
            >
              {currentFileName}
            </span>
          )}
          
          {/* Three-Dot Menu */}
          <div className="relative" ref={downloadMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDownloadMenu(!showDownloadMenu);
              }}
              className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              title="Download options"
            >
              <ThreeDotsIcon />
            </button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-lg py-2 z-50 min-w-[160px]">
                <button
                  onClick={downloadAsPDF}
                  className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <DownloadIcon />
                  Download as PDF
                </button>
                <button
                  onClick={downloadAsWord}
                  className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <DownloadIcon />
                  Download as Word
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-4">
        <div
          ref={contentRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={(event) => {
            // Handle tab key to insert tab character instead of moving focus
            if (event.key === 'Tab') {
              event.preventDefault();
              if (typeof document !== 'undefined') {
                document.execCommand('insertText', false, '\t');
                handleInput();
              }
            }
            // Allow normal keyboard shortcuts
            else if (event.ctrlKey || event.metaKey) {
              if (event.key === 'b') {
                event.preventDefault();
                toggleBold();
              } else if (event.key === 'i') {
                event.preventDefault();
                toggleItalic();
              } else if (event.key === 'u') {
                event.preventDefault();
                toggleUnderline();
              }
            }
          }}
          className="h-full text-gray-200 prose prose-invert max-w-none focus:outline-none whitespace-pre-wrap break-words overflow-wrap-anywhere"
          style={{ 
            outline: 'none',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
          suppressContentEditableWarning={true}
        />
      </div>
    </div>
  );
};

// Helper components for better organization
interface FormatButtonProps {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

const FormatButton: React.FC<FormatButtonProps> = ({ 
  active, 
  onClick, 
  title,
  children 
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-gray-800 transition-colors ${
      active ? 'bg-gray-700 text-white' : 'text-gray-400'
    }`}
  >
    {children}
  </button>
);

// Icon components
const AlignLeftIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path 
      fill="currentColor" 
      d="M3 3h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3z" 
    />
  </svg>
);

const AlignCenterIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path 
      fill="currentColor" 
      d="M3 3h18v2H3zm4 4h10v2H7zm-4 4h18v2H3zm4 4h10v2H7z" 
    />
  </svg>
);

const AlignRightIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path 
      fill="currentColor" 
      d="M3 3h18v2H3zm6 4h12v2H9zm-6 4h18v2H3zm6 4h12v2H9z" 
    />
  </svg>
);

const LinkIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path 
      fill="currentColor" 
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" 
    />
    <path 
      fill="currentColor" 
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" 
    />
  </svg>
);

const DownloadIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path 
      fill="currentColor" 
      d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" 
    />
  </svg>
);

const ThreeDotsIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path 
      fill="currentColor" 
      d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" 
    />
  </svg>
);

export default InputField;