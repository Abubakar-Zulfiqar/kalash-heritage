import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { Product } from "@/entities/Product";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const db = await getDatabase();
    const productRepository = db.getRepository(Product);

    const product = await productRepository.findOne({
      where: { slug },
      relations: ["category"],
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
