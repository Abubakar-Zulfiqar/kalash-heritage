import { NextRequest, NextResponse } from "next/server";
import { getProducts, productQueryFromParams } from "@/lib/queries";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      await getProducts(productQueryFromParams(request.nextUrl.searchParams))
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
