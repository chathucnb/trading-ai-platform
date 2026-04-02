import { VercelTriangle } from "./icons";

export default function CTASection() {
  return (
    <section className="bg-black py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
          <div className="bg-[#0a0a0a] p-10 flex flex-col items-center justify-center col-span-1 md:col-span-2">
            <a
              href="#"
              className="flex items-center gap-3 text-4xl font-semibold text-white hover:opacity-80 transition-opacity"
            >
              Start Deploying
              <VercelTriangle className="h-8 w-8" />
            </a>
          </div>
          <div className="bg-[#0a0a0a] p-10 flex flex-col items-center justify-center">
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors"
            >
              Talk to an Expert
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                >
                  <path d="M3 1L8 5L3 9" />
                </svg>
              </div>
            </a>
          </div>
          <div className="bg-[#0a0a0a] p-10 flex flex-col items-center justify-center">
            {/* Empty space for visual balance */}
          </div>
          <div className="bg-[#0a0a0a] p-10 flex flex-col items-center justify-center col-span-1 md:col-span-2">
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-[#888] hover:text-white transition-colors"
            >
              Get an Enterprise trial
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                >
                  <path d="M3 1L8 5L3 9" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
