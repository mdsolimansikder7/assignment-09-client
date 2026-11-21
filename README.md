# GearLoop — Equipment Rental Platform (Client)

> *Rent the gear you need. Loop it back.*

**GearLoop** is the frontend of an equipment rental marketplace (Assignment 09 – Category 003). **Owners** list their equipment, **Customers** browse, favorite, book and pay through Stripe, and **Admins** manage users, equipment and rentals.

| | |
| --- | --- |
| 🌐 **Live site** | [gearloop-rent.vercel.app](https://gearloop-rent.vercel.app/) |
| 💻 **Client repo** | [mdsolimansikder7/assignment-09-client](https://github.com/mdsolimansikder7/assignment-09-client) |
| 🖥️ **Server repo** | [mdsolimansikder7/assignment-09-server](https://github.com/mdsolimansikder7/assignment-09-server) |

---

## ✨ Key Features

### Public pages

- **Home** — animated banner (Framer Motion), Featured Equipment (6 approved items from the API), 6 Categories, Why Choose Us, Customer Reviews, How It Works, Recently Added
- **All Equipment** — 3-column grid with search, category / rental-type / price-range / availability filters and sorting. Everything runs on the backend through query params, with pagination
- **Equipment Details (private)** — full info, owner card, terms & conditions, Add to Favorites, Book Now modal

### Authentication (BetterAuth + Express JWT)

- Register with an **imgbb photo upload or a direct photo URL**
- Password rule: minimum 6 characters, at least 1 uppercase and 1 lowercase letter, plus confirm password
- Login with email/password or **Google** (Google users get the **Customer** role by default)
- Auth runs inside this Next.js app with **BetterAuth** (MongoDB adapter, routes at `/api/auth/*`)
- After login/register, the client calls `POST /api/auth/jwt` with the user's email to get an Express **JWT**
- The JWT is sent as `Authorization: Bearer <token>` on every private API request
- Reload-safe route protection: private pages wait for the auth state (Loader) before redirecting

### Role-based dashboards

Dark navy sidebar, fully responsive.

| Role | What they can do |
| --- | --- |
| **Customer** | My Rentals table, Favorites (view/remove), Profile (edit name/photo) |
| **Owner** | Add Equipment (status starts as *Pending*), My Equipment (view/update/delete), My Equipment Rentals, Analytics (Recharts) |
| **Admin** | All Users (role change + search), All Equipment (approve/reject/update/delete), All Rentals, Analytics |

### Payments

- The booking modal calculates **total = rental units × price × quantity** (daily / weekly / monthly) and checks availability
- Booking goes through the backend `POST /api/bookings/checkout`, which creates a **Stripe Checkout** session and returns its URL, then the user is redirected there
- After payment, `/bookings/success` confirms the result using the session id

### User experience

- Orange/navy brand theme with a **light/dark mode toggle** (saved in localStorage)
- Toast messages (react-hot-toast) for every success/error, SweetAlert2 confirmations for destructive actions
- Loading skeletons, empty states and error states on every data-driven page
- Custom **404**, **error** and **loading** pages

---

## 🧰 Tech Stack

- **Next.js 16** (App Router, `src/app`) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Base UI)
- **BetterAuth** (auth) + **JWT** (backend access)
- **Axios** (API calls), **Framer Motion** (animations), **Recharts** (charts)
- **React Hook Form** + **Zod** (forms and validation)
- **Stripe** (`@stripe/stripe-js`), **imgbb** (image upload)
- **react-hot-toast**, **SweetAlert2**, **lucide-react**, **react-icons**, **next-themes**

### Main npm packages

| Package | Purpose |
| --- | --- |
| `next`, `react`, `react-dom` | App framework |
| `typescript`, `@types/*` | Type safety |
| `tailwindcss`, `tw-animate-css` | Styling |
| `shadcn`, `@base-ui/react`, `class-variance-authority`, `lucide-react` | UI components and icons |
| `better-auth`, `mongodb` | Authentication with MongoDB adapter |
| `axios` | HTTP requests (JWT sent with each private request) |
| `framer-motion` | Animations |
| `recharts` | Dashboard charts |
| `react-hook-form`, `@hookform/resolvers`, `zod` | Forms and validation |
| `@stripe/stripe-js` | Stripe Checkout |
| `react-hot-toast`, `sweetalert2` | Toasts and confirm dialogs |
| `next-themes` | Dark/light theme |
| `date-fns`, `react-day-picker` | Date utilities and date picker |
| `react-icons` | Social icons |

---

## 📁 Project Structure

```
assignment-09-client/
├── public/            # static files (images, icons)
├── src/               # app source (App Router pages, components, lib)
├── .env.example       # sample environment variables
├── components.json    # shadcn/ui config
├── next.config.ts     # Next.js config
└── package.json
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_API_URL=                  # Express backend base URL, e.g. http://localhost:5000/api
NEXT_PUBLIC_IMGBB_API_KEY=            # imgbb upload key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=   # Stripe publishable key
BETTER_AUTH_SECRET=                   # random secret string
BETTER_AUTH_URL=                      # e.g. http://localhost:3000
MONGODB_URI=                          # MongoDB connection string
GOOGLE_CLIENT_ID=                     # Google OAuth
GOOGLE_CLIENT_SECRET=                 # Google OAuth
```

> `.env*` files are gitignored (except `.env.example`). Never commit your secrets.

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/mdsolimansikder7/assignment-09-client.git
cd assignment-09-client

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local     # then fill in your values

# 4. Run the dev server
npm run dev                    # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

**Deploying on Vercel:** add all the environment variables in the Vercel project settings, and add your live domain to the Google OAuth redirect URLs.

---

## 🔌 Backend Endpoints Used

Auth routes (BetterAuth) are served by **Next.js** at `/api/auth/*`. The Express REST routes are prefixed with `/api/*`.

### Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET / POST | `/api/auth/*` (get-session, sign-up/email, sign-in/email, sign-out) | BetterAuth (handled by Next.js) |
| POST | `/api/auth/jwt` | Exchange email for backend JWT |
| POST | `/api/auth/logout` | Backend logout |

### Equipment

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/equipment` | List with search, filters, sort and pagination (query params: `search`, `category`, `rentalType`, `minPrice`, `maxPrice`, `availability`, `sort`) |
| GET | `/api/equipment/featured` | 6 featured items |
| GET | `/api/equipment/categories` | Categories |
| GET | `/api/equipment/:id` | Single equipment (auth required) |
| POST | `/api/equipment` | Owner creates listing (status `pending`) |
| GET | `/api/equipment/owner/mine` | Owner's listings |
| PATCH / DELETE | `/api/equipment/:id` | Update / delete |

### Bookings and payments

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/bookings/checkout` | Create booking + Stripe Checkout URL |
| GET | `/api/bookings/mine` | Customer's bookings |
| GET | `/api/bookings/owner` | Owner's bookings |
| GET | `/api/admin/bookings` | All bookings (admin) |
| PATCH | `/api/admin/bookings/:id` | Update booking status |
| GET | `/api/payments/verify/:sessionId` | Verify Stripe payment status |

### Favorites, users and analytics

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/favorites` | Add favorite |
| GET | `/api/favorites` | List favorites |
| DELETE | `/api/favorites/:equipmentId` | Remove favorite |
| GET | `/api/users/me` | Current user |
| PATCH | `/api/users/me` | Update profile (name / photo / phone / address) |
| GET | `/api/users` | All users (admin) |
| PATCH | `/api/users/:id/role` | Change user role (admin) |
| GET | `/api/analytics/admin` | Admin analytics |
| GET | `/api/analytics/owner` | Owner analytics |
| GET | `/api/analytics/customer` | Customer analytics |

---

## 👤 Author

**Md Soliman Sikder** — CSE student, Sonargaon University

- GitHub: [@mdsolimansikder7](https://github.com/mdsolimansikder7)
- LinkedIn: [md-soliman-sikder](https://www.linkedin.com/in/md-soliman-sikder-b17887237)
