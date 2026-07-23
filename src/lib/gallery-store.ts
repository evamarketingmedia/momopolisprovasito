import "server-only";
import { supabase, isSupabaseConfigured } from "./supabase";
import { gallerySeed, bareUnsplashUrl } from "@/data/gallery";
import type { GalleryImage } from "@/data/gallery";

const FALLBACK_IMAGES: GalleryImage[] = gallerySeed.map((img) => ({
  id: img.id,
  category: img.category,
  url: bareUnsplashUrl(img.photoId),
}));

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!isSupabaseConfigured) {
    return FALLBACK_IMAGES;
  }

  const { data, error } = await supabase!
    .from("gallery_images")
    .select("id, category, url")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[gallery] failed to fetch from Supabase, using fallback", error);
    return FALLBACK_IMAGES;
  }

  if (!data || data.length === 0) {
    return FALLBACK_IMAGES;
  }

  return data as GalleryImage[];
}
