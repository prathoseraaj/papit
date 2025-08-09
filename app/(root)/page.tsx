"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabaseClient";
import InputField from "@/components/InputField";
import Chatbot from "@/components/Chatbot";
import CommitField from "@/components/CommitField";
import { VscGitCommit } from "react-icons/vsc";
import Image from "next/image";
import PapitLoader from "@/components/PapitLoader";

const Page = () => {
  const [fileContent, setFileContent] = useState("");
  const [commitfield, setCommitfield] = useState(true);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.push('/signUp');
          return;
        }

        if (!session) {
          // No active session, redirect to signup
          router.push('/signUp');
          return;
        }

        // User is authenticated, set username from session
        setUserName(session.user.user_metadata?.username || session.user.email);
        setLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push('/signUp');
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/signUp');
      } else if (session) {
        setUserName(session.user.user_metadata?.username || session.user.email);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleStartCollab = () => {
    const randomRoom = Math.random().toString(36).substr(2, 9);
    router.push(`/collaborative/${randomRoom}`);
  };

  const handleInputChange = (text: string) => {
    setFileContent(text);
  };

  const handleCommitSelect = (content: string) => {
    setFileContent(content);
  };

  // Show loading spinner while checking authentication

if (loading) {
  return <PapitLoader/>;
}

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-row flex-1 overflow-hidden">
        <div className="flex h-full w-[80%]">
          <div className="w-full">
            <InputField
              value={fileContent}
              onChange={handleInputChange}
              userName={userName}
              setUserName={setUserName}
              onStartCollab={handleStartCollab}
              isCollab={false}
            />
          </div>
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