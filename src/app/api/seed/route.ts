import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

// This endpoint should be protected in production
// Only call it once to seed the database
export async function POST(request: Request) {
  try {
    // Simple protection - check for a secret key in the request
    const { secret } = await request.json();

    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await seedDatabase();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
