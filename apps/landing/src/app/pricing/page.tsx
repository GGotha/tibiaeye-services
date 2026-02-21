import { FAQ } from "@/components/landing/faq";
import { PricingTable } from "@/components/landing/pricing-table";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <div className="py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Preços</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Escolha o plano ideal para suas necessidades.
        </p>
      </div>
      <PricingTable />
      <FAQ />
      <Footer />
    </main>
  );
}
