"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import { Package, Users, Headphones, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  icon: LucideIcon;
  end: number;
  suffix: string;
  label: string;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function StatsStripClient({
  labels,
}: Readonly<{
  labels: { parts: string; clients: string; support: string; years: string; aria: string };
}>) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const stats: Stat[] = [
    { icon: Package,    end: 5000,  suffix: "+",  label: labels.parts   },
    { icon: Users,      end: 10,    suffix: "k+", label: labels.clients },
    { icon: Headphones, end: 24,    suffix: "/7", label: labels.support },
    { icon: Award,      end: 15,    suffix: "+",  label: labels.years   },
  ];

  return (
    <motion.section
      ref={ref}
      aria-label={labels.aria}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="relative flex flex-col items-center gap-3 px-6 py-8 text-center"
          >
            {i < stats.length - 1 && (
              <span
                aria-hidden
                className="absolute end-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-neutral-200/80 md:block"
              />
            )}
            <stat.icon
              aria-hidden
              className="size-7 text-accent"
              strokeWidth={1.5}
            />
            <p className="text-3xl font-bold tabular-nums text-primary md:text-4xl">
              {inView ? (
                <CountUp
                  end={stat.end}
                  duration={2}
                  separator=","
                  suffix={stat.suffix}
                  enableScrollSpy={false}
                />
              ) : (
                <span>0{stat.suffix}</span>
              )}
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
