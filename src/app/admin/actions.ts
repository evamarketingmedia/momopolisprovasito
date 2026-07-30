"use server";

import { redirect } from "next/navigation";
import {
  checkAdminCredentials,
  createAdminSession,
  clearAdminSession,
  requireAdmin,
} from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePublicSite } from "@/lib/revalidate-site";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!(await checkAdminCredentials(username, password))) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateSiteImage(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const key = String(formData.get("key") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!key || !url) throw new Error("Missing key or url");

  const { error } = await supabase!
    .from("site_images")
    .upsert({ key, url, updated_at: new Date().toISOString() });

  if (error) throw error;

  revalidatePublicSite();
  redirect("/admin?saved=1");
}

export async function addGalleryImage(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const category = String(formData.get("category") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!["playground", "parties", "events"].includes(category) || !url) {
    throw new Error("Invalid category or url");
  }

  const { error } = await supabase!
    .from("gallery_images")
    .insert({ category, url, sort_order: Number.isFinite(sortOrder) ? sortOrder : 0 });

  if (error) throw error;

  revalidatePublicSite();
  redirect("/admin?saved=1");
}

export async function updateGalleryImage(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!id || !url) throw new Error("Missing id or url");

  const { error } = await supabase!.from("gallery_images").update({ url }).eq("id", id);
  if (error) throw error;

  revalidatePublicSite();
  redirect("/admin?saved=1");
}

export async function deleteGalleryImage(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const { error } = await supabase!.from("gallery_images").delete().eq("id", id);
  if (error) throw error;

  revalidatePublicSite();
  redirect("/admin?saved=1");
}

export async function updatePartyConfig(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");

  const parseChoices = (name: string) => {
    const value = JSON.parse(String(formData.get(name) ?? "[]"));
    if (!Array.isArray(value)) throw new Error(`${name} non valido`);
    return value.map((item) => ({
      id: String(item.id ?? "").trim(),
      label: String(item.label ?? "").trim(),
      description: String(item.description ?? "").trim(),
      price: Number(item.price ?? 0),
    })).filter((item) => item.id && item.label && Number.isFinite(item.price));
  };

  const value = {
    baseWeekdayPrice: Number(formData.get("baseWeekdayPrice")),
    baseHolidayPrice: Number(formData.get("baseHolidayPrice")),
    holidayDates: String(formData.get("holidayDates") ?? "")
      .split(/\s|,/)
      .map((date) => date.trim())
      .filter(Boolean),
    baseChildPrice: Number(formData.get("baseChildPrice")),
    adultPrice: Number(formData.get("adultPrice")),
    minimumChildren: Number(formData.get("minimumChildren")),
    packages: parseChoices("packages"),
    cakes: parseChoices("cakes"),
    extras: parseChoices("extras"),
    setups: parseChoices("setups"),
  };

  if (![value.baseWeekdayPrice, value.baseHolidayPrice, value.baseChildPrice, value.adultPrice, value.minimumChildren].every(Number.isFinite)) {
    throw new Error("Prezzi base non validi");
  }

  const { error } = await supabase!.from("site_images").upsert({
    key: "party_config",
    url: JSON.stringify(value),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;

  revalidatePublicSite();
  redirect("/admin?saved=party");
}
