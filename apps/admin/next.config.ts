import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@glotmate/contracts"],
  // Next 16 aksi hâlde her dev açılışında CLAUDE.md üretmeye kalkıyor — bizimki elle yazılı sözleşme
  agentRules: false,
};

export default nextConfig;
