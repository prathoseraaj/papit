"use client";

import React, { useState } from "react";
import InputField from "@/components/InputField";
import { BsThreeDotsVertical } from "react-icons/bs";
import Chatbot from "@/components/Chatbot";

const Page = () => {
  const [files, setFiles] = useState<{ [key: string]: string }>({
    "Untiled.txt": "",
  });
  const [currentFile, setCurrentFile] = useState("Untiled.txt");
  const [newFileName, setNewFileName] = useState("");

  const handleAddFile = () => {
    const name = newFileName.trim();
    if (!name || name in files) return;
    setFiles((prev) => ({ ...prev, [name]: " " }));
    setCurrentFile(name);
    setNewFileName("");
  };

  const handleDeleteFile = (name: string) => {
    setFiles((prev) => {
      const updatefiles = { ...prev };
      delete updatefiles[name];
      return updatefiles;
    });
  };

  const handleInputChange = (text: string) => {
    setFiles((prev) => ({
      ...prev,
      [currentFile]: text,
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      <div
        className="h-[50px] w-full border-b p-2 pl-5"
        style={{ borderColor: "#252525" }}
      >
        <h1 className="text-[25px] font-outfit">Vind</h1>
      </div>

      <div className="flex flex-row flex-1 overflow-hidden">
        <div className="w-[15%] flex flex-col items-center  ">
          <input
            type="text"
            className="w-[90%] mt-5 p-1 border border-gray-600 outline-none rounded-[10px] "
            placeholder="name of the file"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddFile()}
          />
          <div className="mt-4 w-full flex flex-col items-center">
            {Object.keys(files).map((file) => (
              <div
                key={file}
                onClick={() => setCurrentFile(file)}
                className={`w-[100%] flex justify-end p-1  ${
                  file === currentFile
                    ? " backdrop-blur-md bg-blue-500/20 text-white  font-semibold cursor-pointer"
                    : "  text-gray-300 hover:bg-gray-700 cursor-pointer"
                }`}
              >
                <div className="mr-10 font-normal font-sans text-[13px]">
                  {file}
                </div>
                <div className="relative inline-block group">
                  <BsThreeDotsVertical className="text-sm mt-1 cursor-pointer pointer-events-auto" />

                  <div className="absolute left-full top-0 ml-2 w-32 bg-transparent border  border-gray-500 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-auto z-10">
                    <ul className="text-sm text-white">
                      <li
                        className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleDeleteFile(file)}
                      >
                        Delete
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className=" flex h-full w-[65%]">
          <InputField value={files[currentFile]} onChange={handleInputChange} />
        </div>
        <div className="w-[20%]">
          <Chatbot />
        </div>
      </div>
    </div>
  );
};

export default Page;
