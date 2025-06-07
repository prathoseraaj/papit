import Image from "next/image";
import React from "react";
import { LuSendHorizontal } from "react-icons/lu";

const Chatbot = () => {
  return (
    <div className="flex flex-col">
      {/* Chatbot Name */}
      <div className="flex group items-center m-5 flex-row h-[25px] relative group ">
        <div className="relative cursor-pointer pointer-events-auto ">
          <Image src="/image.png" alt="gemini logo" height={25} width={25} />
        </div>
        <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-1000 erase-out">
          <h1>BroDoc</h1>
        </div>
      </div>
      {/* Chat Window */}
      <div className="h-[75vh]"></div>
      {/* Chatbot Input */}
      <div
        className="flex items-center px-4 py-2 border-t"
        style={{ borderColor: "#252525" }}
      >
        <div className="flex items-center w-full relative">
          <input
            type="text"
            className="w-full pl-4 pr-10 py-2 rounded-md bg-[#131313] text-white border outline-none"
            style={{ borderColor: "#252525" }}
            placeholder="What do you want?"
          />
          <LuSendHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-300 hover:text-white" />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
