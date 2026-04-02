"use client";

import { VercelTriangle } from "./icons";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg-dashed" />

      <div className="relative z-10 flex flex-col items-center pt-8 pb-0">
        {/* Announcement banner */}
        <div className="flex items-center gap-3 mb-12">
          <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
            Events
          </span>
          <span className="text-sm text-[#a1a1a1]">
            Ship 26 is coming to 5 cities
          </span>
          <a
            href="#"
            className="flex items-center gap-1 px-3 py-1 text-sm text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
          >
            Save the date
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 2L8 6L4 10" />
            </svg>
          </a>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-center text-[#ededed] max-w-3xl">
          Build and deploy on the AI Cloud.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base leading-6 text-[#888] text-center max-w-xl">
          Vercel provides the developer tools and cloud infrastructure to build,
          scale, and secure a faster, more personalized web.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center gap-4 mt-8">
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <VercelTriangle className="h-3.5 w-3.5" />
            Start Deploying
          </a>
          <a
            href="#"
            className="px-4 py-2.5 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            Get a Demo
          </a>
        </div>

        {/* Hero visual - Prism with colorful gradient */}
        <div className="relative mt-12 w-full max-w-[1200px] h-[400px] flex items-center justify-center overflow-hidden">
          {/* Colorful gradient background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[800px] h-[400px] rounded-full opacity-60 blur-[80px]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0,223,216,0.4) 0%, rgba(0,112,243,0.3) 25%, rgba(121,40,202,0.3) 50%, rgba(255,50,50,0.3) 75%, rgba(255,165,0,0.2) 100%)",
              }}
            />
          </div>

          {/* Radiating lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-[1px] h-[500px] bg-gradient-to-b from-transparent via-white/5 to-transparent origin-bottom"
                style={{
                  transform: `rotate(${i * 10}deg)`,
                  bottom: "20%",
                }}
              />
            ))}
          </div>

          {/* Triangle prism */}
          <div className="relative z-10">
            <svg
              width="160"
              height="140"
              viewBox="0 0 160 140"
              fill="none"
              className="drop-shadow-2xl"
            >
              <defs>
                <linearGradient
                  id="prismGrad"
                  x1="80"
                  y1="0"
                  x2="80"
                  y2="140"
                >
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="#888" />
                </linearGradient>
              </defs>
              <path
                d="M80 0L160 140H0L80 0Z"
                fill="url(#prismGrad)"
                opacity="0.9"
              />
              {/* Prism internal lines for 3D effect */}
              <path d="M80 0L120 140" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
              <path
                d="M80 0L40 140"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </svg>
          </div>

          {/* Concentric circles */}
          <div className="absolute inset-0 flex items-end justify-center pb-[10%]">
            {[200, 300, 400, 500].map((size, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/5"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  bottom: `-${size / 4}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
