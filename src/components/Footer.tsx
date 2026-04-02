import {
  VercelTriangle,
  GitHubIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "./icons";

const footerSections = [
  {
    title: "Get Started",
    links: ["Templates", "Supported frameworks", "Marketplace", "Domains"],
  },
  {
    title: "Build",
    links: [
      "Next.js on Vercel",
      "Turborepo",
      "v0",
      "Content delivery network",
      "Fluid compute",
      "CI/CD",
      "Observability",
      { text: "AI Gateway", badge: "NEW" },
      { text: "Vercel Agent", badge: "NEW" },
    ],
  },
  {
    title: "Scale",
    links: ["Content delivery network", "Fluid compute", "CI/CD", "Observability", { text: "AI Gateway", badge: "NEW" }],
  },
  {
    title: "Secure",
    links: [
      "Platform security",
      "Web Application Firewall",
      "Bot management",
      "BotID",
      { text: "Sandbox", badge: "NEW" },
    ],
  },
  {
    title: "Resources",
    links: [
      "Pricing",
      "Customers",
      "Enterprise",
      "Articles",
      "Startups",
      "Solution partners",
    ],
  },
  {
    title: "Learn",
    links: ["Docs", "Blog", "Changelog", "Knowledge Base", "Academy", "Community"],
  },
];

const bottomSections = [
  {
    title: "Frameworks",
    links: ["Next.js", "Nuxt", "Svelte", "Nitro", "Turbo"],
  },
  {
    title: "SDKs",
    links: [
      "AI SDK",
      { text: "Workflow DevKit", badge: "NEW" },
      "Flags SDK",
      "Chat SDK",
      { text: "Streamdown AI", badge: "NEW" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      "Composable commerce",
      "Multi-tenant platforms",
      "Web apps",
      "Marketing sites",
      "Platform engineers",
      "Design engineers",
    ],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Help", "Press", "Legal", "Privacy Policy"],
  },
];

type FooterLink = string | { text: string; badge: string };

function FooterLink({ link }: { link: FooterLink }) {
  const text = typeof link === "string" ? link : link.text;
  const badge = typeof link === "string" ? null : link.badge;

  return (
    <a
      href="#"
      className="block text-sm text-[#888] hover:text-white transition-colors py-1"
    >
      {text}
      {badge && (
        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-medium bg-white/10 text-[#666] rounded uppercase">
          {badge}
        </span>
      )}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 pt-10 pb-6 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.links.map((link, i) => (
                  <FooterLink
                    key={i}
                    link={link}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pt-8 border-t border-white/5">
          {bottomSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.links.map((link, i) => (
                  <FooterLink
                    key={i}
                    link={link}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Community + Social */}
          <div>
            <h4 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider mb-4">
              Community
            </h4>
            <div className="space-y-1">
              <FooterLink link="Open source program" />
              <FooterLink link="Events" />
              <FooterLink link="Shipped on Vercel" />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-[#888] hover:text-white transition-colors">
                <GitHubIcon className="h-4 w-4" />
              </a>
              <a href="#" className="text-[#888] hover:text-white transition-colors">
                <LinkedInIcon className="h-4 w-4" />
              </a>
              <a href="#" className="text-[#888] hover:text-white transition-colors">
                <XIcon className="h-4 w-4" />
              </a>
              <a href="#" className="text-[#888] hover:text-white transition-colors">
                <YouTubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Vercel logo */}
          <div className="flex justify-end items-start">
            <VercelTriangle className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-[#666]">
            <span className="w-2 h-2 rounded-full bg-[#666]" />
            NO STATUS AVAILABLE
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded text-[#666] hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="1" y="1" width="5" height="5" rx="1" />
                <rect x="8" y="1" width="5" height="5" rx="1" />
                <rect x="1" y="8" width="5" height="5" rx="1" />
                <rect x="8" y="8" width="5" height="5" rx="1" />
              </svg>
            </button>
            <button className="p-1.5 rounded text-[#666] hover:text-white transition-colors">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="7" cy="7" r="4" />
                <path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.5 2.5l.7.7M10.8 10.8l.7.7M2.5 11.5l.7-.7M10.8 3.2l.7-.7" />
              </svg>
            </button>
            <button className="p-1.5 rounded text-[#666] hover:text-white transition-colors">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
              >
                <path d="M7 0C3.1 0 0 3.1 0 7s3.1 7 7 7c.4 0 .7-.3.7-.7 0-.2-.1-.3-.1-.5-.1-.2-.2-.4-.2-.7 0-.7.6-1.3 1.3-1.3H10c2.2 0 4-1.8 4-4 0-3.5-3.1-6.8-7-6.8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
