import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // `npm run local` is opened at 127.0.0.1. Next treats that as a different
  // dev origin from localhost and will not serve the client bundle without this.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
