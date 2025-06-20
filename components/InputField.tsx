import React, { useState, useRef, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import Strike from "@tiptap/extension-strike";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

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
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Enhanced default content
  const defaultContent = `
    <h1>Professional Document Editor</h1>
    <p>Welcome to your advanced rich text editor! This powerful tool offers comprehensive formatting options for creating professional documents.</p>
    
    <h2>Text Formatting Options</h2>
    <p>Express your ideas with <strong>bold emphasis</strong>, <em>italic styling</em>, <u>underlined text</u>, and <mark>highlighted content</mark> for important information.</p>
    
    <h2>Document Structure</h2>
    <p>Organize your content effectively with:</p>
    <ul>
      <li>Professional bullet points for lists</li>
      <li>Multiple heading levels for hierarchy</li>
      <li>Text alignment options for layout control</li>
    </ul>
    
    <p>Create numbered sequences:</p>
    <ol>
      <li>Step-by-step instructions</li>
      <li>Priority rankings</li>
      <li>Sequential processes</li>
    </ol>
    
    <h2>Advanced Features</h2>
    <p style="text-align: center">Center-aligned text for titles and emphasis</p>
    <p style="text-align: right">Right-aligned text for signatures and dates</p>
    
    <p>Add hyperlinks to reference external sources and enhance your document's connectivity. Upload images to make your content more engaging and visually appealing.</p>
    
    <p><strong>Pro Tip:</strong> Use the toolbar above to access all formatting options, or use keyboard shortcuts for quick formatting!</p>
  `;

  // Function to check if content is effectively empty
  const isContentEmpty = (content: string) => {
    if (!content) return true;
    // Remove HTML tags and check if there's any meaningful text
    const textOnly = content.replace(/<[^>]*>/g, "").trim();
    return textOnly === "";
  };

  // Determine initial content: use value if provided and not empty, otherwise use default content
  const getInitialContent = () => {
    if (value && !isContentEmpty(value)) {
      return value;
    }
    return defaultContent;
  };

  // Editor setup with Image extension
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline hover:text-blue-300",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-lg my-4",
        },
        allowBase64: true,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "bullet-list",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "ordered-list",
        },
      }),
      ListItem,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "Enter your heading here...";
          }
          return "Start writing your professional document. Use the toolbar for formatting options!";
        },
      }),
    ],
    content: getInitialContent(),
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    autofocus: "end",
  });

  // Update content when value prop changes, but only if it's different and not empty
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      // Only update if the value is different and either the value is not empty or current content is not the default
      if (currentContent !== value) {
        if (value && !isContentEmpty(value)) {
          // Value has content, use it
          editor.commands.setContent(value, false);
        } else if (!value || isContentEmpty(value)) {
          // Value is empty, only clear if current content is not the default content
          const currentTextOnly = currentContent.replace(/<[^>]*>/g, "").trim();
          const defaultTextOnly = defaultContent.replace(/<[^>]*>/g, "").trim();

          if (currentTextOnly !== defaultTextOnly) {
            // Current content is not default content, so user has made changes
            // Don't override with empty value unless explicitly clearing
          }
        }
      }
    }
  }, [value, editor]);

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
            h3 { font-size: 14pt; font-weight: bold; margin: 8pt 0; }
            p { margin: 6pt 0; }
            img { max-width: 100%; height: auto; }
            ul, ol { margin: 6pt 0; padding-left: 20pt; }
            li { margin: 3pt 0; }
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
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (selectedText) {
      const prevUrl = editor.getAttributes("link").href;
      const url = window.prompt("Enter URL:", prevUrl || "https://");

      if (url === null) return;

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      // Ensure URL has protocol
      const formattedUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: formattedUrl, target: "_blank" })
        .run();
    } else {
      // No text selected, prompt for both text and URL
      const linkText = window.prompt("Enter link text:");
      if (!linkText) return;

      const url = window.prompt("Enter URL:", "https://");
      if (!url) return;

      const formattedUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;

      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${formattedUrl}" target="_blank">${linkText}</a>`
        )
        .run();
    }
  };

  const addImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        editor.chain().focus().setImage({ src, alt: file.name }).run();
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file.");
    }

    // Reset input
    event.target.value = "";
  };

  // Formatting helpers
  const isActive = (type: string, opts?: any) =>
    editor ? editor.isActive(type, opts) : false;

  return (
    <div className="w-full h-full border border-[#252525] flex flex-col bg-[#131313]">
      {/* Hidden file input for images */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between p-3 gap-2">
        {/* Left: File Name */}
        <div className="flex items-center gap-2 min-w-[220px]">
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
              <div className="absolute left-0 top-full mt-1 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-lg py-2 z-50 min-w-[180px]">
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

        {/* Center: Toolbar Buttons */}
        <div className="flex-1 flex justify-center">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text Formatting */}
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
              active={isActive("strike")}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <span className="line-through">S</span>
            </FormatButton>
            <FormatButton
              active={isActive("highlight")}
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              title="Highlight"
            >
              <HighlightIcon />
            </FormatButton>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-600 mx-1" />

            {/* Headings */}
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
              active={isActive("heading", { level: 3 })}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 3 }).run()
              }
              title="Heading 3"
            >
              H3
            </FormatButton>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-600 mx-1" />

            {/* Lists */}
            <FormatButton
              active={isActive("bulletList")}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            >
              <BulletListIcon />
            </FormatButton>
            <FormatButton
              active={isActive("orderedList")}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
            >
              <OrderedListIcon />
            </FormatButton>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-600 mx-1" />

            {/* Alignment */}
            <FormatButton
              active={isActive("textAlign", "left")}
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
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

            {/* Divider */}
            <div className="w-px h-6 bg-gray-600 mx-1" />

            {/* Link and Image */}
            <FormatButton
              active={isActive("link")}
              onClick={setLink}
              title="Add/Edit Link"
            >
              <LinkIcon />
            </FormatButton>
            <FormatButton active={false} onClick={addImage} title="Add Image">
              <ImageIcon />
            </FormatButton>
          </div>
        </div>

        {/* Right: Clear content button */}
        <div className="min-w-[120px] flex justify-end">
          <button
            onClick={() => {
              if (confirm("Clear all content? This action cannot be undone.")) {
                editor?.commands.clearContent();
              }
            }}
            className="px-3 py-1 text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
            title="Clear all content"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        <div className="max-w-4xl mx-auto p-8">
          <div
            className="min-h-[600px] prose prose-invert prose-lg max-w-none focus:outline-none"
            style={{
              outline: "none",
              lineHeight: "1.7",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .ProseMirror:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror h1.is-empty::before,
        .ProseMirror h2.is-empty::before,
        .ProseMirror h3.is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror ul.bullet-list {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .ProseMirror ol.ordered-list {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .ProseMirror li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .ProseMirror mark {
          background-color: #fef08a;
          color: #000;
          border-radius: 3px;
          padding: 2px 4px;
        }

        .ProseMirror s {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 1.5rem 0;
          line-height: 1.2;
        }

        .ProseMirror h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin: 1.25rem 0;
          line-height: 1.3;
        }

        .ProseMirror h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0;
          line-height: 1.4;
        }

        .ProseMirror p {
          margin: 1rem 0;
          line-height: 1.7;
        }

        .ProseMirror img {
          display: block;
          margin: 1.5rem auto;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 100%;
          height: auto;
        }

        .ProseMirror a {
          color: #60a5fa;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .ProseMirror a:hover {
          color: #93c5fd;
          text-decoration-color: #93c5fd;
        }
      `}</style>
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

const ImageIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
    />
  </svg>
);

const DownloadIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
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

const HighlightIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M12 3l-1.5 1.5L12 6l1.5-1.5L12 3zm6.5 6.5L17 8l-1.5 1.5L17 11l1.5-1.5zM12 17l1.5 1.5L12 20l-1.5-1.5L12 17zM7 8l-1.5 1.5L7 11l1.5-1.5L7 8zm5-1c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"
    />
  </svg>
);

const BulletListIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
    />
  </svg>
);

const OrderedListIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
    />
  </svg>
);

export default InputField;
