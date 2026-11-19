<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# agent.md — Frontend (Client) Guide

Project: **GearLoop** — an Equipment Rental Platform (Assignment 9 – Category 003)
This file tells the AI coding agent how to build and edit the **client side** of this project. Read it fully before writing any code.

---

## 1. Project Purpose

A rental marketplace where **Owners** list equipment, **Customers** browse, favorite, book and pay (Stripe), and **Admins** manage users, equipment and rentals.

---

## 1.1 Brand: GearLoop

- **Website name:** `GearLoop` (always written as one word, capital G and capital L)
- **Tagline (use in banner/footer):** "Rent the gear you need. Loop it back."
- Use the name `GearLoop` in the Navbar, Footer, page titles, README, emails and metadata.
  - Example metadata title: `GearLoop | Rent Equipment Easily`

### Logo files

Copy the logo files into the `public/logo` folder:

```
public/logo/gearloop-icon.svg   # icon only (use for favicon, small spaces, dashboard sidebar)
public/logo/gearloop-logo.svg   # icon + "GearLoop" text (use on light backgrounds)
```

Rules:
- Navbar: show the icon + the text `GearLoop` (text as real HTML text, not an image, so it works in dark mode). Same size and style on every page.
- Footer and dashboard sidebar: use the same logo style as the Navbar.
- Favicon: use `gearloop-icon.svg` (set it in `src/app/layout.tsx` metadata or `src/app/icon.svg`).
- Do not stretch, recolor or edit the logo. Keep its proportions.
- Use `next/image` or a plain `<img>` with a fixed height (for example `h-10`).

### Brand colors

Use these colors as the project theme. Set them in `globals.css` (shadcn CSS variables) so every component follows them.

| Use | Color |
| --- | --- |
| Primary (buttons, links, highlights) | `#F97316` (orange) |
| Primary hover | `#EA580C` |
| Dark (headings, dark sections, sidebar) | `#0F172A` (navy) |
| Light background | `#FFFFFF` and `#F8FAFC` |
| Muted text | `#64748B` |

Keep text and background contrast high so everything is easy to read. Use the same colors in the public site and all dashboards.

---

## 2. Tech Stack (Frontend)

- **Next.js** (App Router, `src/app`)
- **TypeScript**
- **Tailwind CSS + shadcn/ui** (use shadcn/ui only; do not add DaisyUI, HeroUI or any other UI library)
  - Setup: `npx shadcn@latest init`
  - Add components when needed: `npx shadcn@latest add button card input table dialog select badge`
  - shadcn components live in `src/components/ui`. Use them instead of writing raw HTML for buttons, inputs, tables, modals, etc.
- **BetterAuth** (+ MongoDB adapter) for login/register, plus JWT for API calls
- **Framer Motion** for animations
- **Stripe** (`@stripe/stripe-js`) for payment
- **imgbb** for image upload
- **react-hot-toast** or **SweetAlert2** for messages
- **Recharts** for dashboard charts
- **react-icons** (use the new **X logo**, not the old Twitter bird)

---

## 3. Coding Rules (Beginner Friendly)

- Keep code **simple and readable**. No clever tricks or over-engineering.
- One component = one job. Keep files small.
- Use clear names: `EquipmentCard`, `BookingModal`, `useAuth`.
- Add a short comment above anything that is not obvious.
- Use `async/await` with `try/catch`. Always show a toast on error.
- Never hardcode API URLs or keys. Use environment variables.
- Do not install a new package unless really needed. If you do, add it to the README list.

---

## 4. Environment Variables

Create `.env.local` (secret, must never go to GitHub) and `.env.example` (safe to share, with empty values).

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_IMGBB_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`.env*` files (except `.env.example`) must be in `.gitignore`.

---

## 5. Folder Structure

```
public/
  logo/        (gearloop-icon.svg, gearloop-logo.svg)
src/
  app/
    (public)/
      page.tsx                 # Home
      equipment/page.tsx       # All Equipment
      login/page.tsx
      register/page.tsx
    equipment/[id]/page.tsx    # Details (private)
    payment/
      page.tsx
      success/page.tsx
    dashboard/
      layout.tsx               # Sidebar + role check
      customer/ (my-rentals, favorites, profile)
      owner/    (add-equipment, my-equipment, my-rentals, profile)
      admin/    (users, equipment, rentals, profile)
    loading.tsx
    not-found.tsx
    error.tsx
  components/
    ui/        (shadcn/ui components - generated, keep as is)
    layout/    (Navbar, Footer)
    home/      (Banner, Featured, Categories, WhyChooseUs, Reviews, HowItWorks, ...)
    equipment/ (EquipmentCard, Filters, BookingModal)
    dashboard/ (Sidebar, StatCard, Charts, DataTable)
    shared/    (Loader, Pagination, ThemeToggle)
  lib/         (api.ts, auth.ts, stripe.ts, imgbb.ts)
  hooks/       (useAuth.ts, useRole.ts)
  types/       (index.ts)
```

