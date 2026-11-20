
export type UserRole = "customer" | "owner" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  photo: string;
  phone: string;
  address: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type EquipmentStatus = "pending" | "approved" | "rejected";
export type RentalType = "daily" | "weekly" | "monthly";

export interface EquipmentOwner {
  name: string;
  email: string;
  photo: string;
}

export interface Equipment {
  id: string;
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
  status: EquipmentStatus;
  averageRating?: number;
  reviewCount?: number;
  owner: EquipmentOwner;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export interface BookingCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage?: string;
  customer: BookingCustomer;
  ownerEmail: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  deliveryAddress: string;
  notes: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  stripeSessionId: string | null;
  transactionId: string;
  paidAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FavoriteItem {
  id: string;
  equipmentId: string;
  createdAt?: string;
  equipment: Equipment;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CustomerAnalytics {
  totalBookings: number;
  activeRentals: number;
  completedRentals: number;
  totalSpent: number;
  monthly: { month: string; year: number; spending: number }[];
}

export interface AdminAnalytics {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingApprovals: number;
  completedRentals: number;
  totalRevenue: number;
  monthly: { month: string; year: number; bookings: number; revenue: number }[];
}

export interface OwnerAnalytics {
  totalEquipment: number;
  completedRentals: number;
  totalEarnings: number;
  monthly: { month: string; year: number; earnings: number }[];
}

export interface Review {
  name: string;
  role: string;
  rating: number;
  comment: string;
  image?: string;
}

export interface EquipmentReview {
  id: string;
  equipmentId: string;
  bookingId: string;
  userEmail: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CanReviewResponse {
  canReview: boolean;
  reason: string;
  myReview: EquipmentReview | null;
}

export interface EquipmentReviewsResponse {
  reviews: EquipmentReview[];
  averageRating: number;
  totalReviews: number;
  page?: number;
  totalPages?: number;
}

export interface CategoryInfo {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    name: "Construction",
    slug: "construction",
    icon: "construction",
    description: "Drills, mixers, scaffolding and more",
  },
  {
    name: "Photography",
    slug: "photography",
    icon: "camera",
    description: "Cameras, lenses, lighting and drones",
  },
  {
    name: "Vehicles & Transportation",
    slug: "vehicles",
    icon: "car",
    description: "Vans, trailers and moving gear",
  },
  {
    name: "Agriculture",
    slug: "agriculture",
    icon: "tractor",
    description: "Tillers, harvesters and farm tools",
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: "cpu",
    description: "Projectors, audio and computer gear",
  },
  {
    name: "Event Equipment",
    slug: "event",
    icon: "party",
    description: "Tents, chairs, stages and sound",
  },
];

export const RENTAL_TYPES: { value: RentalType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];
