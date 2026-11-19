# GearLoop — Equipment Rental Platform (Client)

**GearLoop** is the frontend of an equipment rental marketplace (Assignment 09 – Category 003).
**Owners** list their equipment, **Customers** browse, favorite, book and pay through Stripe, and **Admins** manage users, equipment and rentals.

> Tagline: _Rent the gear you need. Loop it back._

- **Live URL:** `https://your-live-url.vercel.app` <!-- deployment-এর পর এখানে আসল লিংক বসান -->
- **Backend repository:** (আপনার সার্ভার রিপোর লিংক)

---

## ✨ Key Features

### Public
- **Home** — animated banner (Framer Motion), Featured Equipment (6 approved items from the API), 6 Categories, Why Choose Us, Customer Reviews, How It Works, Recently Added
- **All Equipment** — 3-column grid; **search, category / rental-type / price-range / availability filters and sorting all run on the backend** via query params, with pagination
- **Equipment Details (private)** — full info, owner card, terms & conditions, Add to Favorites (DB), Book Now modal

### Auth (BetterAuth + Express JWT)
- Register with **imgbb photo upload or direct URL**, password rule (min 6 chars, 1 uppercase, 1 lowercase), confirm password
- Login with email/password + **Google login** (Google users get the **Customer** role by default)
- Auth itself runs via **BetterAuth** inside this Next.js app (MongoDB adapter, same-origin routes at `/api/auth/*`)
- After a successful BetterAuth login/register, the client calls `POST /api/auth/jwt` with the email to get an Express **JWT**
- The JWT is sent as `Authorization: Bearer <token>` on every private API request
- Reload-safe route protection: private pages **wait for the auth state** (Loader) before redirecting

### Dashboards (role-based, dark navy sidebar, fully responsive)
- **Customer** — My Rentals table, Favorites (view/remove), Profile (edit name/photo)
- **Owner** — Add Equipment (imgbb, status = Pending), My Equipment (update/delete/view), My Equipment Rentals, Analytics (Recharts)
- **Admin** — All Users (role change + search), All Equipment (approve/reject/update/delete), All Rentals, Analytics

### Payments
- Booking modal calculates **total = rental units × price × quantity** (daily / weekly / monthly) and checks availability
- Booking goes through the backend `POST /bookings/checkout`, which creates the **Stripe Checkout session** and returns its URL → redirect there
- Success page at `/bookings/success` confirms the payment via `GET /payments/verify/:sessionId`

### UX
- Orange/navy brand theme everywhere (light + **dark mode toggle**, saved in localStorage)
- Toasts (react-hot-toast) on every success/error, SweetAlert2 confirms for destructive actions
- Loading skeletons, empty states and error states on every data-driven page
- Custom **404**, **error** and **loading** pages

---

## 🧰 Tech Stack

- **Next.js 16** (App Router, `src/app`), **TypeScript**
- **Tailwind CSS 4 + shadcn/ui** (Base UI) — the only UI library
- **BetterAuth** (client) + JWT
- **Axios** for API calls, **Framer Motion** animations, **Recharts** charts
- **Stripe** (`@stripe/stripe-js`), **imgbb** image upload
- **react-hot-toast** + **SweetAlert2**, **react-icons** (X logo), **lucide-react** icons, **next-themes**

### npm packages used

| Package | Purpose |
| --- | --- |
| `next`, `react`, `react-dom` | App framework |
| `typescript`, `@types/*` | Types |
| `tailwindcss`, `@tailwindcss/turbopack`, `tw-animate-css` | Styling |
| `shadcn`, `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react` | shadcn/ui components + icons |
| `better-auth` | Authentication (server + client), MongoDB adapter |
| `mongodb` | MongoDB driver for BetterAuth |
| `axios` | HTTP requests with JWT interceptor |
| `framer-motion` | Animations |
| `recharts` | Dashboard charts |
| `@stripe/stripe-js` | Stripe Checkout (via backend) |
| `react-hot-toast` | Toast messages |
| `sweetalert2` | Confirm dialogs |
| `react-icons` | Social icons (X logo etc.) |
| `next-themes` | Dark/light theme (localStorage) |
| `date-fns`, `react-day-picker` | Date utilities |

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_API_URL=            # Express backend base URL (required) — e.g. http://localhost:5000/api
NEXT_PUBLIC_IMGBB_API_KEY=      # imgbb upload key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> `.env*` files are gitignored (except `.env.example`). Never commit secrets.

---

## 🔌 Expected Backend Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/auth/get-session`, POST `/api/auth/sign-up/email`, POST `/api/auth/sign-in/email`, POST `/api/auth/sign-out` | BetterAuth (client) |
| POST | `/api/auth/jwt` | Exchange email for backend JWT (token in response) |
| POST | `/api/auth/logout` | Backend logout |
| GET | `/api/equipment?search=&category=&rentalType=&minPrice=&maxPrice=&availability=&sort=price_asc|price_desc|newest&page=&limit=` | Public catalog (server-side filtering) |
| GET | `/api/equipment/featured` | Featured equipment (6 items) |
| GET | `/api/equipment/categories` | Categories |
| GET | `/api/equipment/:id` | Single equipment (auth required) |
| POST | `/api/equipment` | Owner creates listing (status `pending`) |
| GET | `/api/equipment/owner/mine` | Owner's listings |
| PUT / DELETE | `/api/equipment/:id` | Update / delete |
| POST | `/api/bookings/checkout` | Create booking + Stripe Checkout URL |
| GET | `/api/bookings/mine` | Customer's bookings |
| GET | `/api/bookings/owner` | Owner's bookings |
| GET | `/api/admin/bookings` | All bookings (admin) |
| PATCH | `/api/admin/bookings/:id` | Update booking status |
| POST | `/api/payments/verify/:sessionId` | Verify Stripe payment status |
| POST | `/api/favorites` | Add favorite |
| GET | `/api/favorites` | List favorites (equipment populated) |
| DELETE | `/api/favorites/:equipmentId` | Remove favorite |
| GET | `/api/users/me` | Get current user |
| PATCH | `/api/users/me` | Update profile (name / photo / phone / address) |
| GET | `/api/users` | All users (admin) |
| PATCH | `/api/users/:id/role` | Change user role (admin) |
| GET | `/api/analytics/admin` | Admin analytics |
| GET | `/api/analytics/owner` | Owner analytics |
| GET | `/api/analytics/customer` | Customer analytics |

Auth routes (BetterAuth) are served by **Next.js** at `/api/auth/*`. Express REST routes are prefixed with `/api/*`.

---

## 🚀 Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev                  # http://localhost:3000
```

Build for production: `npm run build && npm start` — deploy on **Vercel** and set all environment variables there. Google login redirect URLs must include the live domain.
