"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CameraIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SaveIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { api, saveUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { AppUser } from "@/types";

const phoneRegex = /^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/;

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  phone: z.string().trim().optional().refine((v) => !v || phoneRegex.test(v), "Invalid Bangladeshi phone number"),
  photo: z.string().trim().optional().refine((v) => !v || /^https?:\/\//.test(v), "Invalid URL"),
  address: z.string().trim().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: AppUser }) {
  const { setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user.photo || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      phone: user.phone || "",
      photo: user.photo || "",
      address: user.address || "",
    },
  });

  const isDemo = (user as { isDemo?: boolean }).isDemo === true;

  useEffect(() => {
    let cancelled = false;

    async function loadUserFromBackend() {
      try {
        const res = await api.get<{ data?: AppUser }>("/users/me");
        const data = res?.data?.data;
        if (!data || cancelled) return;
        form.reset(data);
        setPreview(data.photo || "");
      } catch {
      }
    }

    loadUserFromBackend();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (isDemo) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: values.name.trim(),
        phone: values.phone || "",
        address: values.address || "",
      };
      if (values.photo && values.photo.trim()) {
        payload.photo = values.photo.trim();
      }
      const { data } = await api.patch<{ data?: AppUser }>("/users/me", payload);
      const updated = data?.data ?? { ...user, ...payload, photo: payload.photo ?? user.photo } as AppUser;
      saveUser(updated as AppUser);
      if (setUser) setUser(updated);
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPG or PNG images are allowed.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be 4MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const local = URL.createObjectURL(file);
      setPreview(local);
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Upload failed");
      form.setValue("photo", json.url, { shouldDirty: true });
      setPreview(json.url);
      toast.success("Photo uploaded!");
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const roleLabel = user.role.toUpperCase() + " ACCOUNT";

  return (
    <Card className="rounded-2xl border-border bg-card text-foreground">
      <CardHeader className="border-b border-border">
        <CardTitle className="font-heading text-xl text-foreground">Profile</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Manage your personal information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col items-center gap-4 border-b border-border pb-6 sm:flex-row sm:items-start">
          <div className="relative">
            <Avatar className="size-24 ring-4 ring-primary/30">
              <AvatarImage
                src={preview || user.photo || undefined}
                alt={user.name}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-orange-500/15 text-2xl font-semibold text-orange-600 dark:text-orange-400">
                {user.name?.charAt(0)?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <span className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="font-heading text-xl font-bold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge className="gap-1 bg-primary/15 text-primary">
                <ShieldCheckIcon className="size-3" />
                {roleLabel}
              </Badge>
              {isDemo && <Badge variant="secondary" className="bg-muted text-muted-foreground">READ-ONLY</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={isDemo || uploading}
                className="border-border bg-transparent text-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <CameraIcon className="size-4" />
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground">JPG or PNG. Max 4MB.</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={isDemo}
            />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  className="h-10 rounded-lg border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground focus-visible:border-orange-500/50 focus-visible:ring-2 focus-visible:ring-orange-500/50"
                  disabled={isDemo}
                  {...form.register("name")}
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="h-10 rounded-lg border-border bg-muted/50 pl-9 text-foreground/80"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+880 1711 000000"
                  className="h-10 rounded-lg border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground focus-visible:border-orange-500/50 focus-visible:ring-2 focus-visible:ring-orange-500/50"
                  disabled={isDemo}
                  {...form.register("phone")}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo" className="text-foreground">Avatar Hosted URL</Label>
              <div className="relative">
                <CameraIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="photo"
                  placeholder="https://i.ibb.co/..."
                  className="h-10 rounded-lg border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground focus-visible:border-orange-500/50 focus-visible:ring-2 focus-visible:ring-orange-500/50"
                  disabled={isDemo}
                  {...form.register("photo")}
                />
              </div>
              <p className="text-xs text-muted-foreground">Hosted automatically via ImgBB upon uploading above.</p>
              {form.formState.errors.photo && (
                <p className="text-xs text-destructive">{form.formState.errors.photo.message}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-foreground">Delivery / Physical Address</Label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Road, Area, District"
                  className="h-10 rounded-lg border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground focus-visible:border-orange-500/50 focus-visible:ring-2 focus-visible:ring-orange-500/50"
                  disabled={isDemo}
                  {...form.register("address")}
                />
              </div>
              {form.formState.errors.address && (
                <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="submit"
              disabled={isDemo || saving || !form.formState.isDirty || !form.formState.isValid}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving && <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              <SaveIcon className="size-4" />
              Save Profile Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { ProfileForm as ProfileCard };
export default ProfileForm;
