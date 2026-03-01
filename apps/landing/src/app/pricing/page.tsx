import { FAQ } from "@/components/landing/faq";
import { PricingTable } from "@/components/landing/pricing-table";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <div className="py-16 text-center px-6">
        <p className="text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium mb-5">
          Pricing
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6">
          Preços
        </h1>
        <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
          Escolha o plano ideal para suas necessidades.
        </p>
      </div>
      <PricingTable />
      <FAQ />
      <Footer />
    </main>
  );
}
