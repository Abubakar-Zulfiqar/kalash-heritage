import HomeClient from "./HomeClient";
import { getCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const collections = await getCollections().catch((error) => {
    console.error("Error loading collections:", error);
    return [];
  });
  return <HomeClient initialCollections={collections} />;
}
