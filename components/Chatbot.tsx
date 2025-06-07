"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { LuSendHorizontal } from "react-icons/lu";

type Message = {
  text: string;
  sender: "user" | "bot";
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Failed to get response", sender: "bot" },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="flex flex-col h-[94vh] border-l border-[#252525] bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-[#252525]">
        <Image src="/image.png" alt="Gemini logo" height={25} width={25} />
        <h1 className="ml-2 text-white text-sm font-semibold">BroDoc</h1>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin scrollbar-thumb-[#2e2e2e]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-[#252525] text-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-2 border-t border-[#252525]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What do you want?"
            className="w-full py-2 min-h-[40px] pl-4 pr-10 bg-[#131313] text-white text-sm border border-[#252525] rounded-md outline-none"
          />
          <LuSendHorizontal
            onClick={handleSendMessage}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white cursor-pointer text-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
  