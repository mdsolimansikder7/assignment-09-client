"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheckIcon,
  CalendarIcon,
  HeartIcon,
  MapPinIcon,
  PackageIcon,
  ScrollTextIcon,
  UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate, rentalUnit } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/shared/AuthGuard";
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
import { Skeleton } from "@/components/ui/skeleton";
import { BookingModal } from "@/components/equipment/BookingModal";
import type { Equipment, FavoriteItem } from "@/types";

function EquipmentDetailsView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const eqRes = await api.get<{ data: Equipment }>(`/equipment/${id}`);
        if (cancelled) return;
        setEquipment(eqRes.data?.data ?? null);

        if (user?.role === "customer") {
          try {
            const favRes = await api.get<{ data: FavoriteItem[] }>("/favorites");
            if (!cancelled) {
              const favorites = Array.isArray(favRes.data?.data) ? favRes.data.data : [];
              setIsFavorite(favorites.some((fav) => fav.equipmentId === id));
            }
          } catch {
          }
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr?.response?.status;
        if (status === 401) {
          router.replace(`/login?returnUrl=${encodeURIComponent(`/equipment/${id}`)}`);
          return;
        }
        setErrorStatus(status ?? null);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, user?.role, router]);

  const handleFavorite = async () => {
    if (!equipment) return;
    setFavoriteBusy(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${equipment.id}`);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await api.post("/favorites", { equipmentId: equipment.id });
        setIsFavorite(true);
        toast.success("Added to favorites!");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFavoriteBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-8 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="py-20 text-center">
        <p className="font-heading text-xl font-semibold">
          {errorStatus === 404
            ? "Equipment Not Found"
            : errorStatus === 403
              ? "Access Restricted"
              : "Equipment could not be loaded"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {errorStatus === 404
            ? "This equipment does not exist or is currently unavailable."
            : errorStatus === 403
              ? "You do not have permission to view this equipment with your current account role."
              : error || "Something went wrong while fetching the equipment details."}
        </p>
        <Button variant="outline" className="mt-5" nativeButton={false} render={<Link href="/equipment" />}>
          Back to All Equipment
        </Button>
      </div>
    );
  }

  const available = equipment.availableQuantity > 0;

  return (
    <div className="py-8 sm:py-12">
      <Link
        href="/equipment"
        className="mb-6 inline-flex text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to All Equipment
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={equipment.image}
            alt={equipment.name}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-accent text-accent-foreground">{equipment.category}</Badge>
            <Badge
              className={
                available
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive"
              }
            >
              {available ? `${equipment.availableQuantity} available` : "Booked out"}
            </Badge>
          </div>

          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {equipment.name}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 text-primary" />
            {equipment.location}
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold text-primary">
              {formatCurrency(equipment.rentalPrice)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {rentalUnit(equipment.rentalType)} · {equipment.rentalType} rental
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {user?.role === "customer" ? (
              <>
                <Button
                  size="lg"
                  disabled={!available}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover"
                  onClick={() => setBookingOpen(true)}
                >
                  <CalendarIcon className="size-4" />
                  Book Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={favoriteBusy}
                  onClick={handleFavorite}
                  className={isFavorite ? "border-primary text-primary" : undefined}
                >
                  <HeartIcon className={`size-4 ${isFavorite ? "fill-primary" : ""}`} />
                  {isFavorite ? "In Favorites" : "Add to Favorites"}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  disabled
                  variant="outline"
                  className="cursor-not-allowed opacity-60"
                >
                  <CalendarIcon className="size-4" />
                  Book Now
                </Button>
                <span className="text-xs text-muted-foreground">
                  (Booking is available for customer accounts only)
                </span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-heading text-lg font-semibold">Description</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground whitespace-pre-line">
              {equipment.description}
            </p>
          </div>

          {equipment.terms && (
            <Card className="mt-6">
              <CardContent className="flex gap-3 p-5">
                <ScrollTextIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-heading font-semibold">Terms &amp; Conditions</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {equipment.terms}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <UserIcon className="size-5 text-primary" />
            Owner Information
          </CardTitle>
          <CardDescription>Verified owner on GearLoop.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={equipment.owner?.photo || undefined} alt={equipment.owner?.name ?? "Owner"} />
            <AvatarFallback>
              {equipment.owner?.name?.charAt(0)?.toUpperCase() || "G"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-medium">
              {equipment.owner?.name || "GearLoop Owner"}
              <BadgeCheckIcon className="size-4 text-primary" />
            </p>
            <p className="truncate text-sm text-muted-foreground">{equipment.owner?.email}</p>
          </div>
          {equipment.createdAt && (
            <p className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
              <PackageIcon className="size-4" />
              Listed on {formatDate(equipment.createdAt)}
            </p>
          )}
        </CardContent>
      </Card>

      <BookingModal
        equipment={equipment}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </div>
  );
}

export function EquipmentDetails({ id }: { id: string }) {
  return (
    <AuthGuard>
      <div className="container-page">
        <EquipmentDetailsView id={id} />
      </div>
    </AuthGuard>
  );
}
