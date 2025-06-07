import Image from "next/image";
import React from "react";

const Chatbot = () => {
  return (
    <div>
      {/* Chatbot Name */}
      <div className="flex group items-center m-5 flex-row relative group ">
        <div className="relative cursor-pointer pointer-events-auto ">
          <Image src="/image.png" alt="gemini logo" height={25} width={25} />
        </div>
        <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-1000 erase-out">
          <h1>BroDoc</h1>
        </div>
      </div>
      {/* Chat Window */}
      <div>

      </div>
      {/* Chatbot Input */}
      <div>

      </div>
    </div>
  );
};

export default Chatbot;
