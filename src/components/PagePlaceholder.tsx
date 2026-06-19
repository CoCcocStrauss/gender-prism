"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  status,
  primaryAction,
  secondaryAction,
}: PagePlaceholderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.main
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex min-h-screen items-center justify-center bg-background px-6 py-24 text-foreground"
    >
      <section className="w-full max-w-[680px]">
        <p className="font-serif-display text-xl italic leading-none text-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-10 text-[32px] font-light leading-[1.3] tracking-[-0.03em] text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-5 max-w-[560px] text-base leading-[1.8] text-muted">
          {description}
        </p>
        <div className="mt-16 border-t border-border pt-8">
          <div>
            <span className="text-sm uppercase tracking-widest text-muted">
              Scaffold status
            </span>
            <p className="mt-3 text-sm leading-[1.8] text-foreground">{status}</p>
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {secondaryAction ? (
              <Link
                href={secondaryAction.href}
                className="rounded-lg border border-border px-6 py-4 text-center text-sm font-medium leading-none text-foreground transition-opacity duration-200 hover:opacity-85"
              >
                {secondaryAction.label}
              </Link>
            ) : null}
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="rounded-lg bg-accent px-6 py-4 text-center text-sm font-medium leading-none text-background transition-opacity duration-200 hover:opacity-85"
              >
                {primaryAction.label}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
