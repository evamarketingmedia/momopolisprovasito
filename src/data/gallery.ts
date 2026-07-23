export type GalleryCategory = "playground" | "parties" | "events";

// The shape used across the app once an image has a resolved URL — whether
// it came from Supabase (`gallery_images` table) or the static fallback below.
export type GalleryImage = {
  id: string;
  category: GalleryCategory;
  url: string;
};

type GallerySeedImage = {
  id: string;
  category: GalleryCategory;
  photoId: string;
};

// Royalty-free photography (Unsplash License — free for commercial use) used
// as a fallback when Supabase isn't configured yet. Once `gallery_images` has
// rows (see supabase/schema.sql), those take over — see src/lib/gallery-store.ts.
export const gallerySeed: GallerySeedImage[] = [
  { id: "g1", category: "playground", photoId: "photo-1606733894347-7cb201dc810b" },
  { id: "g2", category: "playground", photoId: "photo-1623231411138-b1b47f72c91c" },
  { id: "g3", category: "playground", photoId: "photo-1605813968977-07f8b75c0bf0" },
  { id: "g4", category: "playground", photoId: "photo-1569466126773-842a038eae3e" },
  { id: "g5", category: "playground", photoId: "photo-1641686288048-b1994a394b95" },
  { id: "g6", category: "playground", photoId: "photo-1604921827342-b4bc94df162c" },
  { id: "g7", category: "playground", photoId: "photo-1544438825-f1222acc39dc" },
  { id: "g8", category: "parties", photoId: "photo-1531956531700-dc0ee0f1f9a5" },
  { id: "g9", category: "parties", photoId: "photo-1608790672275-309c02d888ff" },
  { id: "g10", category: "parties", photoId: "photo-1602631985686-1bb0e6a8696e" },
  { id: "g11", category: "parties", photoId: "photo-1509666537727-9154b6962292" },
  { id: "g12", category: "parties", photoId: "photo-1516668557604-c8e814fdb184" },
  { id: "g13", category: "parties", photoId: "photo-1615445565741-c60a9edd393f" },
  { id: "g14", category: "parties", photoId: "photo-1688632107202-7902806ff3d4" },
  { id: "g15", category: "events", photoId: "photo-1611596534346-94839c5622ab" },
  { id: "g16", category: "events", photoId: "photo-1591171986440-5591a68ce6ef" },
  { id: "g17", category: "events", photoId: "photo-1663627654773-d23a1750597d" },
  { id: "g18", category: "events", photoId: "photo-1629862403793-332f8c1ceb0c" },
  { id: "g19", category: "events", photoId: "photo-1542868796-20f2ddc9d41f" },
  { id: "g20", category: "events", photoId: "photo-1759330203240-b89ccee8840f" },
];

// Extra shots (not in the gallery grid) used for hero banners, section
// teasers, and page headers across the site.
export const featureImages = {
  heroSlide: "photo-1691903835735-d7d3e45bc238",
  heroJump: "photo-1620700374542-d129058c0d0a",
  aboutStory: "photo-1631512700403-ee66a05fd497",
  aboutTeam: "photo-1704747199445-85f81dfd8605",
  zonesA: "photo-1631512700356-574da7748a44",
  zonesB: "photo-1663579169382-2f30a1b26bcb",
  zonesC: "photo-1689609523729-00a50c278c18",
  eventBirthday: "photo-1631397831385-b6023fd545ac",
  eventClass: "photo-1553710120-23dd1551da41",
  eventCorporate: "photo-1607977229409-8c278bc34628",
  eventThemed: "photo-1585645187037-a27267194293",
};

export function unsplashUrl(photoId: string, width = 800, height = 600) {
  return `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&q=80&auto=format`;
}

export function bareUnsplashUrl(photoId: string) {
  return `https://images.unsplash.com/${photoId}`;
}

// Appends imgix-style resize params (Unsplash supports these natively;
// other hosts, e.g. Supabase Storage, simply ignore unknown query params
// and serve the original — next/image resizes it further either way).
export function withSize(url: string, width: number, height: number) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&h=${height}&fit=crop&q=80&auto=format`;
}
