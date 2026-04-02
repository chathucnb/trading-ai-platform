import { BuildingIcon, ShieldIcon } from "./icons";

export default function ScaleSection() {
  return (
    <section className="bg-black py-24">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-[40px] md:text-[48px] font-semibold leading-tight tracking-[-2px] text-white inline-flex flex-wrap items-center justify-center gap-3">
          Scale your
          <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/10 rounded-full text-[#ededed] text-base font-normal">
            <BuildingIcon className="h-4 w-4" />
            Enterprise
          </span>
          without compromising
          <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/10 rounded-full text-[#ededed] text-base font-normal">
            <ShieldIcon className="h-4 w-4" />
            Security
          </span>
        </h2>
      </div>
    </section>
  );
}
