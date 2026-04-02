"use client";

import { ArrowRightIcon } from "./icons";

const cards = [
  {
    title: "Agents",
    description: "Deliver more value to users by executing complex workflows.",
    visual: "chat",
  },
  {
    title: "AI Apps",
    description: "Enrich any product or feature with the latest models and tools.",
    visual: "pills",
    pills: ["Fluid", "AI SDK", "AI Gateway", "Workflow", "Sandbox", "BotID"],
  },
  {
    title: "Web Apps",
    description: "Ship beautiful interfaces that don't compromise speed or functionality.",
    visual: "editor",
  },
  {
    title: "Composable Commerce",
    description: "Increase conversion with fast, branded storefronts.",
    visual: "gallery",
  },
  {
    title: "Multi-tenant Platform",
    description: "Serve millions securely across isolated environments.",
    visual: "domains",
  },
];

function CardVisual({ card }: { card: (typeof cards)[number] }) {
  if (card.visual === "chat") {
    return (
      <div className="mt-4 p-4 rounded-lg bg-black/40">
        <div className="flex items-center gap-2 text-xs text-[#888] mb-3">
          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-[8px]">⚡</span>
          </div>
          Thinking...
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-8 rounded-md bg-white/5 border border-white/10" />
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
              <path d="M1 9L9 5L1 1v3l4 1-4 1v3z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  if (card.visual === "pills" && card.pills) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {card.pills.map((pill) => (
          <span
            key={pill}
            className="px-3 py-1.5 text-xs text-[#a1a1a1] bg-white/5 border border-white/10 rounded-full"
          >
            {pill.includes("SDK") || pill.includes("Gateway") ? (
              <span className="flex items-center gap-1">
                {pill.split(" ")[0]}{" "}
                <span className="px-1 py-0.5 text-[9px] bg-white/10 rounded text-[#666]">
                  {pill.split(" ").slice(1).join(" ")}
                </span>
              </span>
            ) : (
              pill
            )}
          </span>
        ))}
      </div>
    );
  }
  if (card.visual === "editor") {
    return (
      <div className="mt-4 rounded-lg bg-black/40 border border-white/5 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <div className="px-3 py-3 font-mono text-xs text-[#666]">
          <span className="text-[#888]">What will you create?</span>
        </div>
      </div>
    );
  }
  if (card.visual === "gallery") {
    return (
      <div className="mt-4 flex gap-2 justify-center">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-14 h-16 rounded-md bg-gradient-to-b from-white/10 to-white/5 border border-white/10"
          />
        ))}
      </div>
    );
  }
  if (card.visual === "domains") {
    return (
      <div className="mt-4 space-y-2">
        {["me.domain.com", "project.domain.com", "customer.domain.com"].map(
          (domain, i) => (
            <div
              key={domain}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888] bg-black/40 rounded border border-white/5"
            >
              <div
                className={`flex gap-0.5 ${i === 2 ? "" : ""}`}
              >
                {i === 2 ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                  </>
                )}
              </div>
              <span className="flex items-center gap-1">
                {i === 1 && (
                  <svg
                    width="8"
                    height="10"
                    viewBox="0 0 8 10"
                    fill="#888"
                  >
                    <path d="M4 0C2 0 0 1.5 0 4v4c0 1 .5 2 2 2h4c1.5 0 2-1 2-2V4c0-2.5-2-4-4-4z" />
                  </svg>
                )}
                {domain}
              </span>
            </div>
          )
        )}
      </div>
    );
  }
  return null;
}

export default function ProductCards() {
  return (
    <section className="bg-black py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
          {/* Left intro card */}
          <div className="bg-[#0a0a0a] p-8 flex flex-col justify-center">
            <h3 className="text-[32px] font-semibold leading-tight tracking-[-1.28px] text-[#ededed]">
              Your product, delivered.
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#888]">
              Security, speed, and AI included, so you can focus on your user.
            </p>
          </div>

          {/* Card grid */}
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-[#0a0a0a] p-6 hover:bg-[#111] transition-colors group"
            >
              <h3 className="text-2xl font-semibold tracking-[-0.96px] text-[#ededed]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-[#888] leading-5">
                {card.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center mt-3 text-[#888] hover:text-white transition-colors"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </a>
              <CardVisual card={card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
