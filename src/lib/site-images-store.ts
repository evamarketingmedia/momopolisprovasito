import "server-only";
import { supabase, isSupabaseConfigured } from "./supabase";
import { featureImages, bareUnsplashUrl } from "@/data/gallery";

export type SiteImageKey = keyof typeof featureImages;

const FALLBACK: Record<SiteImageKey, string> = Object.fromEntries(
  Object.entries(featureImages).map(([key, photoId]) => [key, bareUnsplashUrl(photoId)])
) as Record<SiteImageKey, string>;

// snake_case keys in the DB (site_images.key) map to the camelCase keys used
// in application code (featureImages).
const KEY_MAP: Record<string, SiteImageKey> = {
  hero_slide: "heroSlide",
  hero_jump: "heroJump",
  about_story: "aboutStory",
  about_team: "aboutTeam",
  zones_a: "zonesA",
  zones_b: "zonesB",
  zones_c: "zonesC",
  event_birthday: "eventBirthday",
  event_class: "eventClass",
  event_corporate: "eventCorporate",
  event_themed: "eventThemed",
};

export async function getSiteImages(): Promise<Record<SiteImageKey, string>> {
  if (!isSupabaseConfigured) {
    return FALLBACK;
  }

  const { data, error } = await supabase!.from("site_images").select("key, url");

  if (error) {
    console.error("[site-images] failed to fetch from Supabase, using fallback", error);
    return FALLBACK;
  }

  const result = { ...FALLBACK };
  for (const row of data ?? []) {
    const appKey = KEY_MAP[row.key as string];
    if (appKey) result[appKey] = row.url as string;
  }
  return result;
}
