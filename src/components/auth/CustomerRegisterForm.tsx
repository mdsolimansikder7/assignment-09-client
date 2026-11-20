"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa6";
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

export function CustomerRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      });
    } catch {
      toast.error("Could not start Google login.");
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      await fetchApiToken(email, "customer");
      await api.patch("/users/me", {
        name: name.trim(),
        photo: photoUrl || "",
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
    <>
      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="customer-name">Name</Label>
          <Input
            id="customer-name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-photo">Photo (optional)</Label>
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={photoUrl || undefined} alt="Profile preview" />
              <AvatarFallback>
                {name.trim()?.charAt(0)?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="customer-photo"
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
              id="customer-photo"
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
            id="customer-photo-url"
            placeholder="…or paste an image URL"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-password">Password</Label>
          <Input
            id="customer-password"
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
          <Label htmlFor="customer-confirm-password">Confirm Password</Label>
          <Input
            id="customer-confirm-password"
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
            <p className="text-xs font-medium text-destructive">
              Passwords do not match.
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {submitting && <Loader2Icon className="size-4 animate-spin" />}
          Register
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={googleLoading}
        onClick={handleGoogle}
        className="w-full"
      >
        {googleLoading ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <FaGoogle className="size-4" />
        )}
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </>
  );
}
