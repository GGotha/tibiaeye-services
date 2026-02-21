"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "O que é um pixel bot?",
    answer:
      "Um pixel bot é um tipo de automação que funciona lendo os pixels da tela do jogo em tempo real. Diferente de memory bots, ele não acessa a memória do jogo - apenas analisa a imagem da tela para identificar monstros, itens, HP, mana, etc. e simula inputs de mouse e teclado como um jogador real.",
  },
  {
    question: "Por que preciso deixar a tela do Tibia visível?",
    answer:
      "Como o TibiaEye é um pixel bot, ele precisa 'ver' a tela do jogo para funcionar. Se você minimizar ou cobrir a janela do Tibia, o bot não conseguirá detectar o que está acontecendo. Por isso recomendamos usar um segundo monitor ou uma máquina virtual dedicada.",
  },
  {
    question: "O TibiaEye modifica algum arquivo do jogo?",
    answer:
      "Não. O TibiaEye apenas lê a imagem da tela e simula inputs de mouse/teclado. Ele não injeta código, não modifica memória e não altera nenhum arquivo do cliente do Tibia.",
  },
  {
    question: "Posso acessar o dashboard de outro dispositivo?",
    answer:
      "Sim! O dashboard é 100% web-based. Você pode acessar app.tibiaeye.com de qualquer dispositivo - celular, tablet ou outro computador - e ver suas métricas em tempo real.",
  },
  {
    question: "O que acontece se eu perder a conexão?",
    answer:
      "O bot continua funcionando normalmente no seu computador. Assim que a conexão for reestabelecida, o dashboard sincroniza automaticamente todos os dados da sessão.",
  },
  {
    question: "Posso usar em múltiplos personagens?",
    answer:
      "Depende do seu plano. O plano Starter permite 1 personagem, o Pro permite até 5, e o Enterprise é ilimitado. Você pode gerenciar todos pelo mesmo dashboard.",
  },
  {
    question: "O bot funciona com todas as vocações?",
    answer:
      "Sim! O TibiaEye suporta todas as vocações: Knight, Paladin, Druid e Sorcerer. Você pode configurar spell rotations, healing e targeting específicos para cada vocação.",
  },
  {
    question: "Qual a diferença do plano Pro para o Starter?",
    answer:
      "O plano Pro oferece mais personagens (5 vs 1), histórico mais longo (30 dias vs 7), mapa ao vivo, analytics de loot detalhado, acesso à API e suporte prioritário. Ideal para quem leva o hunt a sério.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim, você pode cancelar a qualquer momento sem multas ou taxas. Após o cancelamento, você continua com acesso até o fim do período pago.",
  },
  {
    question: "O TibiaEye tem suporte?",
    answer:
      "Sim! Oferecemos suporte via Discord para todos os planos. Usuários Pro têm suporte prioritário, e usuários Enterprise têm um canal dedicado com SLA garantido.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-slate-900/50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold mb-4"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Perguntas frequentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            Tudo que você precisa saber sobre o TibiaEye.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-white hover:text-emerald-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
