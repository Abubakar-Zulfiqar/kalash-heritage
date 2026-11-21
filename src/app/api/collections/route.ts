import { NextResponse } from "next/server";
import { getCollections } from "@/lib/queries";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json(await getCollections());
  } catch (error) {
    console.error("Error fetching collections:", error);
    // Return empty array instead of error object to prevent frontend crash
    return NextResponse.json([]);
  }
}
