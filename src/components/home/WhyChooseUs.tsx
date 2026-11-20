"use client";

import { motion } from "framer-motion";
import {
  BadgeCheckIcon,
  BanknoteIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    Icon: ShieldCheckIcon,
    title: "Secure Payment",
    description:
      "Payments are processed through Stripe with instant confirmation and clear rental terms.",
  },
  {
    Icon: BadgeCheckIcon,
    title: "Verified Owners",
    description:
      "Every owner is reviewed before they can list equipment on GearLoop.",
  },
  {
    Icon: ClockIcon,
    title: "Flexible Periods",
    description:
      "Rent daily, weekly or monthly — and extend or cancel at any time.",
  },
  {
    Icon: BanknoteIcon,
    title: "Affordable Pricing",
    description:
      "Transparent daily rates. No hidden fees unless you choose delivery.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-secondary py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle mx-auto">
            Everything about GearLoop is built around making rentals simple,
            safe and affordable.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.05 * index }}
              className="h-full"
            >
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
