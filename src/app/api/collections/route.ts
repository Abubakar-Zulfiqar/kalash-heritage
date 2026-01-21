import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await getDatabase();
    const collectionRepo = db.getRepository("Collection");

    const collections = await collectionRepo.find({
      relations: ["categories", "sizes"],
      order: { displayOrder: "ASC" },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
