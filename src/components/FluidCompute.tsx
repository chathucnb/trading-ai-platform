export default function FluidCompute() {
  return (
    <section className="bg-black py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
          {/* Left content */}
          <div className="bg-[#0a0a0a] p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-sm text-[#888] mb-4">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <path d="M5 8h6M8 5v6" />
              </svg>
              Fluid Compute
            </div>
            <h2 className="text-[32px] font-semibold leading-tight tracking-[-1.28px] text-white">
              A compute model for all workloads. With Active CPU pricing.
            </h2>
            <a
              href="#"
              className="inline-flex items-center mt-6 px-4 py-2 text-sm text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors w-fit"
            >
              Learn more
            </a>
          </div>

          {/* Right: Chart visualization */}
          <div className="bg-[#0a0a0a] p-10 flex items-center justify-center">
            <div className="w-full">
              {/* Chart header */}
              <div className="flex items-center justify-between mb-4 text-xs text-[#666]">
                <span>Active</span>
                <span className="text-[#888] bg-white/5 px-2 py-0.5 rounded">
                  idle - no charge
                </span>
                <span>Active</span>
              </div>

              {/* Chart bars */}
              <div className="space-y-3">
                {[
                  { color: "#3b82f6", segments: [80, 0, 50] },
                  { color: "#ec4899", segments: [60, 30, 70] },
                  { color: "#f97316", segments: [40, 0, 60] },
                  { color: "#22c55e", segments: [70, 20, 40] },
                  { color: "#ef4444", segments: [50, 0, 80] },
                ].map((bar, i) => (
                  <div key={i} className="flex items-center gap-1 h-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${bar.segments[0]}%`,
                        backgroundColor: bar.color,
                      }}
                    />
                    {bar.segments[1] > 0 && (
                      <div
                        className="h-full rounded-full border border-dashed opacity-30"
                        style={{
                          width: `${bar.segments[1]}%`,
                          borderColor: bar.color,
                        }}
                      />
                    )}
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${bar.segments[2]}%`,
                        backgroundColor: bar.color,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
