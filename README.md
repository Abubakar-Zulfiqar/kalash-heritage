# Kalash Heritage - E-Commerce Website

A modern, full-featured e-commerce platform for Kalash Heritage carpets, built with Next.js 16.1, TypeScript, PostgreSQL, and TypeORM.

## 🚀 Features

### ✅ **Completed**
- **Modern UI/UX**: Clean, premium design with Tailwind CSS
- **Product Catalog**: Advanced filtering by category, color, style, price
- **Product Detail Pages**: Image gallery, specifications, add to cart
- **Shopping Cart**: Real-time updates, quantity management
- **Multi-Currency Support**: USD, EUR, GBP, PKR, AED, SAR
- **Region-Based Shipping**: Automatic calculation by country
- **Responsive Design**: Mobile-first, works on all devices
- **SEO Optimized**: Meta tags, structured data ready
- **About Us Page**: Company story, craftsmanship process
- **Contact Page**: Inquiry form with multiple contact methods
- **Database**: PostgreSQL with TypeORM auto-sync
- **Payment Service Abstraction**: Ready for Stripe/PayPal/Safepay

### 🚧 **To Be Implemented**
- **Checkout Flow**: Complete payment integration
- **User Authentication**: NextAuth for users and admin
- **Admin Panel**: Product/Order/User management
- **Order Tracking**: Real-time order status updates
- **Email Notifications**: Order confirmations, shipping updates
- **Product Reviews**: Customer feedback system
- **Wishlist**: Save favorite products

## 🛠 Tech Stack

- **Framework**: Next.js 16.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Database**: PostgreSQL
- **ORM**: TypeORM (with auto-sync)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Payment**: Flexible abstraction layer (Stripe/PayPal/Safepay ready)

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **npm**: 9.x or higher

## 🔧 Installation

### 1. **Install PostgreSQL**

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. **Clone & Install Dependencies**

```bash
cd kalash-heritage
npm install
```

### 3. **Set Up Database**

**Option A: Automatic Setup (Recommended)**
```bash
# This will create the database and start PostgreSQL if needed
./scripts/setup-db.sh
```

**Option B: Manual Setup**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kalash_heritage;

# Exit
\\q
```

### 4. **Configure Environment Variables**

The `.env` file is already created. Update if needed:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kalash_heritage
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=kalash-heritage-secret-key-change-in-production
```

### 5. **Seed the Database**

```bash
npm run seed
```

This will create:
- Admin user (admin@kalashheritage.com / admin123)
- 4 Categories (Oriental Rugs, Modern Rugs, Vintage Kilims, Persian Carpets)
- 15 Sample Products with full details

### 6. **Run Development Server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🗂 Project Structure

```
kalash-heritage/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Product endpoints
│   │   │   └── categories/    # Category endpoints
│   │   ├── shop/              # Shop pages
│   │   ├── cart/              # Shopping cart
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   │
│   ├── components/            # Reusable components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Footer.tsx         # Footer
│   │   └── ProductCard.tsx    # Product card component
│   │
│   ├── entities/              # TypeORM entities
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Order.ts
│   │   ├── Cart.ts
│   │   └── ...
│   │
│   ├── services/              # Business logic
│   │   ├── payment/           # Payment abstraction
│   │   ├── currency/          # Multi-currency
│   │   └── shipping/          # Shipping calculations
│   │
│   ├── store/                 # Zustand state
│   │   ├── cartStore.ts       # Shopping cart
│   │   └── currencyStore.ts   # Currency selection
│   │
│   ├── lib/                   # Utilities
│   │   ├── db.ts              # Database connection
│   │   ├── seed.ts            # Database seeding
│   │   └── utils.ts           # Helper functions
│   │
│   └── types/                 # TypeScript types
│
├── public/                    # Static assets
├── data/                      # Client-provided images/PDFs
└── scripts/                   # Setup scripts
```

## 🎨 Key Pages

### 1. **Homepage** (`/`)
- Hero section with CTA
- Featured collections
- Why choose us section
- About preview
- Trust-building elements

### 2. **Shop** (`/shop`)
- Product grid with filters
- Filter by category, color, style, price
- Sorting options
- Pagination
- 12 products per page

### 3. **Product Detail** (`/shop/[slug]`)
- Image gallery with thumbnails
- Full specifications
- Add to cart with quantity
- Related product suggestions ready

### 4. **Cart** (`/cart`)
- Item list with images
- Quantity controls
- Price calculations
- Shipping estimates
- Proceed to checkout

### 5. **About** (`/about`)
- Company heritage story
- Craftsmanship process (4 steps)
- Core values
- Factory information
- Contact CTA

### 6. **Contact** (`/contact`)
- Contact form with validation
- Head office & factory addresses
- Phone numbers & email
- Business hours
- Subject categorization

## 🔐 Admin Credentials

```
Email: admin@kalashheritage.com
Password: admin123
```

## 💳 Payment Integration

The payment system uses an abstraction layer supporting multiple gateways:

### **Stripe** (Recommended for international)
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **PayPal**
```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### **Safepay** (Pakistan)
```env
SAFEPAY_API_KEY=...
SAFEPAY_SECRET_KEY=...
```

## 🌍 Multi-Currency

Supported currencies with live conversion:
- **USD** - US Dollar (base)
- **EUR** - Euro
- **GBP** - British Pound
- **PKR** - Pakistani Rupee
- **AED** - UAE Dirham
- **SAR** - Saudi Riyal

## 📦 Deployment

### **Vercel** (Recommended)

1. **Create Vercel Postgres Database**
```bash
vercel postgres create
```

2. **Deploy**
```bash
vercel deploy
```

3. **Seed Production Database**
```bash
npm run seed
```

### **Environment Variables on Vercel**
Add all variables from `.env` to Vercel Dashboard.

## 🚢 Next Steps

### **Priority 1: Checkout & Payments**
- [ ] Build checkout page
- [ ] Integrate payment gateway (Stripe/PayPal/Safepay)
- [ ] Order confirmation page
- [ ] Email notifications

### **Priority 2: Authentication**
- [ ] NextAuth setup
- [ ] User registration/login
- [ ] Protected routes
- [ ] User dashboard

### **Priority 3: Admin Panel**
- [ ] Product management (CRUD)
- [ ] Order management
- [ ] Inventory tracking
- [ ] Analytics dashboard

### **Priority 4: Enhancements**
- [ ] Product reviews
- [ ] Wishlist
- [ ] Search functionality
- [ ] Product recommendations
- [ ] Newsletter signup

## 📞 Support

For questions or issues:
- **Email**: info@kalashheritage.com
- **Phone**: +971 50 578 7476

## 📄 License

Proprietary - Kalash Heritage © 2025
