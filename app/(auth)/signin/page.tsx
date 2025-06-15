import React from 'react';

const SignInPage = () => {
  return (
    <div className="flex min-h-screen bg-black text-white">
     
      <div className="w-1/2 flex flex-col justify-center p-20">
        <h1 className="text-6xl font-bold mb-4">Vind</h1>
        <p className="text-xl text-gray-400 mb-8">Your intelligent coding companion</p>
        <ul className="space-y-3 text-gray-300">
          <li>• Multi-file editor with AI assistance</li>
          <li>• Real-time code collaboration</li>
          <li>• Intelligent chatbot integration</li>
        </ul>
      </div>

      
      <div className="w-1/2 flex items-center justify-center bg-gray-900 px-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-6">Sign in to continue coding</p>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
              />
              <span className="absolute right-4 top-3 text-gray-400 cursor-pointer">👁️</span>
            </div>

            <div className="flex justify-between text-sm text-gray-400">
              <label>
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <a href="#" className="hover:underline">Forgot password?</a>
            </div>

            <button className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 font-semibold">
              Sign in
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-600" />
              <span className="mx-2 text-gray-400 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-600" />
            </div>

            <div className="flex justify-between gap-4">
              <button className="w-full py-2 rounded bg-gray-800 border border-gray-700">Google</button>
              <button className="w-full py-2 rounded bg-gray-800 border border-gray-700">GitHub</button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{' '}
            <a href="/signup" className="text-blue-500 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;


