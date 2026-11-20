import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Banner } from "@/components/home/Banner";
import { FeaturedEquipment } from "@/components/home/FeaturedEquipment";
import { Categories } from "@/components/home/Categories";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { HowItWorks } from "@/components/home/HowItWorks";
import { RecentlyAdded } from "@/components/home/RecentlyAdded";
import { Reviews } from "@/components/home/Reviews";

export const metadata: Metadata = {
  title: {
    absolute: "GearLoop - Rent the gear you need",
  },
  description:
    "Rent the gear you need. Loop it back. GearLoop is the equipment rental marketplace for owners and renters.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Banner />
        <FeaturedEquipment />
        <Categories />
        <WhyChooseUs />
        <Reviews />
        <HowItWorks />
        <RecentlyAdded />
      </main>
      <Footer />
    </div>
  );
}
