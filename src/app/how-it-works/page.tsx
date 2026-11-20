import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works",
};

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20">
      <div className="container-page">
        <HowItWorks />
      </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
