import "server-only";
import { supabase, isSupabaseConfigured } from "./supabase";

export type AvailabilitySlot = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM:SS
  endTime: string | null;
  capacity: number;
  isAvailable: boolean;
  internalNote: string | null;
  bookedCount: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
};

type AvailabilityRow = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  capacity: number;
  is_available: boolean;
  internal_note: string | null;
  booked_count: number;
  remaining: number;
  created_at: string;
  updated_at: string;
};

function fromRow(row: AvailabilityRow): AvailabilitySlot {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    capacity: row.capacity,
    isAvailable: row.is_available,
    internalNote: row.internal_note,
    bookedCount: row.booked_count,
    remaining: row.remaining,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** All upcoming slots (today or later), with live remaining-seats counts. */
export async function getUpcomingAvailability(): Promise<AvailabilitySlot[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase!
    .from("booking_availability_status")
    .select("*")
    .gte("date", todayStr())
    .order("date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return (data as AvailabilityRow[]).map(fromRow);
}

/** Every slot regardless of date, for the admin dashboard. */
export async function getAllAvailability(): Promise<AvailabilitySlot[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase!
    .from("booking_availability_status")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return (data as AvailabilityRow[]).map(fromRow);
}

export async function createAvailability(input: {
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  capacity: number;
  internalNote?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("SUPABASE_REQUIRED");

  const { error } = await supabase!.from("booking_availability").insert({
    date: input.date,
    start_time: input.startTime || null,
    end_time: input.endTime || null,
    capacity: input.capacity,
    internal_note: input.internalNote || null,
  });

  if (error) throw error;
}

/** Creates one slot per day in [startDate, endDate] (inclusive). Existing
 * date+time combinations are left untouched rather than duplicated. */
export async function bulkCreateAvailability(input: {
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  capacity: number;
  internalNote?: string | null;
  skipWeekends: boolean;
}): Promise<{ created: number }> {
  if (!isSupabaseConfigured) throw new Error("SUPABASE_REQUIRED");

  const rows: {
    date: string;
    start_time: string | null;
    end_time: string | null;
    capacity: number;
    internal_note: string | null;
  }[] = [];

  const start = new Date(`${input.startDate}T00:00:00`);
  const end = new Date(`${input.endDate}T00:00:00`);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    if (input.skipWeekends && isWeekend) continue;

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    rows.push({
      date: `${y}-${m}-${day}`,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      capacity: input.capacity,
      internal_note: input.internalNote || null,
    });
  }

  if (rows.length === 0) return { created: 0 };

  // Plain insert + pre-filter instead of upsert(onConflict: ...): avoids
  // depending on Postgres/PostgREST recognizing the (date, start_time)
  // unique index for ON CONFLICT resolution, which isn't guaranteed across
  // every Supabase project/schema-cache state.
  const { data: existing, error: fetchError } = await supabase!
    .from("booking_availability")
    .select("date, start_time")
    .gte("date", input.startDate)
    .lte("date", input.endDate);

  if (fetchError) throw fetchError;

  const existingKeys = new Set(
    (existing ?? []).map((r) => `${r.date}|${r.start_time ?? ""}`)
  );

  const newRows = rows.filter(
    (r) => !existingKeys.has(`${r.date}|${r.start_time ?? ""}`)
  );

  if (newRows.length === 0) return { created: 0 };

  const { error } = await supabase!.from("booking_availability").insert(newRows);

  if (error) throw error;
  return { created: newRows.length };
}

export async function updateAvailability(
  id: string,
  patch: { capacity?: number; isAvailable?: boolean; internalNote?: string | null }
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("SUPABASE_REQUIRED");

  const update: Record<string, unknown> = {};
  if (patch.capacity !== undefined) update.capacity = patch.capacity;
  if (patch.isAvailable !== undefined) update.is_available = patch.isAvailable;
  if (patch.internalNote !== undefined) update.internal_note = patch.internalNote || null;

  const { error } = await supabase!.from("booking_availability").update(update).eq("id", id);
  if (error) throw error;
}

export async function deleteAvailability(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("SUPABASE_REQUIRED");

  const { error } = await supabase!.from("booking_availability").delete().eq("id", id);
  if (error) throw error;
}
