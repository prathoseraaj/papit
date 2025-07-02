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
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Typography from "@tiptap/extension-typography";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { CollaborativeCursor } from "./CollaborativeCursor";

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { from: number; to: number };
}

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  isCollab?: boolean;
  roomId?: string;
  userName?: string;
  setUserName?: (name: string) => void;
  onStartCollab?: () => void;
}

const getRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#FFD166",
    "#A3A847",
    "#F9844A",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRoomFromUrl = () => {
  if (typeof window === "undefined") return "default";
  const m = window.location.pathname.match(/collaborative\/([\w\d-]+)/);
  return m ? `room-${m[1]}` : "default";
};

const defaultContent = `
<h2>Getting Started</h2>
  <p>Welcome to <strong>VIND</strong>, an opensource rich text editor! All extensions are licensed under <strong>MIT</strong>.</p>
  <p>Integrate it by following the <a href="https://vind-docs.example.com" target="_blank">Vind_docs</a> or using our CLI tool.</p>
  
  <h2>Features</h2>
  <p>A fully responsive rich text editor with built-in support for common formatting and layout tools. Type markdown <strong>**</strong> or use keyboard shortcuts <code>⌘+B</code> for <s>most</s> all common markdown marks. 🪄</p>
  
  <p>Add images, customize alignment, and apply advanced formatting to make your writing more engaging and professional.</p>
  
  <ul>
    <li><strong>Superscript</strong> (x²) and <strong>Subscript</strong> (H₂O) for precision.</li>
    <li><strong>Typographic conversion</strong>: automatically convert <code>-></code> to an arrow <strong>→</strong>.</li>
    <li><strong>Rich media support</strong> with drag & drop functionality.</li>
  </ul>
  
    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDYwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIHJ4PSIxMCIgZmlsbD0iIzM3NDE1MSIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMjAiIHI9IjMwIiBmaWxsPSIjNjM2NkYxIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmaWxsPSIjRjlGQUZCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIj5WSU5EIEVkaXRvcjwvdGV4dD4KPHRleHQgeD0iMjAwIiB5PSIxNjAiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+UHJvZmVzc2lvbmFsIHJpY2ggdGV4dCBlZGl0aW5nPC90ZXh0Pgo8cmVjdCB4PSIyMDAiIHk9IjE4MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0iIzEwQjk4MSIvPgo8cmVjdCB4PSIyMDAiIHk9IjE5NSIgd2lkdGg9IjI1MCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0iIzEwQjk4MSIgb3BhY2l0eT0iMC42Ii8+CjxyZWN0IHg9IjIwMCIgeT0iMjEwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjQiIHJ4PSIyIiBmaWxsPSIjMTBCOTgxIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+" alt="VIND Editor Interface Preview" />
  
  <p style="text-align: center"><em>↑ Learn more about our powerful editing features</em></p>
  
  <blockquote>
    <p><strong>Pro Tip:</strong> Use the toolbar above to access all formatting options, or leverage keyboard shortcuts for lightning-fast editing!</p>
  </blockquote>
`;

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  isCollab = false,
  roomId,
  userName,
  setUserName,
  onStartCollab,
}) => {
  const [showCollaboratorMenu, setShowCollaboratorMenu] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [initialContent, setInitialContent] = useState<string | null>(null);

  const collaboratorMenuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isRemoteUpdate = useRef(false);
  const editorRef = useRef<any>(null);
  const router = useRouter();
  const room =
    typeof window !== "undefined"
      ? roomId
        ? `room-${roomId}`
        : getRoomFromUrl()
      : "default";

  // Collab: Ask for name if not set
  useEffect(() => {
    if (isCollab && !userName && setUserName) {
      let inputName = prompt("Enter your name for collaboration:", "");
      if (!inputName) inputName = "Anonymous";
      setUserName(inputName);
    }
    // eslint-disable-next-line
  }, [isCollab, userName]);

  // Set current user with real name (not random)
  useEffect(() => {
    if (!currentUser && isCollab && userName) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userName,
        color: getRandomColor(),
      };
      setCurrentUser(user);
    }
    // eslint-disable-next-line
  }, [userName, isCollab]);

  // Socket setup (collab only)
  useEffect(() => {
    if (!isCollab || !currentUser) return;
    if (typeof window === "undefined") return;
    // ---- FIXED: use only the path option, not the first argument ----
    const socket = io({
      path: "/api/socket",
      query: {
        room,
        user: JSON.stringify(currentUser),
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("init-content", (content: string) => {
      setInitialContent(content);
      if (
        editorRef.current &&
        content &&
        content !== editorRef.current.getHTML()
      ) {
        editorRef.current.commands.setContent(content, false);
      }
    });

    socket.on(
      "content-changed",
      (data: { content: string; userId: string }) => {
        if (data.userId !== currentUser.id) {
          isRemoteUpdate.current = true;
          if (
            editorRef.current &&
            data.content !== editorRef.current.getHTML()
          ) {
            editorRef.current.commands.setContent(data.content, false);
          }
          setTimeout(() => {
            isRemoteUpdate.current = false;
          }, 100);
        }
      }
    );

    socket.on("users-updated", (users: User[]) => setConnectedUsers(users));
    socket.on(
      "cursor-changed",
      (data: { userId: string; cursor: { from: number; to: number } }) => {
        setConnectedUsers((prev) =>
          prev.map((user) =>
            user.id === data.userId ? { ...user, cursor: data.cursor } : user
          )
        );
      }
    );

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [room, isCollab, currentUser]);

  // Editor setup
const editor = useEditor({
  extensions: [
    StarterKit.configure({ 
      heading: false,  // Disable StarterKit's heading
      strike: false,   // Using separate Strike extension
      bulletList: false,
      orderedList: false,
      listItem: false
    }),
    
    // Custom Heading configuration
    Heading.configure({
      levels: [1, 2, 3],
      HTMLAttributes: {
        class: "heading-element",
      },
    }),
    
    Underline,
    Strike,
    Superscript,
    Subscript,
    
    CollaborativeCursor.configure({
      users: connectedUsers
        .filter(
          (u): u is User & { cursor: { from: number; to: number } } =>
            !!u.cursor
        )
        .map((u) => ({
          ...u,
          cursor: u.cursor as { from: number; to: number },
        })),
      currentUserId: currentUser?.id || "",
    }),
    
    Typography.configure({
      openDoubleQuote: '"',
      closeDoubleQuote: '"',
      openSingleQuote: "'",
      closeSingleQuote: "'",
      emDash: "—",
      ellipsis: "…",
      copyright: "©",
      trademark: "™",
      registeredTrademark: "®",
      oneHalf: "½",
      oneQuarter: "¼",
      threeQuarters: "¾",
      plusMinus: "±",
      notEqual: "≠",
      laquo: "«",
      raquo: "»",
      multiplication: "×",
      superscriptTwo: "²",
      superscriptThree: "³",
    }),
    
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
    
    // Fixed TextAlign configuration
    TextAlign.configure({
      types: ["heading", "paragraph"], // Removed "div"
      alignments: ["left", "center", "right", "justify"],
      defaultAlignment: "left",
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
        return "Start writing your collaborative document. Invite team members to join!";
      },
    }),
  ],
  content: value || defaultContent,
  immediatelyRender: false,
  onCreate({ editor }) {
    editorRef.current = editor;
  },
  onUpdate({ editor }) {
    const content = editor.getHTML();
    onChange(content);
    if (
      isCollab &&
      !isRemoteUpdate.current &&
      socketRef.current &&
      currentUser
    ) {
      socketRef.current.emit("content-changed", {
        content,
        userId: currentUser.id,
      });
    }
  },
  onSelectionUpdate({ editor }) {
    if (isCollab && socketRef.current && currentUser) {
      const { from, to } = editor.state.selection;
      socketRef.current.emit("cursor-changed", {
        userId: currentUser.id,
        cursor: { from, to },
      });
    }
  },
});

  // Sync editor content when initialContent arrives or value changes (but don't loop)
  useEffect(() => {
    if (editor && initialContent && !isRemoteUpdate.current) {
      if (editor.getHTML() !== initialContent) {
        editor.commands.setContent(initialContent, false);
      }
    }
    // eslint-disable-next-line
  }, [initialContent, editor]);

  useEffect(() => {
    if (editor && value && !isRemoteUpdate.current) {
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const collabCursorExt = editor.extensionManager.extensions.find(
      (e) => e.name === "collaborativeCursor"
    );
    if (collabCursorExt) {
      collabCursorExt.options.users = connectedUsers.filter((u) => u.cursor);
      collabCursorExt.options.currentUserId = currentUser?.id || "";
    }
    editor.view.dispatch(editor.state.tr); // force re-render
  }, [connectedUsers, currentUser, editor]);

  // Close collaborator menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        collaboratorMenuRef.current &&
        !collaboratorMenuRef.current.contains(event.target as Node)
      ) {
        setShowCollaboratorMenu(false);
      }
    };

    if (showCollaboratorMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showCollaboratorMenu]);

  // --- Toolbar helpers ---
  const downloadAsWord = () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    const wordContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Collaborative Document</title>
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
    a.download = "collaborative-document.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    event.target.value = "";
  };

  // Formatting helpers
  const isActive = (type: string, opts?: Record<string, unknown>) =>
    editor ? editor.isActive(type, opts) : false;

  // --- New: Show only up to 5 users, and always show "You" for current user ---
  const userList = isCollab
    ? connectedUsers.slice(0, 5).map((user) => ({
        ...user,
        displayName:
          currentUser && user.id === currentUser.id
            ? `${user.name} (You)`
            : user.name,
      }))
    : [];

  // ---- UI ----
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
        {/* Left: Collaboration Indicator */}
        <div className="relative" ref={collaboratorMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCollaboratorMenu(!showCollaboratorMenu);
            }}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            title="Collaboration"
          >
            <div
              className={`w-3 h-3 rounded-full ${
                isCollab && isConnected ? "bg-green-500" : "bg-red-500"
              } animate-pulse`}
            />
            <span className="text-sm">
              {isCollab ? connectedUsers.length : 0} online
            </span>
          </button>

          {showCollaboratorMenu && (
            <div className="absolute left-0 top-full mt-1 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-lg py-2 z-50 min-w-[280px]">
              <div className="px-4 py-2 border-b border-gray-600">
                <h3 className="text-white text-sm font-medium">
                  Collaborators
                </h3>
              </div>
              <div className="max-h-32 overflow-y-auto">
                {isCollab ? (
                  userList.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: user.color }}
                      />
                      <span className="text-gray-200 text-sm flex-1">
                        {user.displayName}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400 text-sm">
                    No collaborators yet.
                  </div>
                )}
              </div>
              <div className="border-t border-gray-600 mt-2 pt-2">
                {!isCollab && (
                  <button
                    onClick={() => {
                      setShowCollaboratorMenu(false);
                      if (onStartCollab) onStartCollab();
                    }}
                    className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm"
                  >
                    <ShareIcon />
                    Start Collaboration
                  </button>
                )}
                {isCollab && (
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Share this room URL to invite others.
                  </div>
                )}
              </div>
            </div>
          )}
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

            {/* Headings - FIXED */}
            <FormatButton
              active={isActive("heading", { level: 1 })}
              onClick={() => {
                editor?.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              title="Heading 1"
            >
              H1
            </FormatButton>
            <FormatButton
              active={isActive("heading", { level: 2 })}
              onClick={() => {
                editor?.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              title="Heading 2"
            >
              H2
            </FormatButton>
            <FormatButton
              active={isActive("heading", { level: 3 })}
              onClick={() => {
                editor?.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              title="Heading 3"
            >
              H3
            </FormatButton>
            <FormatButton
              active={isActive("superscript")}
              onClick={() => editor?.chain().focus().toggleSuperscript().run()}
              title="Superscript (Ctrl+.)"
            >
              <SuperscriptIcon />
            </FormatButton>
            <FormatButton
              active={isActive("subscript")}
              onClick={() => editor?.chain().focus().toggleSubscript().run()}
              title="Subscript (Ctrl+,)"
            >
              <SubscriptIcon />
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
              active={isActive("textAlign", { textAlign: "left" })}
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              title="Align left"
            >
              <AlignLeftIcon />
            </FormatButton>
            <FormatButton
              active={isActive("textAlign", { textAlign: "center" })}
              onClick={() =>
                editor?.chain().focus().setTextAlign("center").run()
              }
              title="Align center"
            >
              <AlignCenterIcon />
            </FormatButton>
            <FormatButton
              active={isActive("textAlign", { textAlign: "right" })}
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

            {/* Download */}
            <FormatButton
              active={false}
              onClick={downloadAsWord}
              title="Download as Word"
            >
              <DownloadIcon />
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
      <div className="flex-1 overflow-auto hide-scrollbar relative">
        <div className="max-w-4xl mx-auto px-16 py-8">
          <div
            className="min-h-[600px] prose prose-invert prose-lg max-w-none focus:outline-none relative"
            style={{
              outline: "none",
              lineHeight: "1.7",
              paddingLeft: "4rem",
              paddingRight: "4rem",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      {/* ... Global styles ... */}
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
        .ProseMirror sup {
          font-size: 0.75em;
          line-height: 0;
          position: relative;
          vertical-align: baseline;
          top: -0.5em;
        }

        .ProseMirror sub {
          font-size: 0.75em;
          line-height: 0;
          position: relative;
          vertical-align: baseline;
          bottom: -0.25em;
        }
      `}</style>
    </div>
  );
};

// ---- Icon & Button Components (unchanged, keep as before) ----
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
const SuperscriptIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M16 7.41L11.41 12L16 16.59L14.59 18L10 13.41L5.41 18L4 16.59L8.59 12L4 7.41L5.41 6L10 10.59L14.59 6L16 7.41ZM21.85 9h-2.28l.77-1.15c.13-.2.2-.43.2-.68c0-.6-.4-1.17-1.04-1.17c-.43 0-.8.26-.96.65L17.76 7.5c.42-.93 1.34-1.5 2.39-1.5c1.45 0 2.54 1.17 2.54 2.67c0 .69-.23 1.35-.64 1.84L20.1 13h1.75v1.5h-4.09L21.85 9z"
    />
  </svg>
);
const SubscriptIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M16 7.41L11.41 12L16 16.59L14.59 18L10 13.41L5.41 18L4 16.59L8.59 12L4 7.41L5.41 6L10 10.59L14.59 6L16 7.41ZM22 18h-2v-1h2v1ZM20.5 14.5c-.28 0-.5.22-.5.5s.22.5.5.5s.5-.22.5-.5s-.22-.5-.5-.5ZM22 16c0 1.11-.89 2-2 2h-1.5v-1H20c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-1v-1h1c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H18v-1h2c1.11 0 2 .89 2 2c0 .37-.11.7-.28.96c.17.26.28.59.28.96Z"
    />
  </svg>
);
const ShareIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M18 8a3 3 0 1 0-2.83-4H8.83A3 3 0 1 0 6 8c.23 0 .45-.03.67-.08l6.26 3.13a3.01 3.01 0 1 0 0 1.9l-6.26 3.13A3 3 0 1 0 8.83 20h6.34A3 3 0 1 0 18 16c-.23 0-.45.03-.67.08l-6.26-3.13a3.01 3.01 0 0 0 0-1.9l6.26-3.13c.22.05.44.08.67.08z"
    />
  </svg>
);

export default InputField;