---

## 6. Layout

Header (Navbar) → Dynamic content (changes by route) → Footer.

**Navbar:** GearLoop logo, website name `GearLoop`, Home, All Equipment, About Us, Contact Us, How It Works, Login, Register. When logged in: Dashboard and Logout (with user photo).
Logo and heading style must stay the same on every page.

---

## 7. Pages and Features

### Home (public)
1. Banner: high-quality image, attractive title, short description (Framer Motion)
2. Featured Equipment: 6 approved items (card layout, Framer Motion). "View Details" goes to Login if not logged in, otherwise to the details page.
3. Categories: Construction, Photography, Vehicles & Transportation, Agriculture, Electronics, Event Equipment (Framer Motion)
4. Why Choose Us: affordable prices, verified owners, flexible periods, secure payment
5. Customer Reviews: at least 4 (name, rating, comment)
6. Extra sections (at least 2): e.g. How It Works, Recently Added Equipment

### All Equipment (public)
- 3-column grid, equal-size cards
- Card shows: image, name, category, price, rental type, location, availability, View Details
- **Search** (name, location) — sent to the server
- **Filters:** category, rental type, price range, availability — sent to the server
- **Sort:** price low→high, price high→low, recently added — sent to the server
- **Pagination** (optional but recommended)
- All filtering/sorting is done by the **backend** (send query params, do not filter in the browser)

### Equipment Details (private)
Show: name, description, category, price, rental type, location, available quantity, image, owner info, terms and conditions.
- **Add to Favorites** (saved in database)
- **Book Now** opens a modal with: start date, end date, quantity, contact number, delivery address, notes
- On confirm: calculate total (days × price × quantity), check availability, then go to Stripe payment
- After payment success: go to the success page

### Auth
- Register: Name, Email, Photo (link or imgbb), Password, link to Login
- Password rule: at least 1 uppercase, 1 lowercase, minimum 6 characters. Show a toast on error.
- Login: email/password + Google login, link to Register
- Google users get the **Customer** role by default
- Show a toast or SweetAlert after successful login/register
- **Do not** add email verification or forgot password

### Dashboards
All dashboards: full width, responsive, same color theme, sidebar, profile section.

**Customer:** My Rentals (table), Favorites (table: View Details, Remove), Profile
**Owner:** Add Equipment (imgbb upload, status = Pending), My Equipment (table: Update, Delete, View Details), My Equipment Rental (table), Profile, Analytics
**Admin:** All Users (change role), All Equipment (Approve, Reject, Update, Delete), All Rentals, Profile, Analytics

**Analytics (charts with Recharts):**
- Admin: total users, total equipment, total bookings, pending approvals, completed rentals, total revenue, monthly bookings
- Owner: total listed equipment, completed rentals, total earnings, monthly earnings

---

## 8. Auth and Route Protection (Very Important)

- A logged-in user must **not** be sent to Login when they reload a private route. Wait for the auth state to finish loading (show the Loader) before redirecting.
- Protect routes by role: Customer, Owner, Admin. If the role does not match, redirect to the user's own dashboard.
- Send the JWT with every private API request:
  `Authorization: Bearer <token>`
- No page should throw an error on reload from any route.

---

## 9. UI and Design Rules

- Pick **one** color theme with good contrast. Use it everywhere (public site and dashboards).
- Same heading style (font, size, color) in all sections.
- Same button style everywhere (match the home page).
- All cards: **same height and width**. All images: **same size** (use `object-cover` with a fixed aspect ratio).
- Good spacing and alignment. Balanced paragraph spacing.
- Fully responsive: mobile, tablet, desktop (dashboard too).
- Needed pages: **Loading** page and **Error (404)** page.
- Framer Motion: Banner, Featured Equipment, Categories (optional: Reviews and extra sections).
- Optional: **Dark/Light theme toggle**, saved in `localStorage`.
- Do not copy designs from any class module or example. Design must be unique.

---

## 10. Git Rules

- **Do NOT make any git commit.** Never run `git commit`, `git push`, `git add`, or any command that changes git history.
- The developer will commit and push by himself.
- Only edit and create files. When a task is finished, just tell the developer which files were changed.

---

## 11. README (Required)

Must include: project name, purpose, **live URL**, key features, and the list of **npm packages** used.

---

## 12. Deployment Checklist

- [ ] Live link opens without errors
- [ ] No CORS, 404 or 504 errors with the production server
- [ ] Reload works on every route
- [ ] Logged-in user stays logged in after reloading a private route
- [ ] All environment variables are set on the hosting platform (Vercel)
- [ ] Google login redirect URLs updated for the live domain
- [ ] Admin email and password ready for submission

---

## 13. Things the Agent Must Never Do

- Never put `.env` files or secret keys in code that goes to GitHub
- Never filter, search or sort big lists only in the browser (use the backend)
- Never skip loading and error states
- Never use any UI library other than shadcn/ui
- Never run `git commit`, `git push` or `git add`
- Never make the code complicated when a simple way works
