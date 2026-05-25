"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { UserPlus, Globe, Tag, BarChart3, Wallet } from "lucide-react";

const cardIcons = [UserPlus, Globe, Tag, BarChart3, Wallet];
const cardKeys = ["card1", "card2", "card3", "card4", "card5"] as const;

export function HorizontalScroll() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { ref: revealRef, isRevealed } = useReveal();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // On mobile, cards are stacked vertically so no horizontal scroll needed
  const x = useTransform(scrollYProgress, [0.1, 0.8], ["5%", "-60%"]);

  const cards = cardKeys.map((key, i) => {
    const Icon = cardIcons[i];
    return {
      title: t[`${key}Title` as keyof typeof t],
      desc: t[`${key}Desc` as keyof typeof t],
      icon: Icon,
      index: i + 1,
    };
  });

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28">
      <div ref={revealRef} className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
            <span className="gradient-text">{t.card1Title}</span>
            {" → "}
            <span className="gradient-text">{t.card5Title}</span>
          </h2>
        </motion.div>
      </div>

      {/* Horizontal scroll container - vertical on mobile, horizontal on desktop */}
      <div className="horizontal-scroll-container overflow-x-auto md:overflow-x-visible pb-4">
        <motion.div
          style={{ x }}
          className="flex flex-col gap-6 px-4 sm:px-8 md:flex-row md:flex-nowrap"
        >
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isRevealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card group relative flex w-full flex-col gap-4 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-electric-blue/30 md:min-w-[340px] md:max-w-[320px] md:flex-shrink-0"
              >
                {/* Step number */}
                <div className="absolute top-4 text-4xl font-black text-white/[0.03]">
                  0{card.index}
                </div>

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric-blue/10 text-electric-blue-light transition-colors group-hover:bg-electric-blue/20">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.desc}</p>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-electric-blue via-electric-blue-light to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
