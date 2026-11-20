"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";

export default function AdminProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <Loader />;

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information." />
      <ProfileCard user={user} />
    </>
  );
}
