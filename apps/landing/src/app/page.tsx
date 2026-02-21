import { CTA } from "@/components/landing/cta";
import { FAQ } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LiveDemo } from "@/components/landing/live-demo";
import { PricingTable } from "@/components/landing/pricing-table";
import { Requirements } from "@/components/landing/requirements";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { WhatIsIt } from "@/components/landing/what-is-it";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <WhatIsIt />
      <HowItWorks />
      <Features />
      <LiveDemo />
      <Requirements />
      <Stats />
      <PricingTable />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
