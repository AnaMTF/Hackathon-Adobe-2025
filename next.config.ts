import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sqlite3", "pg-hstore"],
};

export default nextConfig;
