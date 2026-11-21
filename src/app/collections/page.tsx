import CollectionsClient from "./CollectionsClient";
import { getCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await getCollections().catch((error) => {
    console.error("Error loading collections:", error);
    return [];
  });
  return <CollectionsClient initialCollections={collections} />;
}
