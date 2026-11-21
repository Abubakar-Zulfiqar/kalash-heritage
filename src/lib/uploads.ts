import path from "path";

/** Directory where uploaded images live on disk (outside the build, survives deploys). */
export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")
);

/** Public URL prefix for uploaded files. Nginx serves it directly in production. */
export const UPLOAD_URL_PREFIX = "/uploads/";

/**
 * Resolve a requested upload path to an absolute file path inside UPLOAD_DIR.
 * Returns null for anything that tries to escape the directory.
 */
export function resolveUploadPath(relative: string): string | null {
  const resolved = path.resolve(UPLOAD_DIR, relative);
  if (resolved !== UPLOAD_DIR && resolved.startsWith(UPLOAD_DIR + path.sep)) {
    return resolved;
  }
  return null;
}

export const IMAGE_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};
