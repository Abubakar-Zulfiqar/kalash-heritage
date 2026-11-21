import { NextRequest, NextResponse } from "next/server";
import { getCategoryInCollection } from "@/lib/queries";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; categorySlug: string }> }
) {
  try {
    const { slug, categorySlug } = await params;
    const result = await getCategoryInCollection(slug, categorySlug);
    if (!result) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
