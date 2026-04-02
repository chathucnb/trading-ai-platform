import {
  NextjsIcon,
  SvelteIcon,
  ReactIcon,
  NuxtIcon,
  AstroIcon,
  PythonIcon,
} from "./icons";

const features = [
  {
    icon: "🔗",
    text: (
      <>
        <strong>Deploy automatically from git</strong> or with{" "}
        <strong>our CLI</strong>
      </>
    ),
  },
  {
    icon: "📦",
    text: (
      <>
        <strong>Wide range</strong> support for the most popular frameworks
      </>
    ),
  },
  {
    icon: "👁",
    text: (
      <>
        <strong>Previews</strong> for every push
      </>
    ),
  },
  {
    icon: "🔒",
    text: (
      <>
        <strong>Automatic HTTPS</strong> for all your domains
      </>
    ),
  },
];

const templates = [
  { name: "Next.js Templates", Icon: NextjsIcon },
  { name: "Svelte Templates", Icon: SvelteIcon },
  { name: "React Templates", Icon: ReactIcon },
  { name: "Nuxt Templates", Icon: NuxtIcon },
  { name: "Astro Templates", Icon: AstroIcon },
  { name: "Python Templates", Icon: PythonIcon },
];

export default function DeployTemplates() {
  return (
    <section className="bg-black py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left: Features */}
          <div className="flex flex-col justify-center">
            <h2 className="text-[32px] font-semibold leading-tight tracking-[-1.28px] text-white mb-8">
              Deploy your first app in seconds.
            </h2>
            <div className="space-y-5">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-sm mt-0.5">{feature.icon}</span>
                  <p className="text-sm text-[#888] leading-5">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Template grid */}
          <div className="grid grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
            {templates.map((template) => (
              <a
                key={template.name}
                href="#"
                className="bg-[#0a0a0a] p-6 flex flex-col items-center justify-center gap-4 hover:bg-[#111] transition-colors group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <template.Icon className="w-10 h-10" />
                </div>
                <span className="text-sm font-medium text-[#ededed]">
                  {template.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
