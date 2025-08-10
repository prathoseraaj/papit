"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import InputField from "@/components/InputField";
import Link from "next/link";
import { supabase } from "@/libs/supabaseClient";

export default function CollaborativeRoomPage() {
  const params = useParams<{ room: string }>();
  const room = params?.room;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Store the current URL for redirect after login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User just signed in, get their info
          await getUserName();
        } else if (event === 'SIGNED_OUT') {
          router.push('/signIn');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // Get username function
  const getUserName = async () => {
    try {
      // First check if username is in URL params
      const urlUserName = searchParams?.get("name");
      if (urlUserName && urlUserName.trim()) {
        setUserName(urlUserName.trim());
        setIsLoading(false);
        return;
      }

      // Check for active session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("No active session, redirecting to signIn");
        // Store current URL before redirecting
        if (typeof window !== 'undefined') {
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
        }
        router.push('/signIn');
        return;
      }

      // Get user data
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        router.push('/signIn');
        return;
      }

      // Check if user has a username in metadata
      if (user.user_metadata?.username) {
        setUserName(user.user_metadata.username);
        setIsLoading(false);
      } else {
        // No username found, redirect to signin/profile setup
        console.log("No username found in user metadata");
        if (typeof window !== 'undefined') {
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
        }
        router.push('/signIn');
        return;
      }
    } catch (error) {
      console.error("Error in getUserName:", error);
      router.push('/signIn');
      return;
    }
  };

  // Initial load
  useEffect(() => {
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

  // If no userName at this point, show error
  if (!userName) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to join the collaboration room.</p>
          <Link
            href="/signIn"
            className="bg-[#4ECDC4] px-6 py-2 rounded text-gray-900 font-semibold hover:bg-[#38b7a7] transition-colors"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('redirectAfterLogin', window.location.pathname);
              }
            }}
          >
            Sign In
          </Link>
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