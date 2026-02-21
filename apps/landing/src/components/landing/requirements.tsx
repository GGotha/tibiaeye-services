"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Monitor } from "lucide-react";

export function Requirements() {
  return (
    <section className="py-16 bg-slate-900/50">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20"
        >
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Importante: Tela Aberta Necessária
              </h3>
              <p className="text-slate-400 mb-4">
                O TibiaEye é um <strong className="text-white">pixel bot</strong> - ele funciona
                lendo a imagem da tela do jogo em tempo real.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">
                    O Tibia precisa estar rodando e visível na tela
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">Não minimize nem cubra a janela do jogo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Monitor className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">
                    <strong className="text-white">Recomendado:</strong> Use um segundo monitor
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Monitor className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-slate-300">
                    <strong className="text-white">Alternativa:</strong> Use uma máquina virtual
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
