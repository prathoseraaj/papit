import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen bg-black-400 text-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Sign in to Papit</h1>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="button"
            className="w-full bg-white text-gray-900 font-semibold py-3 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200 mt-6"
          >
            Sign In
          </button>
        </div>

        <div className="text-center mt-6">
          <a href="#" className="text-gray-400 text-sm hover:text-white hover:underline transition-colors">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  )
}

export default page