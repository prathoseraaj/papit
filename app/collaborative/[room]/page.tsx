"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import InputField from "@/components/InputField";
import Link from "next/link";

export default function CollaborativeRoomPage() {
  const params = useParams<{ room: string }>();
  const room = params?.room;
  const search = useSearchParams();
  const [content, setContent] = useState("");
  const [userName, setUserName] = useState<string | undefined>(
    search?.get("name") || undefined
  );

  // If userName is not present, prompt for it (handled in InputField as well)
  if (!room) return null;

  return (
    <div>
      <div className="flex justify-between items-center py-4 px-8 bg-[#131313]">
        <h1 className="text-white text-xl font-bold">
          Collaborative Room: <span className="text-[#4ECDC4]">{room}</span>
        </h1>
        <Link
          href="/"
          className="bg-[#4ECDC4] px-4 py-2 rounded text-gray-900 font-semibold hover:bg-[#38b7a7] transition-colors"
        >
          Back to Single Editor
        </Link>
      </div>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <InputField
          value={content}
          onChange={setContent}
          isCollab={true}
          roomId={room}
          userName={userName}
          setUserName={setUserName}
        />
      </div>
    </div>
  );
}