import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["socket.io"],
  reactStrictMode: true
};

export default nextConfig;
