"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import {
  createAvailability,
  bulkCreateAvailability,
  updateAvailability,
  deleteAvailability,
} from "@/lib/availability-store";
import { cancelBooking } from "@/lib/bookings-store";

function requireSupabase() {
  if (!isSupabaseConfigured) throw new Error("Supabase not configured");
}

export async function createAvailabilityAction(formData: FormData) {
  await requireAdmin();
  requireSupabase();

  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const capacity = Number(formData.get("capacity"));
  const internalNote = String(formData.get("internal_note") ?? "").trim();

  if (!date || !Number.isFinite(capacity) || capacity < 1) {
    throw new Error("Invalid date or capacity");
  }

  await createAvailability({
    date,
    startTime: startTime || null,
    endTime: endTime || null,
    capacity,
    internalNote: internalNote || null,
  });

  revalidatePublicSite();
  redirect("/admin/availability?saved=1");
}

export async function bulkCreateAvailabilityAction(formData: FormData) {
  await requireAdmin();
  requireSupabase();

  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const capacity = Number(formData.get("capacity"));
  const internalNote = String(formData.get("internal_note") ?? "").trim();
  const skipWeekends = formData.get("skip_weekends") === "on";

  if (!startDate || !endDate || !Number.isFinite(capacity) || capacity < 1) {
    throw new Error("Invalid range or capacity");
  }
  if (endDate < startDate) {
    throw new Error("End date before start date");
  }

  await bulkCreateAvailability({
    startDate,
    endDate,
    startTime: startTime || null,
    endTime: endTime || null,
    capacity,
    internalNote: internalNote || null,
    skipWeekends,
  });

  revalidatePublicSite();
  redirect("/admin/availability?saved=1");
}

export async function updateAvailabilityAction(formData: FormData) {
  await requireAdmin();
  requireSupabase();

  const id = String(formData.get("id") ?? "");
  const capacity = Number(formData.get("capacity"));
  const internalNote = String(formData.get("internal_note") ?? "").trim();

  if (!id || !Number.isFinite(capacity) || capacity < 1) {
    throw new Error("Invalid id or capacity");
  }

  await updateAvailability(id, { capacity, internalNote: internalNote || null });

  revalidatePublicSite();
  redirect("/admin/availability?saved=1");
}

export async function toggleAvailabilityAction(formData: FormData) {
  await requireAdmin();
  requireSupabase();

  const id = String(formData.get("id") ?? "");
  const nextIsAvailable = formData.get("next_is_available") === "true";
  if (!id) throw new Error("Missing id");

  await updateAvailability(id, { isAvailable: nextIsAvailable });

  revalidatePublicSite();
  redirect("/admin/availability?saved=1");
}

export async function deleteAvailabilityAction(formData: FormData) {
  await requireAdmin();
  requireSupabase();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  await deleteAvailability(id);

  revalidatePublicSite();
  redirect("/admin/availability?saved=1");
}

export async function cancelBookingAction(formData: FormData) {
  await requireAdmin();
  requireSupabase();

  const bookingId = String(formData.get("booking_id") ?? "");
  if (!bookingId) throw new Error("Missing booking id");

  await cancelBooking(bookingId);

  revalidatePublicSite();
  redirect("/admin/availability?saved=1");
}
