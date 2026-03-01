import { Eye, Github, MessageCircle, Twitter } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Docs", href: "/docs" },
    { name: "Changelog", href: "/changelog" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/tibiaeye", label: "Twitter" },
  { icon: Github, href: "https://github.com/tibiaeye", label: "GitHub" },
  { icon: MessageCircle, href: "https://discord.gg/tibiaeye", label: "Discord" },
];

export function Footer() {
  return (
    <footer className="relative">
      {/* Top divider */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <Eye className="h-4.5 w-4.5 text-[#06060B]" />
              </div>
              <span className="text-lg font-bold text-white tracking-[-0.02em]">TibiaEye</span>
            </Link>
            <p className="text-[#64748B] text-sm leading-relaxed mb-6">
              Bot de Tibia com dashboard em tempo real. Acompanhe suas hunts de qualquer lugar.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                >
                  <link.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-[#94A3B8] font-medium mb-5">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#64748B] hover:text-[#F8FAFC] transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-[#94A3B8] font-medium mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#64748B] hover:text-[#F8FAFC] transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-[#94A3B8] font-medium mb-5">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#64748B] hover:text-[#F8FAFC] transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="section-divider mt-12 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#64748B] text-sm">
            {new Date().getFullYear()} TibiaEye. Todos os direitos reservados.
          </p>
          <p className="text-[#64748B] text-sm">Made with love in Brazil</p>
        </div>
      </div>
    </footer>
  );
}
