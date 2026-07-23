import { NextResponse } from "next/server";
import { getUpcomingAvailability } from "@/lib/availability-store";

// Public endpoint: only exposes what the booking form needs (date, time
// window, capacity, remaining seats, open/closed) — never customer PII,
// which lives only in `bookings` and is never queried with the anon key.
export async function GET() {
  try {
    const slots = await getUpcomingAvailability();
    return NextResponse.json({
      slots: slots.map((s) => ({
        id: s.id,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: s.capacity,
        remaining: Math.max(0, s.remaining),
        isAvailable: s.isAvailable,
      })),
    });
  } catch (err) {
    console.error("[availability] failed to load availability", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
