"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";

import { authClient } from "@/lib/auth-client";
import { api, fetchApiToken } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation";
import { uploadToImgbb } from "@/lib/imgbb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OwnerRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToImgbb(file);
      setPhotoUrl(url);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedBusiness = businessName.trim();
    if (!trimmedBusiness) {
      setBusinessError("Business / Shop name is required.");
      return toast.error("Business / Shop name is required.");
    }
    if (trimmedBusiness.length < 2 || trimmedBusiness.length > 80) {
      setBusinessError("Business / Shop name is required.");
      return toast.error("Business / Shop name is required.");
    }
    setBusinessError(null);
    if (!name.trim()) return toast.error("Please enter your name.");
    const emailError = validateEmail(email);
    if (emailError) return toast.error(emailError);
    const nextPasswordError = validatePassword(password);
    setPasswordError(nextPasswordError);
    if (nextPasswordError) return toast.error(nextPasswordError);
    if (password !== confirmPassword) {
      setConfirmError(true);
      return toast.error("Passwords do not match.");
    }

    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email,
        password,
        image: photoUrl || undefined,
      });
      if (error) {
        toast.error(error.message ?? "Registration failed. Try again.");
        return;
      }
      toast.success("Account created successfully");
      await fetchApiToken(email, "owner");
      await api.patch("/users/me", {
        name: name.trim(),
        photo: photoUrl || "",
        phone,
        address,
        businessName: trimmedBusiness,
      });
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="owner-business">Business / Shop Name *</Label>
        <Input
          id="owner-business"
          placeholder="e.g. Sikder Rentals"
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value);
            setBusinessError(null);
          }}
          autoFocus
          required
        />
        {businessError && (
          <p className="text-xs font-medium text-destructive">{businessError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-name">Name</Label>
        <Input
          id="owner-name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-email">Email</Label>
        <Input
          id="owner-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-photo">Photo (optional)</Label>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={photoUrl || undefined} alt="Profile preview" />
            <AvatarFallback>
              {name.trim()?.charAt(0)?.toUpperCase() || "G"}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="owner-photo"
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
            id="owner-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoFile(e.target.files?.[0])}
            disabled={uploading}
          />
          {photoUrl && (
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => setPhotoUrl("")}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2Icon className="size-4" />
            </button>
          )}
        </div>
        <Input
          id="owner-photo-url"
          placeholder="…or paste an image URL"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="owner-phone">Phone Number</Label>
          <Input
            id="owner-phone"
            type="tel"
            placeholder="01700000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner-address">Address</Label>
          <Input
            id="owner-address"
            placeholder="Street, City"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-password">Password</Label>
        <Input
          id="owner-password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(null);
          }}
          required
        />
        {passwordError ? (
          <p className="text-xs font-medium text-destructive">{passwordError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Minimum 6 characters, with at least 1 uppercase and 1 lowercase letter.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-confirm-password">Confirm Password</Label>
        <Input
          id="owner-confirm-password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmError(false);
          }}
          required
        />
        {confirmError && (
          <p className="text-xs font-medium text-destructive">Passwords do not match.</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        {submitting && <Loader2Icon className="size-4 animate-spin" />}
        Register as Owner
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
