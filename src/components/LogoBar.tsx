"use client";

import { useState } from "react";
import { SparkleIcon } from "./icons";

const tabs = ["AI Apps", "Web Apps", "Ecommerce", "Marketing", "Platforms"];

const logos = [
  "Runway", "Leonardo.AI", "Perplexity", "Zapier", "Sonos",
  "Under Armour", "Washington Post", "HashiCorp", "Nintendo",
];

export default function LogoBar() {
  const [activeTab, setActiveTab] = useState("AI Apps");

  return (
    <section className="relative bg-black py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Logo grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12 opacity-50">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-sm text-[#666] font-medium tracking-wide"
            >
              {logo}
            </span>
          ))}
        </div>

        {/* Tabs + CTA row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-[#888] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
          >
            Deploy AI Apps in seconds
            <SparkleIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
