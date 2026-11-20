import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EquipmentDetails } from "@/components/equipment/EquipmentDetails";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let title = "Equipment Details";

  try {
    const res = await fetch(`${apiUrl}/equipment/${id}`);
    if (res.ok) {
      const json = await res.json();
      title = json?.data?.name || "Equipment Details";
    }
  } catch {
  }

  return {
    title,
  };
}

export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <EquipmentDetails id={id} />
      </main>
      <Footer />
    </div>
  );
}
