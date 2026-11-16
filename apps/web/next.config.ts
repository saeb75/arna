import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@glotmate/contracts"],
  // Docker imajı (Coolify): `.next/standalone` yalnız çalışmak için gereken dosyaları taşır.
  // İz kökü monorepo köküdür — bağımlılıklar oraya hoist ediliyor, contracts da orada.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
