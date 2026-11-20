"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import { EquipmentForm, type EquipmentFormValues } from "@/components/equipment/EquipmentForm";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function AddEquipmentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: EquipmentFormValues) => {
    setSubmitting(true);
    try {
      await api.post("/equipment", values);
      toast.success("Equipment added! It is pending admin approval.");
      router.push("/dashboard/owner/my-equipment");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Equipment"
        description="List a new item for rent. It will appear publicly after admin approval."
      />
      <EquipmentForm isSubmitting={submitting} submitLabel="Add Equipment" onSubmit={handleSubmit} />
    </>
  );
}
