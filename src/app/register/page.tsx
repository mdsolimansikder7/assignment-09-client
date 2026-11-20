"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerRegisterForm } from "@/components/auth/CustomerRegisterForm";
import { OwnerRegisterForm } from "@/components/auth/OwnerRegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RegisterRole = "customer" | "owner";

function RegisterFormTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const initialRole: RegisterRole =
    searchParams.get("role") === "owner" ? "owner" : "customer";
  const [activeTab, setActiveTab] = useState<RegisterRole>(initialRole);

  useEffect(() => {
    if (!isLoading && isLoggedIn) router.replace("/");
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) return null;

  const handleTabChange = (value: string) => {
    setActiveTab(value === "owner" ? "owner" : "customer");
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer">Customer</TabsTrigger>
        <TabsTrigger value="owner">Owner</TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <CustomerRegisterForm />
      </TabsContent>
      <TabsContent value="owner">
        <OwnerRegisterForm />
      </TabsContent>
    </Tabs>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="flex min-h-[70vh] items-center justify-center py-16">
          <div className="container-page w-full max-w-md">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="font-heading text-2xl">Create account</CardTitle>
                <CardDescription>
                  Join GearLoop to rent or list equipment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Suspense fallback={<div className="h-72" />}>
                  <RegisterFormTabs />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
