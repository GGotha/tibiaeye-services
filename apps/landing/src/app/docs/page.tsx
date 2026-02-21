import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AlertTriangle, Book, Download, Play, Settings, Zap } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    icon: Download,
    title: "Instalação",
    description: "Como baixar e instalar o TibiaEye no seu computador.",
    href: "/docs/installation",
  },
  {
    icon: Settings,
    title: "Configuração",
    description: "Configure targeting, loot, spells e healing do seu bot.",
    href: "/docs/configuration",
  },
  {
    icon: Play,
    title: "Primeiros Passos",
    description: "Guia rápido para começar a usar o TibiaEye.",
    href: "/docs/getting-started",
  },
  {
    icon: AlertTriangle,
    title: "Requisitos",
    description: "Requisitos de sistema e configuração de tela.",
    href: "/docs/requirements",
  },
  {
    icon: Book,
    title: "Dashboard",
    description: "Como usar o dashboard para monitorar suas hunts.",
    href: "/docs/dashboard",
  },
  {
    icon: Zap,
    title: "API",
    description: "Documentação da API para integrações customizadas.",
    href: "/docs/api",
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Documentação</h1>
          <p className="text-slate-400 text-lg">
            Tudo que você precisa para começar a usar o TibiaEye.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all group"
            >
              <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <section.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{section.title}</h2>
              <p className="text-slate-400">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
