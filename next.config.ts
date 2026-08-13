import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "*.trycloudflare.com"],
  experimental: {},
  async headers() {
    const marketingSources = ["/", "/hion", "/solutions", "/industries/education", "/company", "/contact", "/privacy"];
    const scriptPolicy = process.env.NODE_ENV === "development" ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'";
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Content-Security-Policy", value: "frame-ancestors *" },
        { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
      ]
    }, ...marketingSources.map((source) => ({
      source,
      headers: [
        { key: "Content-Security-Policy", value: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; ${scriptPolicy}; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    }))];
  }
};

export default nextConfig;
