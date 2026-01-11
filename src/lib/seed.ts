import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDatabase } from "./db";
import { Category } from "../entities/Category";
import { Product } from "../entities/Product";
import { User, UserRole } from "../entities/User";
import bcrypt from "bcryptjs";
import { generateSlug, generateSKU } from "./utils";


export async function seedDatabase() {
  const db = await getDatabase();

  console.log("🌱 Seeding database...");

  // Create admin user
  const userRepository = db.getRepository(User);
  const existingAdmin = await userRepository.findOne({
    where: { email: "admin@kalashheritage.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = userRepository.create({
      email: "admin@kalashheritage.com",
      name: "Admin",
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);
    console.log("✅ Admin user created");
  }

  // Create categories
  const categoryRepository = db.getRepository(Category);
  const existingCategories = await categoryRepository.count();

  if (existingCategories === 0) {
    const categories = [
      {
        name: "Tribal",
        slug: "tribal",
        description: "Traditional handmade tribal rugs with authentic patterns and cultural heritage",
        image: "/data/tribal.jpeg",
      },
      {
        name: "Seljuk",
        slug: "seljuk",
        description: "Historic Seljuk-inspired designs featuring intricate medallions and motifs",
        image: "/data/seljuk.jpeg",
      },
      {
        name: "Vintage",
        slug: "vintage",
        description: "Authentic vintage pieces with unique character and timeless appeal",
        image: "/data/vintage.jpeg",
      },
      {
        name: "Kilims",
        slug: "kilims",
        description: "Traditional flat-woven kilims with bold geometric patterns",
        image: "/data/kilims.jpeg",
      },
      {
        name: "Modern Rugs",
        slug: "modern-rugs",
        description: "Contemporary designs for modern living spaces",
        image: "/data/modern-rugs.jpeg",
      },
    ];

    for (const cat of categories) {
      const category = categoryRepository.create(cat);
      await categoryRepository.save(category);
    }
    console.log("✅ Categories created");
  }

  // Create products
  const productRepository = db.getRepository(Product);
  const existingProducts = await productRepository.count();

  if (existingProducts === 0) {
    const categories = await categoryRepository.find();

    const products = [
      // Tribal Rugs
      {
        name: "Handmade Tribal Rug - Red & Blue",
        description: "Exquisite handmade tribal rug featuring traditional patterns in vibrant red and blue colors. Crafted by master artisans using premium wool.",
        price: 1200,
        salePrice: 999,
        size: "9'2\" x 5'9\"",
        dimensions: "280cm x 175cm",
        material: "Wool",
        color: "Red",
        colors: ["Red", "Blue", "Cream"],
        style: "Tribal",
        origin: "Pakistan",
        collection: "Heritage Collection",
        pattern: "Tribal",
        stock: 5,
        featured: true,
        categoryId: categories[0].id,
      },
      {
        name: "Traditional Tribal Runner - Navy & Beige",
        description: "Elegant tribal runner rug perfect for hallways. Features authentic tribal patterns with navy blue and beige tones.",
        price: 850,
        size: "10' x 3'",
        dimensions: "305cm x 91cm",
        material: "Wool & Cotton",
        color: "Navy",
        colors: ["Navy", "Beige", "Gold"],
        style: "Tribal",
        origin: "Afghanistan",
        pattern: "Tribal",
        stock: 8,
        featured: true,
        categoryId: categories[0].id,
      },
      {
        name: "Handwoven Bokhara Rug - Burgundy",
        description: "Traditional Bokhara pattern with repeated gul motifs. Rich burgundy color throughout.",
        price: 980,
        size: "6' x 4'",
        dimensions: "183cm x 122cm",
        material: "Wool",
        color: "Burgundy",
        colors: ["Burgundy", "Black"],
        style: "Tribal",
        origin: "Pakistan",
        pattern: "Bokhara",
        stock: 7,
        categoryId: categories[0].id,
      },

      // Seljuk Rugs
      {
        name: "Seljuk Medallion Carpet - Ivory & Blue",
        description: "Historic Seljuk-inspired design with intricate medallion pattern. Museum-quality craftsmanship in ivory and blue.",
        price: 2500,
        salePrice: 2199,
        size: "12' x 9'",
        dimensions: "366cm x 274cm",
        material: "Pure Wool",
        color: "Ivory",
        colors: ["Ivory", "Blue", "Red"],
        style: "Seljuk",
        origin: "Pakistan",
        collection: "Premium Collection",
        pattern: "Medallion",
        stock: 3,
        featured: true,
        categoryId: categories[1].id,
      },
      {
        name: "Seljuk Heriz Rug - Rust & Navy",
        description: "Classic Seljuk design featuring bold medallion and corner motifs in rust and navy.",
        price: 1850,
        size: "9' x 6'",
        dimensions: "274cm x 183cm",
        material: "Wool",
        color: "Rust",
        colors: ["Rust", "Navy", "Cream"],
        style: "Seljuk",
        origin: "Pakistan",
        pattern: "Medallion",
        stock: 4,
        categoryId: categories[1].id,
      },
      {
        name: "Seljuk Carpet - Rose & Gold",
        description: "Elegant Seljuk design with central medallion and floral motifs in soft rose tones with gold accents.",
        price: 2200,
        salePrice: 1999,
        size: "11' x 8'",
        dimensions: "335cm x 244cm",
        material: "Pure Wool",
        color: "Rose",
        colors: ["Rose", "Ivory", "Gold"],
        style: "Seljuk",
        origin: "Pakistan",
        collection: "Heritage Collection",
        pattern: "Medallion",
        stock: 3,
        categoryId: categories[1].id,
      },

      // Vintage Rugs
      {
        name: "Vintage Persian Rug - Multi-Color",
        description: "Authentic vintage piece with vibrant multi-color palette. Unique piece with historical character.",
        price: 1450,
        salePrice: 1299,
        size: "8' x 5'",
        dimensions: "244cm x 152cm",
        material: "Wool",
        color: "Multi",
        colors: ["Red", "Blue", "Gold", "Cream"],
        style: "Vintage",
        origin: "Pakistan",
        collection: "Vintage Collection",
        pattern: "Floral",
        stock: 4,
        featured: true,
        categoryId: categories[2].id,
      },
      {
        name: "Antique Vintage Runner - Terracotta",
        description: "Beautiful antique vintage runner in warm terracotta tones. Perfect for adding vintage charm.",
        price: 820,
        size: "8' x 2.5'",
        dimensions: "244cm x 76cm",
        material: "Wool",
        color: "Terracotta",
        colors: ["Terracotta", "Cream", "Brown"],
        style: "Vintage",
        origin: "Afghanistan",
        pattern: "Floral",
        stock: 5,
        categoryId: categories[2].id,
      },
      {
        name: "Vintage Rug - Earth Tones",
        description: "Authentic vintage piece in warm earth tones. Timeless design that adds character to any space.",
        price: 640,
        size: "5' x 3.5'",
        dimensions: "152cm x 107cm",
        material: "Wool",
        color: "Brown",
        colors: ["Brown", "Beige", "Orange"],
        style: "Vintage",
        origin: "Afghanistan",
        pattern: "Traditional",
        stock: 6,
        categoryId: categories[2].id,
      },

      // Kilims
      {
        name: "Traditional Kilim - Multi-Color",
        description: "Authentic flat-woven kilim with vibrant multi-color palette and bold geometric patterns.",
        price: 450,
        salePrice: 399,
        size: "5' x 3'",
        dimensions: "152cm x 91cm",
        material: "Wool",
        color: "Multi",
        colors: ["Red", "Blue", "Yellow", "Green"],
        style: "Kilim",
        origin: "Turkey",
        collection: "Kilim Collection",
        pattern: "Geometric",
        stock: 8,
        featured: true,
        categoryId: categories[3].id,
      },
      {
        name: "Afghan Kilim - Earth Tones",
        description: "Handwoven Afghan kilim with traditional geometric patterns in warm earth tones.",
        price: 520,
        size: "6' x 4'",
        dimensions: "183cm x 122cm",
        material: "Wool",
        color: "Brown",
        colors: ["Brown", "Beige", "Rust"],
        style: "Kilim",
        origin: "Afghanistan",
        pattern: "Geometric",
        stock: 6,
        categoryId: categories[3].id,
      },
      {
        name: "Kilim Runner - Navy & Red",
        description: "Beautiful kilim runner with bold geometric patterns. Perfect for hallways and narrow spaces.",
        price: 380,
        size: "8' x 2.5'",
        dimensions: "244cm x 76cm",
        material: "Wool",
        color: "Navy",
        colors: ["Navy", "Red", "Cream"],
        style: "Kilim",
        origin: "Turkey",
        pattern: "Geometric",
        stock: 10,
        categoryId: categories[3].id,
      },

      // Modern Rugs
      {
        name: "Modern Abstract Rug - Grey & White",
        description: "Contemporary abstract design in neutral grey and white tones. Perfect for modern minimalist interiors.",
        price: 680,
        size: "8' x 5'",
        dimensions: "244cm x 152cm",
        material: "Wool & Viscose",
        color: "Grey",
        colors: ["Grey", "White"],
        style: "Modern",
        origin: "Pakistan",
        collection: "Contemporary Collection",
        pattern: "Abstract",
        stock: 12,
        featured: true,
        categoryId: categories[4].id,
      },
      {
        name: "Geometric Modern Rug - Teal & Gold",
        description: "Bold geometric pattern combining teal and gold metallic threads. Statement piece for contemporary spaces.",
        price: 920,
        size: "7' x 5'",
        dimensions: "213cm x 152cm",
        material: "Wool & Silk",
        color: "Teal",
        colors: ["Teal", "Gold", "Ivory"],
        style: "Modern",
        origin: "Pakistan",
        pattern: "Geometric",
        stock: 6,
        categoryId: categories[4].id,
      },
      {
        name: "Minimalist Stripe Rug - Black & Cream",
        description: "Simple yet elegant striped design. High-contrast black and cream for modern interiors.",
        price: 560,
        size: "6' x 4'",
        dimensions: "183cm x 122cm",
        material: "Cotton & Wool",
        color: "Black",
        colors: ["Black", "Cream"],
        style: "Modern",
        origin: "Pakistan",
        pattern: "Stripe",
        stock: 15,
        categoryId: categories[4].id,
      },
      {
        name: "Contemporary Wave Rug - Blue Ombre",
        description: "Modern wave pattern with beautiful blue ombre effect. Adds movement to any space.",
        price: 720,
        size: "7' x 5'",
        dimensions: "213cm x 152cm",
        material: "Wool & Viscose",
        color: "Blue",
        colors: ["Blue", "Teal", "White"],
        style: "Modern",
        origin: "Pakistan",
        pattern: "Abstract",
        stock: 10,
        categoryId: categories[4].id,
      },
    ];

    for (const productData of products) {
      const product = productRepository.create({
        ...productData,
        slug: generateSlug(productData.name),
        sku: generateSKU(),
        images: [
          "/placeholder-rug.svg",
          "/placeholder-rug.svg",
          "/placeholder-rug.svg",
        ],
        thumbnail: "/placeholder-rug.svg",
        inStock: true,
        currency: "USD",
        metaTitle: productData.name,
        metaDescription: productData.description,
      });

      await productRepository.save(product);
    }

    console.log("✅ Products created");
  }

  console.log("🎉 Database seeding completed!");
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
