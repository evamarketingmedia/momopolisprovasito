import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getAllAvailability } from "@/lib/availability-store";
import { listAllBookings, type Booking } from "@/lib/bookings-store";
import {
  createAvailabilityAction,
  bulkCreateAvailabilityAction,
  updateAvailabilityAction,
  toggleAvailabilityAction,
  deleteAvailabilityAction,
  cancelBookingAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Disponibilità · Momopolis Admin",
  robots: { index: false, follow: false },
};

function formatTime(t: string | null) {
  return t ? t.slice(0, 5) : null;
}

const STATUS_LABELS: Record<Booking["status"], string> = {
  pending: "In attesa",
  confirmed: "Confermata",
  cancelled: "Annullata",
};

const STATUS_STYLES: Record<Booking["status"], string> = {
  pending: "bg-momo-orange/10 text-momo-orange",
  confirmed: "bg-momo-green-700/10 text-momo-green-700",
  cancelled: "bg-black/5 text-momo-black/40 line-through",
};

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-momo-cream p-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-black/10 bg-white p-8 text-center">
          <h1 className="font-display text-xl font-extrabold text-momo-black">
            Supabase non configurato
          </h1>
          <p className="mt-3 text-momo-black/70">
            Imposta <code className="rounded bg-black/5 px-1.5 py-0.5">SUPABASE_URL</code> e{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            in <code className="rounded bg-black/5 px-1.5 py-0.5">.env.local</code>, poi esegui{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5">supabase/booking_availability.sql</code>{" "}
            per gestire la disponibilità da qui.
          </p>
        </div>
      </div>
    );
  }

  const { saved } = await searchParams;
  const [slots, bookings] = await Promise.all([getAllAvailability(), listAllBookings()]);

  const bookingsBySlot = new Map<string, Booking[]>();
  for (const b of bookings) {
    if (!b.availabilityId) continue;
    const list = bookingsBySlot.get(b.availabilityId) ?? [];
    list.push(b);
    bookingsBySlot.set(b.availabilityId, list);
  }

  return (
    <div className="min-h-screen bg-momo-cream pb-24">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {saved && (
          <div className="mb-8 rounded-xl bg-momo-green-700/10 px-4 py-3 text-sm font-bold text-momo-green-700">
            Modifica salvata.
          </div>
        )}

        <section>
          <h1 className="font-display text-2xl font-extrabold text-momo-black">
            Disponibilità prenotazioni
          </h1>
          <p className="mt-1 text-sm text-momo-black/60">
            Imposta quanti posti sono disponibili per ogni data (ed eventuale fascia oraria). Il
            calendario di prenotazione sul sito mostra soltanto le date che aggiungi qui.
          </p>
        </section>

        {/* ADD SINGLE DATE */}
        <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-wide text-momo-black/60">
            Aggiungi una data
          </h2>
          <form
            action={createAvailabilityAction}
            className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
          >
            <Field label="Data">
              <input type="date" name="date" required className="momo-input" />
            </Field>
            <Field label="Dalle (opz.)">
              <input type="time" name="start_time" className="momo-input" />
            </Field>
            <Field label="Alle (opz.)">
              <input type="time" name="end_time" className="momo-input" />
            </Field>
            <Field label="Posti">
              <input
                type="number"
                name="capacity"
                min={1}
                required
                defaultValue={20}
                className="momo-input"
              />
            </Field>
            <Field label="Nota interna (opz.)" className="sm:col-span-2 lg:col-span-1">
              <input type="text" name="internal_note" className="momo-input" />
            </Field>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-full bg-momo-orange px-5 py-2.5 text-sm font-extrabold text-momo-black hover:scale-105"
              >
                Aggiungi
              </button>
            </div>
          </form>
        </section>

        {/* BULK ADD */}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-wide text-momo-black/60">
            Aggiungi in blocco (periodo)
          </h2>
          <form
            action={bulkCreateAvailabilityAction}
            className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
          >
            <Field label="Dal">
              <input type="date" name="start_date" required className="momo-input" />
            </Field>
            <Field label="Al">
              <input type="date" name="end_date" required className="momo-input" />
            </Field>
            <Field label="Dalle (opz.)">
              <input type="time" name="start_time" className="momo-input" />
            </Field>
            <Field label="Alle (opz.)">
              <input type="time" name="end_time" className="momo-input" />
            </Field>
            <Field label="Posti">
              <input
                type="number"
                name="capacity"
                min={1}
                required
                defaultValue={20}
                className="momo-input"
              />
            </Field>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-full bg-momo-black px-5 py-2.5 text-sm font-extrabold text-white hover:bg-momo-green-900"
              >
                Genera
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-momo-black/70 sm:col-span-2 lg:col-span-6">
              <input type="checkbox" name="skip_weekends" className="h-4 w-4" />
              Salta sabato e domenica
            </label>
          </form>
          <p className="mt-2 text-xs text-momo-black/50">
            Le date già esistenti (stessa data e fascia) non vengono sovrascritte.
          </p>
        </section>

        {/* SLOTS LIST */}
        <section className="mt-10 space-y-4">
          {slots.length === 0 && (
            <p className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center text-sm text-momo-black/50">
              Nessuna data configurata. Aggiungine una qui sopra: finché non lo fai, il calendario
              di prenotazione sul sito risulterà vuoto.
            </p>
          )}

          {slots.map((slot) => {
            const slotBookings = bookingsBySlot.get(slot.id) ?? [];
            const activeBookings = slotBookings.filter((b) => b.status !== "cancelled");

            return (
              <details
                key={slot.id}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white"
              >
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-display font-extrabold text-momo-black">
                      {slot.date}
                      {slot.startTime && (
                        <span className="ml-2 font-normal text-momo-black/60">
                          {formatTime(slot.startTime)}
                          {slot.endTime ? `–${formatTime(slot.endTime)}` : ""}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-momo-black/50">
                      {slot.capacity} posti totali · {slot.bookedCount} prenotati ·{" "}
                      <span
                        className={
                          slot.remaining <= 0
                            ? "font-bold text-red-600"
                            : "font-bold text-momo-green-700"
                        }
                      >
                        {Math.max(0, slot.remaining)} rimasti
                      </span>
                      {!slot.isAvailable && (
                        <span className="ml-2 font-bold text-momo-orange">Bloccata</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-momo-black/40 transition-transform group-open:rotate-180">
                    ▾
                  </span>
                </summary>

                <div className="space-y-4 border-t border-black/5 px-5 py-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <form action={updateAvailabilityAction} className="flex items-end gap-2">
                      <input type="hidden" name="id" value={slot.id} />
                      <Field label="Posti totali">
                        <input
                          type="number"
                          name="capacity"
                          min={1}
                          defaultValue={slot.capacity}
                          className="momo-input w-24"
                        />
                      </Field>
                      <Field label="Nota interna">
                        <input
                          type="text"
                          name="internal_note"
                          defaultValue={slot.internalNote ?? ""}
                          className="momo-input"
                        />
                      </Field>
                      <button
                        type="submit"
                        className="rounded-full bg-momo-black px-4 py-2 text-xs font-extrabold text-white"
                      >
                        Salva
                      </button>
                    </form>

                    <form action={toggleAvailabilityAction}>
                      <input type="hidden" name="id" value={slot.id} />
                      <input
                        type="hidden"
                        name="next_is_available"
                        value={(!slot.isAvailable).toString()}
                      />
                      <button
                        type="submit"
                        className={`rounded-full px-4 py-2 text-xs font-extrabold ${
                          slot.isAvailable
                            ? "border border-momo-orange text-momo-orange"
                            : "bg-momo-green-700 text-white"
                        }`}
                      >
                        {slot.isAvailable ? "Blocca" : "Riapri"}
                      </button>
                    </form>

                    <form action={deleteAvailabilityAction}>
                      <input type="hidden" name="id" value={slot.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50"
                      >
                        Elimina
                      </button>
                    </form>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-momo-black/50">
                      Prenotazioni ({activeBookings.length})
                    </p>
                    {slotBookings.length === 0 ? (
                      <p className="mt-2 text-sm text-momo-black/50">
                        Nessuna prenotazione per questa data.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {slotBookings.map((b) => (
                          <li
                            key={b.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-momo-cream-dim px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="font-bold text-momo-black">{b.name}</span>{" "}
                              <span className="text-momo-black/50">
                                · {b.participants} persone · {b.email} · {b.phone}
                              </span>
                              {b.message && (
                                <p className="text-xs text-momo-black/50">Nota: {b.message}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[b.status]}`}
                              >
                                {STATUS_LABELS[b.status]}
                              </span>
                              {b.status !== "cancelled" && (
                                <form action={cancelBookingAction}>
                                  <input type="hidden" name="booking_id" value={b.id} />
                                  <button
                                    type="submit"
                                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-extrabold text-red-600 hover:bg-red-50"
                                  >
                                    Annulla
                                  </button>
                                </form>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-extrabold text-momo-black/70">{label}</span>
      {children}
    </label>
  );
}
