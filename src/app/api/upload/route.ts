import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { UPLOAD_DIR, UPLOAD_URL_PREFIX, resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const extension = EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Unique, URL-safe filename; the extension comes from the validated MIME type
    const baseName = path
      .parse(file.name)
      .name.replace(/[^a-zA-Z0-9-]/g, "_")
      .slice(0, 60);
    const filename = `${Date.now()}-${randomBytes(4).toString("hex")}-${baseName}${extension}`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));

    const url = `${UPLOAD_URL_PREFIX}${filename}`;
    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Only delete files we host ourselves
    if (url.startsWith(UPLOAD_URL_PREFIX)) {
      const filePath = resolveUploadPath(url.slice(UPLOAD_URL_PREFIX.length));
      if (filePath) {
        await unlink(filePath).catch((err) => {
          if (err.code !== "ENOENT") throw err;
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
