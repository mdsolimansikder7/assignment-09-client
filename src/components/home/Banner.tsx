"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BanknoteIcon,
  ShieldCheckIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function Banner() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.35),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
              <StarIcon className="size-3.5 fill-primary text-primary" />
              Rated 4.9 by 2,000+ happy renters
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-heading text-4xl leading-[1.08] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Rent the gear you need.
            <br />
            Loop it back.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
          >
            GearLoop is the rental marketplace for owners and renters of
            construction, photography, vehicles, agriculture and event
            equipment. Book in minutes, pay securely, get on site.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
              render={
                <Link href="/equipment">
                  Browse Equipment
                  <ArrowRightIcon className="size-4" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              render={
                <Link href="/how-it-works">How It Works</Link>
              }
            />
          </motion.div>

          <motion.div
            variants={item}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8"
          >
            {[
              { Icon: BanknoteIcon, value: "12K+", label: "Rentals Done" },
              { Icon: UsersIcon, value: "350+", label: "Verified Owners" },
              { Icon: BadgeCheckIcon, value: "4.9/5", label: "Average Rating" },
            ].map(({ Icon, value, label }) => (
              <div key={label}>
                <div className="flex items-center gap-2 font-heading text-2xl font-bold text-white">
                  <Icon className="size-5 text-primary" />
                  {value}
                </div>
                <p className="mt-1 text-xs text-white/60">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80"
              alt="Construction tools being rented on GearLoop"
              width={800}
              height={800}
              priority
              className="h-auto w-full object-cover"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute -bottom-6 -left-4 rounded-2xl border border-border bg-card p-4 shadow-xl sm:-left-8"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Concrete Mixer</p>
                <p className="font-heading text-xl font-bold text-primary">$185</p>
                <p className="text-xs text-muted-foreground">/ day</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <ShieldCheckIcon className="size-3.5" /> Fully booked
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
