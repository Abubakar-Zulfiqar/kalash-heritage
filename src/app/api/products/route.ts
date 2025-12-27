import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { Product } from "@/entities/Product";
import { Like } from "typeorm";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const size = searchParams.get("size");
    const color = searchParams.get("color");
    const style = searchParams.get("style");
    const material = searchParams.get("material");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "DESC") as "ASC" | "DESC";

    const db = await getDatabase();
    const productRepository = db.getRepository(Product);

    // Build query
    const queryBuilder = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category");

    // Apply filters
    if (category) {
      queryBuilder.andWhere("category.slug = :category", { category });
    }

    if (minPrice) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice: parseFloat(minPrice) });
    }

    if (maxPrice) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice: parseFloat(maxPrice) });
    }

    if (size) {
      queryBuilder.andWhere("product.size LIKE :size", { size: `%${size}%` });
    }

    if (color) {
      queryBuilder.andWhere("product.color = :color", { color });
    }

    if (style) {
      queryBuilder.andWhere("product.style = :style", { style });
    }

    if (material) {
      queryBuilder.andWhere("product.material LIKE :material", { material: `%${material}%` });
    }

    if (search) {
      queryBuilder.andWhere(
        "(product.name LIKE :search OR product.description LIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (featured === "true") {
      queryBuilder.andWhere("product.featured = :featured", { featured: true });
    }

    queryBuilder.andWhere("product.inStock = :inStock", { inStock: true });

    // Count total
    const total = await queryBuilder.getCount();

    // Apply sorting and pagination
    queryBuilder
      .orderBy(`product.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const products = await queryBuilder.getMany();

    return NextResponse.json({
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
