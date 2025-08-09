"use client";

import { useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import InputField from "@/components/InputField";
import Link from "next/link";
import { supabase } from '@/libs/supabaseClient';

export default function CollaborativeRoomPage() {
  const params = useParams<{ room: string }>();
  const room = params?.room;
  const searchParams = useSearchParams();
  const [content, setContent] = useState("");
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Automatically get username from authenticated user
  useEffect(() => {
    const getUserName = async () => {
      try {
        // First check if username is in URL params
        const urlUserName = searchParams?.get("name");
        if (urlUserName && urlUserName.trim()) {
          setUserName(urlUserName.trim());
          setIsLoading(false);
          return;
        }

        // Get current authenticated user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setUserName("Anonymous User");
          setIsLoading(false);
          return;
        }

        if (user) {
          // Try to get name from user metadata or email
          const displayName = 
            user.user_metadata?.full_name || 
            user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'Anonymous User';
          
          setUserName(displayName);
        } else {
          // No authenticated user
          setUserName("Anonymous User");
        }
      } catch (error) {
        console.error('Error getting user info:', error);
        setUserName("Anonymous User");
      } finally {
        setIsLoading(false);
      }
    };

    getUserName();
  }, [searchParams]);

  // Don't render until we have a room and username is loaded
  if (!room || isLoading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Setting up collaboration...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center py-4 px-8 bg-[#131313]">
        <h1 className="text-white text-xl font-bold">
          Collaborative Room: <span className="text-[#4ECDC4]">{room}</span>
          {userName && (
            <span className="text-gray-400 text-sm ml-4">
              Welcome, {userName}!
            </span>
          )}
        </h1>
        <Link
          href="/"
          className="bg-[#4ECDC4] px-4 py-2 rounded text-gray-900 font-semibold hover:bg-[#38b7a7] transition-colors"
        >
          Back to Single Editor
        </Link>
      </div>
      <div className="mx-auto" style={{ maxWidth: 1400 }}>
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