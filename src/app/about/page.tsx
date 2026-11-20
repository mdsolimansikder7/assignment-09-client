import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CATEGORIES } from "@/types";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "GearLoop is an equipment rental platform connecting owners and renters.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20">
      <div className="container-page max-w-3xl">
        <h1 className="section-title text-3xl">About GearLoop</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          GearLoop was born from a simple idea: great equipment should not sit
          idle when someone needs it. We are an equipment rental marketplace
          where owners list the gear they own and renters book it by the day,
          week or month.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Our marketplace covers construction, photography, vehicles &
          transportation, agriculture, electronics and event equipment. Whether
          you are a small crew or a large event company, GearLoop helps you find
          the right machine without buying it.
        </p>

        <h2 className="mt-12 font-heading text-2xl font-semibold">
          Our categories
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <li key={category.slug} className="rounded-lg border border-border p-4">
              <p className="font-medium">{category.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
