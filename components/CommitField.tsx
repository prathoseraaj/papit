import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useState, useEffect, useRef } from "react";
import { VscGitCommit, VscChevronDown, VscChevronRight } from "react-icons/vsc";

interface Commit {
  id: string;
  message: string;
  content: string;
  timestamp: string;
}

interface CommitFieldProps {
  currentContent: string;
  onCommitSelect: (content: string) => void;
}

// In-memory storage to persist commits across component re-renders
const commitStorage: Commit[] = [];

const CommitField: React.FC<CommitFieldProps> = ({
  currentContent,
  onCommitSelect,
}) => {
  const commitListRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to("#title", {
      opacity: 1,
      duration: 0.5,
    });
  });

  // Load commits from in-memory storage on mount
  const [commits, setCommits] = useState<Commit[]>(() => {
    return [...commitStorage];
  });

  const [commitMessage, setCommitMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  // Save commits to in-memory storage whenever they change
  useEffect(() => {
    commitStorage.length = 0;
    commitStorage.push(...commits);
  }, [commits]);

  // Check if there are changes to commit
  const hasChanges = () => {
    if (commits.length === 0) return true; // First commit is always allowed
    const lastCommit = commits[0];
    return lastCommit.content !== currentContent;
  };

  // Check if commit is allowed (has message and has changes)
  const canCommit = commitMessage.trim() && hasChanges();

  // Animate commit items when they change or when expanded/collapsed
  useGSAP(() => {
    if (commitListRef.current && isExpanded) {
      const commitItems = commitListRef.current.querySelectorAll('.commit-item');
      if (commitItems.length > 0) {
        gsap.fromTo(commitItems, 
          {
            x: -30,
            opacity: 0,
            scale: 0.9
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out"
          }
        );

        // Animate the connection lines
        const lines = commitListRef.current.querySelectorAll('.commit-line');
        gsap.fromTo(lines,
          {
            scaleY: 0,
            transformOrigin: "top"
          },
          {
            scaleY: 1,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.2
          }
        );

        // Animate commit dots
        const dots = commitListRef.current.querySelectorAll('.commit-dot');
        gsap.fromTo(dots,
          {
            scale: 0,
            rotation: 180
          },
          {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "back.out(1.7)",
            delay: 0.1
          }
        );
      }
    }
  }, [commits.length, isExpanded]);

  const handleCommit = () => {
    if (!canCommit) return;

    const newCommit: Commit = {
      id: Math.random().toString(36).substring(2, 9),
      message: commitMessage,
      content: currentContent,
      timestamp: new Date().toLocaleString(),
    };

    setCommits((prev) => [newCommit, ...prev]);
    setCommitMessage("");
  };

  const handleCommitClick = (commit: Commit) => {
    onCommitSelect(commit.content);
    
    // Animate the clicked commit
    gsap.to(`#commit-${commit.id}`, {
      scale: 1.05,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  };

  // Hover animations for commit items
  const handleCommitHover = (e: React.MouseEvent, isEntering: boolean) => {
    const target = e.currentTarget;
    const dot = target.querySelector('.commit-dot');
    
    if (isEntering) {
      gsap.to(target, {
        x: 8,
        duration: 0.2,
        ease: "power2.out"
      });
      gsap.to(dot, {
        scale: 1.3,
        boxShadow: "0 0 12px rgba(251, 146, 60, 0.8)",
        duration: 0.2,
        ease: "power2.out"
      });
    } else {
      gsap.to(target, {
        x: 0,
        duration: 0.2,
        ease: "power2.out"
      });
      gsap.to(dot, {
        scale: 1,
        boxShadow: "none",
        duration: 0.2,
        ease: "power2.out"
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f0f0f]">
      {/* Header */}
      <div
        className="p-3 border-b flex items-center gap-2"
        style={{ borderColor: "#2d2d30" }}
      >
        <VscGitCommit className="text-orange-400" size={16} />
        <span
          id="title"
          className="opacity-0 scale-100 transition text-white text-sm font-medium"
        >
          Source Control
        </span>
      </div>

      {/* Commit Input */}
      <div className="p-3 border-b" style={{ borderColor: "#2d2d30" }}>
        <div className="flex flex-col gap-2">
          <textarea
            placeholder="Message (press Ctrl+Enter to commit)"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full p-2 bg-transparent border rounded resize-none outline-none text-white text-sm h-16"
            style={{ borderColor: "#3c3c3c", backgroundColor: "#2d2d30" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                handleCommit();
              }
            }}
          />
          <button
            onClick={handleCommit}
            disabled={!canCommit}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={!hasChanges() ? "No changes to commit" : ""}
          >
            ✓ Commit
          </button>
          
          {/* Status indicator */}
          {!hasChanges() && commits.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>•</span>
              <span>No changes to commit</span>
            </div>
          )}
        </div>
      </div>

      {/* Commits Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {commits.length > 0 && (
          <div className="p-2">
            <div
              className="flex items-center gap-1 p-1 hover:bg-gray-700/50 cursor-pointer rounded text-sm text-gray-300"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <VscChevronDown size={14} />
              ) : (
                <VscChevronRight size={14} />
              )}
              <VscGitCommit className="text-orange-400" size={14} />
              <span>COMMITS ({commits.length})</span>
            </div>

            {isExpanded && (
              <div ref={commitListRef} className="ml-4 mt-1">
                {commits.map((commit, index) => (
                  <div
                    key={commit.id}
                    id={`commit-${commit.id}`}
                    className="commit-item group flex items-start gap-2 p-2 hover:bg-gray-700/30 cursor-pointer rounded transition-colors w-full"
                    onClick={() => handleCommitClick(commit)}
                    onMouseEnter={(e) => handleCommitHover(e, true)}
                    onMouseLeave={(e) => handleCommitHover(e, false)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="commit-dot w-2 h-2 bg-orange-400 rounded-full mt-1"></div>
                      {index < commits.length - 1 && (
                        <div className="commit-line w-0.5 h-8 bg-gray-600 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate group-hover:text-blue-300">
                        {commit.message}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {commit.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {commits.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
            <VscGitCommit size={24} className="mb-2 opacity-50" />
            <p>No commits yet</p>
            <p className="text-xs mt-1">Make your first commit</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div
        className="p-2 border-t text-xs text-gray-400 flex items-center gap-2"
        style={{ borderColor: "#2d2d30" }}
      >
        <VscGitCommit size={12} />
        <span>{commits.length} commits</span>
        {hasChanges() && commits.length > 0 && (
          <>
            <span>•</span>
            <span className="text-orange-400">Changes pending</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CommitField;