# 💎 GemMarket — Gemstone Classified Marketplace MVP

A full-stack classified marketplace for gemstones, built with Next.js 14, PostgreSQL + Prisma, JWT auth, Cloudinary image uploads, and WhatsApp seller contact tracking.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router), React 18   |
| Styling     | Tailwind CSS                        |
| Backend     | Next.js API Routes (REST)           |
| Database    | PostgreSQL + Prisma ORM             |
| Auth        | JWT (jsonwebtoken + bcryptjs)       |
| Images      | Cloudinary                          |
| Validation  | Zod + react-hook-form               |
| Toasts      | react-hot-toast                     |

---

## Project Structure

```
gem-market/
├── prisma/
│   ├── schema.prisma         # DB schema (User, Listing, Image, Tracking)
│   └── seed.ts               # Seed demo data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   └── login/route.ts
│   │   │   ├── listings/
│   │   │   │   ├── route.ts           # GET (with filters) / POST
│   │   │   │   ├── [id]/route.ts      # GET / PATCH / DELETE
│   │   │   │   └── mine/route.ts      # GET own listings
│   │   │   ├── admin/
│   │   │   │   └── listings/
│   │   │   │       ├── route.ts       # GET all (any status)
│   │   │   │       └── [id]/
│   │   │   │           ├── approve/route.ts
│   │   │   │           └── reject/route.ts
│   │   │   ├── track/
│   │   │   │   └── whatsapp-click/route.ts
│   │   │   └── upload/route.ts
│   │   ├── page.tsx               # Homepage
│   │   ├── layout.tsx             # Root layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── listings/
│   │   │   ├── page.tsx           # Browse + filter
│   │   │   └── [id]/page.tsx      # Listing detail
│   │   ├── create/page.tsx        # Create listing form
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # User dashboard
│   │   │   └── edit/[id]/page.tsx # Edit listing
│   │   └── admin/page.tsx         # Admin panel
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ListingCard.tsx
│   │   ├── WhatsAppButton.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ImageUpload.tsx
│   │   └── Skeletons.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx            # Auth context + provider
│   │   └── useApi.ts              # API helpers
│   └── lib/
│       ├── prisma.ts              # Prisma client singleton
│       ├── auth.ts                # JWT sign/verify helpers
│       ├── cloudinary.ts          # Image upload utility
│       └── utils.ts               # formatPrice, buildWhatsAppLink, cn, etc.
```

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally (or use a cloud DB like Neon, Supabase)
- Cloudinary free account
- Git

### 2. Clone & Install

```bash
git clone <your-repo>
cd gem-market
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/gemmarket"
JWT_SECRET="change-this-to-a-long-random-string"
JWT_EXPIRES_IN="7d"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up Database

```bash
# Push schema to PostgreSQL
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed demo data (optional)
npm run db:seed
```

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts (after seeding)

| Role   | Email                      | Password   |
|--------|----------------------------|------------|
| Admin  | admin@gemmarket.lk         | admin123   |
| Seller | seller@gemmarket.lk        | seller123  |

---

## API Reference

### Auth

| Method | Endpoint              | Auth | Description        |
|--------|-----------------------|------|--------------------|
| POST   | /api/auth/register    | ❌   | Register new user  |
| POST   | /api/auth/login       | ❌   | Login + get token  |

### Listings

| Method | Endpoint              | Auth     | Description              |
|--------|-----------------------|----------|--------------------------|
| GET    | /api/listings         | ❌       | Browse (with filters)    |
| POST   | /api/listings         | ✅ USER  | Create listing           |
| GET    | /api/listings/:id     | ❌       | Get single listing       |
| PATCH  | /api/listings/:id     | ✅ OWNER | Update listing           |
| DELETE | /api/listings/:id     | ✅ OWNER | Delete listing           |
| GET    | /api/listings/mine    | ✅ USER  | Get own listings         |

### Admin

| Method | Endpoint                         | Auth       | Description       |
|--------|----------------------------------|------------|-------------------|
| GET    | /api/admin/listings              | ✅ ADMIN   | All listings      |
| PATCH  | /api/admin/listings/:id/approve  | ✅ ADMIN   | Approve listing   |
| PATCH  | /api/admin/listings/:id/reject   | ✅ ADMIN   | Reject listing    |

### Tracking & Upload

| Method | Endpoint                      | Auth    | Description              |
|--------|-------------------------------|---------|--------------------------|
| POST   | /api/track/whatsapp-click     | ❌      | Track + get WhatsApp URL |
| POST   | /api/upload                   | ✅ USER | Upload image to Cloudinary |

### Query Params for GET /api/listings

| Param     | Type    | Example        | Description           |
|-----------|---------|----------------|-----------------------|
| search    | string  | ruby           | Full-text search      |
| gemType   | string  | Sapphire       | Filter by type        |
| location  | string  | Colombo        | Filter by location    |
| certified | boolean | true           | Certified only        |
| minPrice  | number  | 500            | Min price filter      |
| maxPrice  | number  | 2000           | Max price filter      |
| page      | number  | 1              | Pagination            |
| limit     | number  | 12             | Items per page        |

---

## Business Rules

1. **Approval flow** — New listings start as `PENDING`. Only `APPROVED` listings appear in public browse. Admins approve/reject from `/admin`.
2. **Ownership** — Only the listing owner (or admin) can edit/delete.
3. **WhatsApp privacy** — Phone numbers are never exposed directly in responses. Only a tracked redirect link is generated server-side.
4. **Re-approval** — Editing core fields (title, description, price) resets status to `PENDING`.
5. **Image upload** — Images go to Cloudinary and are stored as URLs in the `Image` table.

---

## Production Checklist

- [ ] Set `JWT_SECRET` to a long random string (`openssl rand -hex 64`)
- [ ] Use a managed PostgreSQL (Neon, Supabase, Railway, RDS)
- [ ] Configure Cloudinary with upload presets
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable HTTPS
- [ ] Add rate limiting to auth endpoints
- [ ] Set up DB connection pooling (PgBouncer / Prisma Accelerate)
- [ ] Add email notifications for listing approval

---

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy `Cloud Name`, `API Key`, `API Secret`
3. Paste into `.env`
4. Images are automatically optimized and resized on upload

---

## Database Schema Overview

```
User          ─── (1:N) ──→  Listing
Listing       ─── (1:N) ──→  Image
Listing       ─── (1:1) ──→  Tracking
```

---

## Running in Production

```bash
npm run build
npm start
```

Or deploy to Vercel:

```bash
npx vercel --prod
```

> Add all `.env` variables to Vercel → Settings → Environment Variables
