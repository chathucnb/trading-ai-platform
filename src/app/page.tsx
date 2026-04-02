import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LogoBar from "@/components/LogoBar";
import ProductCards from "@/components/ProductCards";
import FrameworkSection from "@/components/FrameworkSection";
import ScaleSection from "@/components/ScaleSection";
import GlobalNetwork from "@/components/GlobalNetwork";
import FluidCompute from "@/components/FluidCompute";
import DeployTemplates from "@/components/DeployTemplates";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <LogoBar />
      <ProductCards />
      <FrameworkSection />
      <ScaleSection />
      <GlobalNetwork />
      <FluidCompute />
      <DeployTemplates />
      <CTASection />
      <Footer />
    </main>
  );
}
