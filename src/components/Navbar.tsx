"use client";

import { useEffect, useState } from "react";
import { VercelLogo, ChevronDownIcon } from "./icons";

const navLinks = [
  { label: "Products", hasDropdown: true },
  { label: "Resources", hasDropdown: true },
  { label: "Solutions", hasDropdown: true },
  { label: "Enterprise", hasDropdown: false, href: "#" },
  { label: "Pricing", hasDropdown: false, href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-16 px-6 flex items-center transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="flex items-center justify-between w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6">
          <a href="#" className="text-white">
            <VercelLogo />
          </a>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href || "#"}
                className="flex items-center gap-1 px-3 py-2 text-sm text-[#a1a1a1] hover:text-white transition-colors"
              >
                {link.label}
                {link.hasDropdown && <ChevronDownIcon className="h-3 w-3" />}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="px-3 py-1.5 text-sm text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            Ask AI
          </a>
          <a
            href="#"
            className="px-3 py-1.5 text-sm text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            Log In
          </a>
          <a
            href="#"
            className="px-3 py-1.5 text-sm text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors"
          >
            Sign Up
          </a>
        </div>
      </nav>
    </header>
  );
}
