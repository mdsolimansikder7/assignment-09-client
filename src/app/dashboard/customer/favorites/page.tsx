import type { Metadata } from "next";

import { FavoritesTable } from "@/components/dashboard/FavoritesTable";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata: Metadata = {
  title: "Favorites",
};

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        title="Favorites"
        description="Equipment you saved — view details or remove any time."
      />
      <FavoritesTable />
    </>
  );
}
