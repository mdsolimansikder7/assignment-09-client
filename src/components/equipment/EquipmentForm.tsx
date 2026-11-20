"use client";

import { useRef, useState } from "react";
import { ImagePlusIcon, Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

import { uploadToImgbb } from "@/lib/imgbb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, RENTAL_TYPES, type Equipment, type RentalType } from "@/types";

export interface EquipmentFormValues {
  name: string;
  description: string;
  category: string;
  rentalPrice: number;
  rentalType: RentalType;
  location: string;
  availableQuantity: number;
  condition: string;
  brand: string;
  model: string;
  image: string;
  terms: string;
}

const EMPTY: EquipmentFormValues = {
  name: "",
  description: "",
  category: "",
  rentalPrice: 0,
  rentalType: "daily",
  location: "",
  availableQuantity: 1,
  condition: "",
  brand: "",
  model: "",
  image: "",
  terms: "",
};

interface EquipmentFormProps {
  initial?: Partial<Equipment>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: EquipmentFormValues) => void | Promise<void>;
}

export function EquipmentForm({
  initial,
  isSubmitting = false,
  submitLabel = "Submit",
  onSubmit,
}: EquipmentFormProps) {
  const [values, setValues] = useState<EquipmentFormValues>(
    initial
      ? {
          name: initial.name ?? "",
          description: initial.description ?? "",
          category: initial.category ?? "",
          rentalPrice: initial.rentalPrice ?? 0,
          rentalType: initial.rentalType ?? "daily",
          location: initial.location ?? "",
          availableQuantity: initial.availableQuantity ?? 1,
          condition: initial.condition ?? "",
          brand: initial.brand ?? "",
          model: initial.model ?? "",
          image: initial.image ?? "",
          terms: initial.terms ?? "",
        }
      : EMPTY
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof EquipmentFormValues>(
    key: K,
    value: EquipmentFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToImgbb(file);
      set("image", url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.name.trim()) return toast.error("Equipment name is required.");
    if (!values.category) return toast.error("Please select a category.");
    if (values.rentalPrice <= 0)
      return toast.error("Price must be greater than 0.");
    if (!values.location.trim()) return toast.error("Location is required.");
    if (!values.image) return toast.error("Please add an equipment image.");
    if (values.description.trim().length < 10)
      return toast.error("Description must be at least 10 characters.");
    if (values.availableQuantity < 0)
      return toast.error("Available quantity cannot be negative.");

    void onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Equipment Details</CardTitle>
        <CardDescription>
          Fields marked with * are required. New equipment is reviewed by an
          admin before it goes live.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eq-name">Name *</Label>
            <Input
              id="eq-name"
              placeholder="e.g. Bosch GSB 18V Drill"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={values.category || undefined}
              onValueChange={(value) => set("category", value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.slug} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rental Type *</Label>
            <Select
              value={values.rentalType}
              onValueChange={(value) => set("rentalType", (value ?? "daily") as RentalType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {RENTAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eq-price">Price Per Rental ($) *</Label>
            <Input
              id="eq-price"
              type="number"
              min={1}
              value={values.rentalPrice || ""}
              onChange={(e) => set("rentalPrice", Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eq-qty">Available Quantity *</Label>
            <Input
              id="eq-qty"
              type="number"
              min={0}
              value={values.availableQuantity}
              onChange={(e) => set("availableQuantity", Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eq-condition">Condition (optional)</Label>
            <Input
              id="eq-condition"
              placeholder="e.g. Like new"
              value={values.condition}
              onChange={(e) => set("condition", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eq-brand">Brand (optional)</Label>
            <Input
              id="eq-brand"
              placeholder="e.g. Bosch"
              value={values.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eq-model">Model (optional)</Label>
            <Input
              id="eq-model"
              placeholder="e.g. GSB 18V"
              value={values.model}
              onChange={(e) => set("model", e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eq-location">Location *</Label>
            <Input
              id="eq-location"
              placeholder="e.g. Dhanmondi, Dhaka"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Equipment Image *</Label>
            <div className="flex flex-wrap items-center gap-3">
              {values.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={values.image}
                  alt="Equipment preview"
                  className="h-20 w-28 rounded-lg border border-border object-cover"
                />
              ) : null}
              <label
                htmlFor="eq-image"
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm font-medium hover:bg-muted"
              >
                {uploading ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <ImagePlusIcon className="size-4" />
                )}
                Upload Image
              </label>
              <input
                ref={fileInputRef}
                id="eq-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageFile(e.target.files?.[0])}
                disabled={uploading}
              />
              <Input
                placeholder="…or paste an image URL"
                className="max-w-72"
                value={values.image}
                onChange={(e) => set("image", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eq-desc">Description *</Label>
            <textarea
              id="eq-desc"
              rows={4}
              placeholder="What is the equipment? What condition is it in? What should renters know?"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50"
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eq-terms">Terms &amp; Conditions (optional)</Label>
            <textarea
              id="eq-terms"
              rows={3}
              placeholder="e.g. Security deposit required, pickup after 10am, fuel full-to-full…"
              value={values.terms}
              onChange={(e) => set("terms", e.target.value)}
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50"
            />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full sm:w-auto sm:min-w-40 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
