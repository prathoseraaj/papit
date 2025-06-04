"use client";

import React, { useState } from "react";
import InputField from "@/components/InputField";

interface InputFieldProps {
  value: string;
  onChange: (text: string) => void;
}

const page = () => {
  const [files, setFiles] = useState<{ [key: string]: string }>({
    Untiled: "",
  });
  const [currentFile, setCurrentFile] = useState("Untiled");
  const [newFileName, setNewFileName] = useState("");

  const handleAddFile = () => {
    const name = newFileName.trim();
    if (!name || name in files) return;
    setFiles((prev) => ({ ...prev, [name]: " " }));
    setCurrentFile(name);
    setNewFileName("");
  };

  const handleInputChange = (text: string) => {
    setFiles((prev) => ({
      ...prev,
      [currentFile]: text,
    }));
  };

  return (
    <>
      <div
        className="flex max-h-[100vh] w-full p-2 pl-5 border-b"
        style={{ borderColor: "#252525" }}
      >
        <h1 className="text-[25px] font-outfit ">Vind</h1>
      </div>
      <div className="flex flex-row h-[90vh]">
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
              <button
                key={file}
                onClick={() => setCurrentFile(file)}
                className={`w-[90%] my-1 p-1 rounded ${
                  file === currentFile
                    ? "bg-gray-700 text-white font-semibold"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {file}
              </button>
            ))}
          </div>
        </div>
        <div className=" flex w-[65%]">
          <InputField value={files[currentFile]} onChange={handleInputChange} />
        </div>
        <div className="w-[20%]">
          <h1 className="m-5">Commit message</h1>
        </div>
      </div>
    </>
  );
};

export default page;
