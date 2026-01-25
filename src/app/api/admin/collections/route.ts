import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

// GET all collections
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);
    const collections = await collectionRepo.find({
      relations: ["categories", "sizes"],
      order: { displayOrder: "ASC" },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

// POST create new collection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, image, hasCategories } = data;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const db = await getDatabase();
    const { Collection: CollectionEntity } = await import("@/entities/Collection");
    const collectionRepo = db.getRepository(CollectionEntity);

    // Check if slug already exists
    const existing = await collectionRepo.findOne({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A collection with this name already exists" }, { status: 400 });
    }

    // Auto-calculate displayOrder (get max + 1)
    const maxOrderResult = await collectionRepo
      .createQueryBuilder("collection")
      .select("MAX(collection.displayOrder)", "maxOrder")
      .getRawOne();
    const displayOrder = (maxOrderResult?.maxOrder || 0) + 1;

    const collection = collectionRepo.create({
      name,
      slug,
      description,
      image,
      displayOrder,
      hasCategories: hasCategories || false,
    });

    await collectionRepo.save(collection);

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
