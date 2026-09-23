/** @type {import('next').NextConfig} */
const nextConfig = {
  // The social-share thumbnail generator (lib/og.tsx) reads this font file
  // from disk at runtime. Vercel only ships files it can see being used,
  // so list it explicitly or the deployed thumbnails fall back to the
  // default font.
  outputFileTracingIncludes: {
    "/**": ["./assets/fonts/**/*"],
  },
};

export default nextConfig;
