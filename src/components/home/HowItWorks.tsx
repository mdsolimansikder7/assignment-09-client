"use client";

import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ClipboardListIcon,
  CreditCardIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    Icon: ClipboardListIcon,
    step: "01",
    title: "Create Account",
    description:
      "Sign up as a renter to book gear, or as an owner to list your equipment.",
  },
  {
    Icon: SearchIcon,
    step: "02",
    title: "Browse & Book",
    description:
      "Search the catalogue, check availability and pick your rental dates.",
  },
  {
    Icon: CreditCardIcon,
    step: "03",
    title: "Pay & Collect",
    description:
      "Pay securely by card and the owner confirms your booking — you're ready to go.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle mx-auto">
            From search to pickup in three simple steps.
          </p>
        </div>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute top-10 right-[16%] left-[16%] hidden h-px bg-border md:block"
          />
          {STEPS.map(({ Icon, step, title, description }, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative"
            >
              <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
                <Icon className="size-8" />
              </div>
              <span className="absolute top-0 right-0 font-heading text-5xl font-bold text-primary/15">
                {step}
              </span>
              <h3 className="mt-6 font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/register">
            <button className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
              Start Renting
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
