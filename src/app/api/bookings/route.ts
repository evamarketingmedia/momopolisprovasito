import { NextResponse } from "next/server";
import { createBookingAtomic } from "@/lib/bookings-store";
import { sendBookingEmails } from "@/lib/email";
import { hasLocale, defaultLocale } from "@/lib/dictionaries";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const availabilityId = String(body.availabilityId ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const partyType = String(body.partyType ?? "").trim();
  const participants = Number(body.participants);
  const message = body.message ? String(body.message).trim() : undefined;
  const rawLocale = String(body.locale ?? defaultLocale);
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;

  if (!availabilityId || !UUID_RE.test(availabilityId)) {
    return NextResponse.json({ error: "INVALID_AVAILABILITY" }, { status: 400 });
  }
  if (!name || !email || !phone || !partyType) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }
  // Authoritative check: capacity is re-verified server-side inside
  // create_booking() regardless of what the client claims here.
  if (!Number.isFinite(participants) || participants < 1) {
    return NextResponse.json({ error: "INVALID_PARTICIPANTS" }, { status: 400 });
  }

  try {
    const booking = await createBookingAtomic({
      availabilityId,
      name,
      email,
      phone,
      participants,
      partyType,
      message,
      locale,
    });

    try {
      await sendBookingEmails(booking);
    } catch (err) {
      console.error(`[bookings] email dispatch threw for booking ${booking.id}`, err);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";

    if (message === "AVAILABILITY_NOT_FOUND") {
      return NextResponse.json({ error: "AVAILABILITY_NOT_FOUND" }, { status: 404 });
    }
    if (message === "AVAILABILITY_CLOSED" || message === "NOT_ENOUGH_SEATS") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (message === "INVALID_PARTICIPANTS") {
      return NextResponse.json({ error: "INVALID_PARTICIPANTS" }, { status: 400 });
    }
    if (message === "SUPABASE_REQUIRED") {
      console.error("[bookings] Supabase is not configured");
      return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503 });
    }

    console.error("[bookings] failed to create booking", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
