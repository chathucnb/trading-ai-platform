"use client";

import { VercelTriangle } from "./icons";

export default function GlobalNetwork() {
  return (
    <section className="bg-black py-24 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Globe visualization */}
        <div className="relative h-[500px] flex items-center justify-center mb-16">
          {/* Globe wireframe */}
          <div className="relative w-[600px] h-[400px]">
            <svg
              viewBox="0 0 600 400"
              fill="none"
              className="w-full h-full"
            >
              {/* Latitude lines */}
              {[100, 150, 200, 250, 300].map((y, i) => (
                <ellipse
                  key={`lat-${i}`}
                  cx="300"
                  cy={y}
                  rx={280 - Math.abs(y - 200) * 0.8}
                  ry={20 - Math.abs(y - 200) * 0.05}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Longitude arcs */}
              {[0, 30, 60, 90, 120, 150].map((angle, i) => (
                <ellipse
                  key={`lon-${i}`}
                  cx="300"
                  cy="200"
                  rx={Math.sin((angle * Math.PI) / 180) * 280}
                  ry="160"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Connection lines */}
              <path
                d="M180 120 Q300 80 420 130"
                stroke="rgba(59,130,246,0.5)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M140 200 Q300 160 460 200"
                stroke="rgba(59,130,246,0.3)"
                strokeWidth="1"
                fill="none"
              />
            </svg>

            {/* Node points with Vercel logos */}
            {[
              { x: 30, y: 25 },
              { x: 55, y: 20 },
              { x: 70, y: 30 },
              { x: 40, y: 50 },
              { x: 75, y: 55 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-[#111] border border-white/10"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <VercelTriangle className="h-3 w-3 text-[#888]" />
              </div>
            ))}
          </div>

          {/* Play button */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <button className="w-8 h-8 rounded-md bg-white/10 border border-white/10 flex items-center justify-center text-[#888] hover:text-white transition-colors">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <rect x="0" y="0" width="3" height="12" rx="1" />
                <rect x="7" y="0" width="3" height="12" rx="1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center">
          <h2 className="text-[32px] font-semibold leading-tight tracking-[-1.28px]">
            <span className="text-white font-bold">
              Deploy once, deliver everywhere.
            </span>{" "}
            <span className="text-[#888]">
              When you push code to Vercel, we make it instantly available
              across the globe.
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
