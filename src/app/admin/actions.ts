"use server";

import { redirect } from "next/navigation";
import {
  checkAdminPassword,
  createAdminSession,
  clearAdminSession,
  requireAdmin,
} from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePublicSite } from "@/lib/revalidate-site";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!checkAdminPassword(password)) {
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
