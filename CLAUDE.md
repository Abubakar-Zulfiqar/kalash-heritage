# Kalash Heritage - E-Commerce Platform

## Project Overview

Kalash Heritage is a premium e-commerce website for a carpet manufacturer & exporter based in Pakistan. The primary goal is to showcase the business to build trust with customers, dealers, and partners worldwide, while providing full e-commerce functionality.

**Live Site:** https://kalash-heritage.vercel.app (production)
**Domain:** kalashheritage.com (will be pointed from Controloye to Vercel)

## Tech Stack

- **Framework:** Next.js 16.1 (App Router with Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3.4.1
- **Database:** PostgreSQL (Neon serverless on Vercel)
- **ORM:** TypeORM with `synchronize: true` (auto-sync entities)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **Authentication:** NextAuth.js (pending implementation)
- **Fonts:** Playfair Display (serif), Inter (sans-serif)

## Critical Patterns & Known Issues

### 1. TypeORM Circular Dependencies (MOST IMPORTANT)

**Problem:** TypeORM entities with bidirectional relationships cause circular dependency errors during Next.js production builds. String-based relations (e.g., `"Product"`) fail in production with "Entity metadata for n#products was not found" because Next.js mangles entity names during bundling.

**Solution:** Use type-only imports + lazy require() pattern:

```typescript
// ❌ DON'T DO THIS
import { Product } from "./Product";
@ManyToOne(() => Product, (product) => product.category)

// ❌ ALSO DON'T DO THIS (fails in production)
@ManyToOne("Product", (product) => product.category)

// ✅ CORRECT PATTERN
import type { Product } from "./Product";
@ManyToOne(() => require("./Product").Product, (product: Product) => product.category)
```

**All entities use this pattern:** User, Product, Category, Order, OrderItem, Cart, CartItem, ShippingAddress

### 2. Database Connection During Build

The database connection is lazy-loaded and skips during build phase to prevent TypeORM initialization issues:

```typescript
// src/lib/db.ts
export async function getDatabase() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connection skipped during build');
  }

  await import("reflect-metadata");
  const { DataSource } = await import("typeorm");
  // ... rest of initialization
}
```

### 3. Tailwind CSS Version

**Must use v3.4.1** - Tailwind v4 is incompatible with Next.js 16.1. If you see errors about PostCSS plugins, downgrade:

```bash
npm uninstall tailwindcss && npm install -D tailwindcss@^3.4.1
```

### 4. Next.js 16 Async Params

All dynamic routes use async params (Next.js 16 requirement):

```typescript
// ✅ CORRECT
export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  // ...
}
```

## Database Setup

### Local Development

1. Create database:
```bash
createdb kalash_heritage
```

2. Set environment variables in `.env`:
```
DATABASE_URL=postgresql://aslase@localhost:5432/kalash_heritage
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

3. Seed database:
```bash
npm run seed
```

### Production (Vercel)

1. Create Neon PostgreSQL database in Vercel Storage tab
2. Set Custom Prefix to "DATABASE" (NOT "STORAGE")
3. Copy DATABASE_URL to environment variables
4. Run seed locally with production DATABASE_URL in `.env`

**Important:** The seed script uses `ts-node` with `tsconfig-paths` for path alias resolution. Don't modify the seed command without testing.

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production (checks for errors)
npm run seed         # Seed database with sample products
npm run typeorm      # TypeORM CLI commands
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── shop/              # Product listing
│   ├── products/          # Product detail pages
│   ├── cart/              # Shopping cart
│   ├── collections/       # Categories page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── icon.svg           # Custom favicon (rug pattern with "K")
│   ├── layout.tsx         # Root layout with Header/Footer
│   └── api/               # API routes
│       ├── products/      # Product CRUD
│       ├── categories/    # Category endpoints
│       ├── cart/          # Cart operations
│       └── orders/        # Order processing
├── components/            # React components
├── entities/              # TypeORM entities (use lazy require pattern!)
├── lib/                   # Utilities
│   ├── db.ts             # Database connection
│   ├── seed.ts           # Database seeding
│   └── currencyConversion.ts
├── store/                 # Zustand stores
└── styles/                # Global styles
```

## TypeORM Entities

All entities are in `src/entities/` and use the lazy require() pattern for relations:

- **User:** Authentication, profile, orders, cart, shipping addresses
- **Product:** Items for sale (name, price, images, dimensions, materials)
- **Category:** Product categories (Persian, Turkish, Kilims, etc.)
- **Cart / CartItem:** Shopping cart functionality
- **Order / OrderItem:** Order management
- **ShippingAddress:** User shipping information

**Database Schema:** TypeORM auto-syncs with `synchronize: true`. No manual migrations needed in development.

## Features Implemented

✅ Homepage with hero, featured products, categories, testimonials
✅ Shop page with filtering (category, price, size), sorting, pagination
✅ Product detail pages with image gallery, specifications, add to cart
✅ Shopping cart with quantity updates, remove items
✅ Collections page showing all categories
✅ About page with company story
✅ Contact page with form
✅ Multi-currency support (USD, EUR, GBP, PKR, AED, SAR)
✅ Region-based shipping calculations
✅ Responsive design (mobile-first)
✅ Custom favicon with rug pattern
✅ SEO metadata

## Features Pending

❌ Checkout page with payment integration
❌ Authentication (NextAuth for users and admin)
❌ Admin panel for product/order management
❌ Email notifications
❌ Real product images (currently using placeholders)
❌ Domain pointing from Controloye to Vercel

## Payment Gateway

**Stripe is NOT available in Pakistan.** The project uses a payment gateway abstraction layer (`src/lib/paymentGateway.ts`) to support multiple gateways:

- PayPal
- Safepay (Pakistani payment processor)
- Manual bank transfer (for B2B orders)

## Design Guidelines

- **Colors:** Earth tones (browns, beiges) with red accents
- **Typography:** Playfair Display for headings, Inter for body text
- **Style:** Modern, minimal, classy, premium
- **Inspiration:** abchome.com, abbascarpets.com, ahmedorientalcarpets.com

## Image Requirements

Product images should be:
- High resolution (minimum 1200x1200px)
- Multiple angles (front, back, close-up of weave, corner detail)
- White or neutral background
- Professional lighting
- Format: JPEG or WebP

## Deployment

**Platform:** Vercel

**Process:**
1. Push to GitHub
2. Vercel auto-deploys from main branch
3. Environment variables are set in Vercel dashboard
4. Database is Neon PostgreSQL in Vercel Storage

**Environment Variables:**
- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXTAUTH_URL`: Production URL (https://kalash-heritage.vercel.app)
- `NEXTAUTH_SECRET`: Auth secret key

## Troubleshooting

### Build Errors

1. **Tailwind CSS plugin error:** Downgrade to v3.4.1
2. **TypeORM circular dependency:** Check entities use type-only imports + lazy require()
3. **Params type error:** Ensure dynamic routes use `Promise<{ param: string }>`

### Production Issues

1. **Entity metadata not found:** Check TypeORM relations use lazy require(), NOT string-based
2. **Database connection failed:** Verify DATABASE_URL is set with correct prefix in Vercel
3. **API routes timeout:** Check database connection isn't blocked by Vercel firewall

## User Preferences

Based on previous interactions:
- User runs the server themselves in a separate terminal - don't run `npm run dev` unless explicitly asked
- Run build command only when necessary to check for errors
- Don't create markdown files to document implementation unless asked
- Keep metadata simple - user prefers basic SEO over extensive Open Graph tags
- Don't overcomplicate instructions - keep commands simple and direct

## Next Steps

When continuing work on this project:
1. Build checkout page with payment integration
2. Implement NextAuth for user authentication
3. Create admin panel (separate route with auth protection)
4. Set up email notifications (use Resend or similar)
5. Replace placeholder images when client provides real photos
6. Assist with domain migration from Controloye to Vercel
