"use client";

import React, { useState } from "react";
import InputField from "@/components/InputField";
import Chatbot from "@/components/Chatbot";
import CommitField from "@/components/CommitField";
import { VscGitCommit } from "react-icons/vsc";
import Image from "next/image";

const Page = () => {
  const [fileContent, setFileContent] = useState("");
  const [commitfield, setCommitfield] = useState(true);

  const handleInputChange = (text: string) => {
    setFileContent(text);
  };

  const handleCommitSelect = (content: string) => {
    setFileContent(content);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-row flex-1 overflow-hidden">
        <div className="flex h-full w-[80%]">
          <InputField 
            value={fileContent} 
            onChange={handleInputChange}
          />
        </div>
        {/* Commit Field */}
        <div className="w-[20%] border-l" style={{ borderColor: "#252525" }}>
          {commitfield ? (
            <CommitField
              currentContent={fileContent}
              onCommitSelect={handleCommitSelect}
            />
          ) : (
            <Chatbot />
          )}
        </div>
      </div>
      <div className="fixed bottom-4 z-50 ml-10 mb-5">
        <div
          className="rounded-full bg-black shadow-[0_0_30px_5px_rgba(50,50,50,0.2)] w-10 h-10 flex justify-center items-center shadow-white-500 cursor-pointer"
          onClick={() => setCommitfield(!commitfield)}
        >
          {commitfield ? (
            <Image src="/image.png" alt="Gemini logo" height={25} width={25} />
          ) : (
            <VscGitCommit className="text-orange-400" size={16} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;