// Runs once when the Next.js server starts. On a long-running server this
// opens the database pool up front, so the first request (e.g. a login)
// doesn't pay for loading TypeORM and connecting.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production" || !process.env.DATABASE_URL) return;

  try {
    const { getDatabase } = await import("@/lib/db");
    await getDatabase();
  } catch (error) {
    // Don't crash the server; requests will retry the connection.
    console.error("Database warm-up failed:", error);
  }
}
