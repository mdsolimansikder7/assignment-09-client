import type { Metadata } from "next";

import { HowItWorks } from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works",
};

export default function HowItWorksPage() {
  return (
    <main className="flex-1">
      <section className="py-20">
        <div className="container-page">
          <HowItWorks />
        </div>
      </section>
    </main>
  );
}
