import React, { useState, useRef, useEffect } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";

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
  onFileNameChange,
}) => {
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const fileNameInputRef = useRef<HTMLInputElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Heading.configure({ levels: [1, 2] }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Update content when value prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Update fileName when prop changes
  useEffect(() => {
    setCurrentFileName(fileName);
  }, [fileName]);

  // Close download menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDownloadMenu]);

  // Focus file name input when editing starts
  useEffect(() => {
    if (isEditingFileName && fileNameInputRef.current) {
      fileNameInputRef.current.focus();
      fileNameInputRef.current.select();
    }
  }, [isEditingFileName]);

  const handleFileNameChange = (newName: string) => {
    setCurrentFileName(newName);
    onFileNameChange?.(newName);
  };

  const handleFileNameSubmit = () => {
    setIsEditingFileName(false);
    if (currentFileName.trim()) {
      handleFileNameChange(currentFileName.trim());
    } else {
      setCurrentFileName(fileName);
    }
  };

  const downloadAsWord = () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    const wordContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${currentFileName}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>90</w:Zoom>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page { size: 8.5in 11in; margin: 1in; }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              color: black;
              background: white;
              margin: 0;
              padding: 0;
            }
            h1 { font-size: 18pt; font-weight: bold; margin: 12pt 0; }
            h2 { font-size: 16pt; font-weight: bold; margin: 10pt 0; }
            p { margin: 6pt 0; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    const blob = new Blob([wordContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentFileName.replace(/\.[^/.]+$/, "")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const setLink = () => {
    if (!editor) return;
    const prevUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", prevUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  };

  // Formatting helpers
  const isActive = (type: string, opts?: any) =>
    editor ? editor.isActive(type, opts) : false;

  return (
    <div className="w-full h-full border border-[#252525] flex flex-col bg-[#131313]">
      {/* Formatting Toolbar with File Name */}
      <div className="flex flex-wrap items-center justify-center pr-3 pl-3 gap-2 border-b border-[#252525] bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center gap-1">
          <FormatButton
            active={isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <span className="font-bold">B</span>
          </FormatButton>

          <FormatButton
            active={isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <span className="italic">I</span>
          </FormatButton>

          <FormatButton
            active={isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <span className="underline">U</span>
          </FormatButton>

          <FormatButton
            active={isActive("heading", { level: 1 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
          >
            H1
          </FormatButton>

          <FormatButton
            active={isActive("heading", { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
          >
            H2
          </FormatButton>

          <FormatButton
            active={isActive("textAlign", "left")}
            onClick={() =>
              editor?.chain().focus().setTextAlign("left").run()
            }
            title="Align left"
          >
            <AlignLeftIcon />
          </FormatButton>

          <FormatButton
            active={isActive("textAlign", "center")}
            onClick={() =>
              editor?.chain().focus().setTextAlign("center").run()
            }
            title="Align center"
          >
            <AlignCenterIcon />
          </FormatButton>

          <FormatButton
            active={isActive("textAlign", "right")}
            onClick={() =>
              editor?.chain().focus().setTextAlign("right").run()
            }
            title="Align right"
          >
            <AlignRightIcon />
          </FormatButton>

          <FormatButton
            active={isActive("link")}
            onClick={setLink}
            title="Insert/Create Link"
          >
            <LinkIcon />
          </FormatButton>

          {/* Font Size Controls */}
          <div className="flex items-center gap-1 ml-2 border-l border-[#252525] pl-2">
            <span className="text-gray-400 text-xs">Size:</span>
            {/* Tiptap doesn't have native fontSize, so use heading/paragraph as alternatives */}
            <FormatButton
              active={isActive("paragraph")}
              onClick={() => editor?.chain().focus().setParagraph().run()}
              title="Normal text"
            >
              <span className="text-sm">A</span>
            </FormatButton>
            <FormatButton
              active={isActive("heading", { level: 1 })}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 1 }).run()
              }
              title="Large text (H1)"
            >
              <span className="text-base">A</span>
            </FormatButton>
            <FormatButton
              active={isActive("heading", { level: 2 })}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="Medium text (H2)"
            >
              <span className="text-lg">A</span>
            </FormatButton>
          </div>
        </div>

        {/* File Name Section with Download Menu */}
        <div className="flex items-center gap-2 border-l border-[#252525] ml-20 pl-4 relative">
          {isEditingFileName ? (
            <input
              ref={fileNameInputRef}
              type="text"
              value={currentFileName}
              onChange={(e) => setCurrentFileName(e.target.value)}
              onBlur={handleFileNameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFileNameSubmit();
                if (e.key === "Escape") {
                  setCurrentFileName(fileName);
                  setIsEditingFileName(false);
                }
              }}
              className="bg-[#2a2a2a] text-gray-200 px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none min-w-[140px]"
            />
          ) : (
            <span
              onClick={() => setIsEditingFileName(true)}
              className="text-gray-200 text-sm cursor-pointer hover:text-white hover:bg-[#2a2a2a] px-3 py-1 rounded transition-colors"
              title="Click to rename file"
            >
              {currentFileName}
            </span>
          )}

          {/* Download Menu */}
          <div className="relative" ref={downloadMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDownloadMenu(!showDownloadMenu);
              }}
              className="p-2 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              title="Download options"
            >
              <ThreeDotsIcon />
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-lg py-2 z-50 min-w-[220px]">
                <button
                  onClick={downloadAsWord}
                  className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm"
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
      <div className="flex-1 overflow-auto p-6">
        <div className="h-full prose prose-invert max-w-none focus:outline-none whitespace-pre-wrap break-words overflow-wrap-anywhere"
          style={{
            outline: "none",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            minHeight: "400px",
            lineHeight: "1.6",
            padding: "40px 60px",
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

// Helper components
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
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-gray-800 transition-colors ${
      active ? "bg-gray-700 text-white" : "text-gray-400"
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