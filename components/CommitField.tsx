import React, { useState } from "react";
import { VscGitCommit, VscChevronDown, VscChevronRight } from "react-icons/vsc";

interface Commit {
  id: string;
  message: string;
  content: string;
  timestamp: string;
}

interface CommitFieldProps {
  currentContent: string;
  fileName: string;
  onCommitSelect: (content: string) => void;
}

const CommitField: React.FC<CommitFieldProps> = ({ 
  currentContent, 
  fileName, 
  onCommitSelect 
}) => {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    
    const newCommit: Commit = {
      id: Math.random().toString(36).substring(2, 9),
      message: commitMessage,
      content: currentContent,
      timestamp: new Date().toLocaleString()
    };

    setCommits(prev => [newCommit, ...prev]);
    setCommitMessage("");
  };

  const handleCommitClick = (commit: Commit) => {
    onCommitSelect(commit.content);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: "#2d2d30" }}>
        <VscGitCommit className="text-orange-400" size={16} />
        <span className="text-white text-sm font-medium">Source Control</span>
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
            disabled={!commitMessage.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✓ Commit
          </button>
        </div>
      </div>

      {/* Commits Tree */}
      <div className="flex-1 overflow-auto">
        {commits.length > 0 && (
          <div className="p-2">
            <div 
              className="flex items-center gap-1 p-1 hover:bg-gray-700/50 cursor-pointer rounded text-sm text-gray-300"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />}
              <VscGitCommit className="text-orange-400" size={14} />
              <span>COMMITS ({commits.length})</span>
            </div>

            {isExpanded && (
              <div className="ml-4 mt-1">
                {commits.map((commit, index) => (
                  <div
                    key={commit.id}
                    className="group flex items-start gap-2 p-2 hover:bg-gray-700/30 cursor-pointer rounded transition-colors"
                    onClick={() => handleCommitClick(commit)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-1"></div>
                      {index < commits.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-600 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate group-hover:text-blue-300">
                        {commit.message}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                         {commit.timestamp}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {fileName}
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
      <div className="p-2 border-t text-xs text-gray-400 flex items-center gap-2" style={{ borderColor: "#2d2d30" }}>
        <VscGitCommit size={12} />
        <span>{commits.length} commits</span>
      </div>
    </div>
  );
};

export default CommitField;