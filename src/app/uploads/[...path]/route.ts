import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { IMAGE_MIME_TYPES, resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Serves uploaded images from UPLOAD_DIR.
 * In production Nginx serves /uploads/ directly; this route covers local dev
 * and the Next.js image optimizer, which fetches /uploads/... from this server.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = resolveUploadPath(segments.join("/"));
  const contentType = filePath ? IMAGE_MIME_TYPES[path.extname(filePath).toLowerCase()] : undefined;

  if (!filePath || !contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response("Not found", { status: 404 });

    const body = await readFile(filePath);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        // Filenames are unique per upload, so they never change
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
