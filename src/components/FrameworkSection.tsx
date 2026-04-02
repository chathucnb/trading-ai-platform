import { VercelTriangle } from "./icons";

const leftFrameworks = [
  { name: "Svelte", color: "#FF3E00" },
  { name: "Vue", color: "#42B883" },
  { name: "Next.js", color: "#FFFFFF" },
  { name: "Nuxt", color: "#00DC82" },
  { name: "Astro", color: "#FF5D01" },
  { name: "Remix", color: "#3992FF" },
];

const rightInfra = [
  { name: "Edge", icon: "⊡" },
  { name: "Functions", icon: "ƒ" },
  { name: "Storage", icon: "◫" },
  { name: "CDN", icon: "◈" },
];

export default function FrameworkSection() {
  return (
    <section className="bg-black py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: Framework diagram */}
          <div className="relative flex items-center justify-center h-[350px]">
            {/* Framework icons on the left */}
            <div className="absolute left-0 flex flex-col gap-6">
              {leftFrameworks.map((fw) => (
                <div
                  key={fw.name}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-[#111] flex items-center justify-center"
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: fw.color }}
                  />
                </div>
              ))}
            </div>

            {/* Center Vercel logo */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <VercelTriangle className="h-7 w-7 text-black" />
            </div>

            {/* Connection lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 350"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              {leftFrameworks.map((fw, i) => (
                <path
                  key={fw.name}
                  d={`M 40 ${30 + i * 55} Q 120 ${30 + i * 55} 180 175`}
                  stroke={fw.color}
                  strokeWidth="1.5"
                  opacity="0.4"
                  fill="none"
                />
              ))}
              {rightInfra.map((_, i) => (
                <path
                  key={i}
                  d={`M 220 175 Q 300 ${60 + i * 75} 370 ${60 + i * 75}`}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.5"
                  fill="none"
                />
              ))}
            </svg>

            {/* Infrastructure icons on the right */}
            <div className="absolute right-0 flex flex-col gap-6">
              {rightInfra.map((infra) => (
                <div
                  key={infra.name}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-[#111] flex items-center justify-center text-xs text-[#888]"
                >
                  {infra.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div className="flex items-center gap-2 text-sm text-[#888] mb-4">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="6" />
                <path d="M8 4v4h3" />
              </svg>
              Framework-Defined Infrastructure
            </div>
            <h2 className="text-[32px] font-semibold leading-tight tracking-[-1.28px] text-[#ededed]">
              <span className="text-white font-bold">
                From code to infrastructure in one git push.
              </span>{" "}
              <span className="text-[#888]">
                Vercel deeply understands your app to provision the right
                resources and optimize for high-performance apps.
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
