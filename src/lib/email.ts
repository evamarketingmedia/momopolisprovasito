import "server-only";
import { Resend } from "resend";
import type { Booking } from "./bookings-store";
import { siteConfig } from "./site-config";
import { getDictionary, hasLocale, defaultLocale } from "./dictionaries";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || `${siteConfig.name} <onboarding@resend.dev>`;
}

function formatTime(t: string | null): string {
  return t ? t.slice(0, 5) : "";
}

function formatSlot(booking: Booking): string {
  if (!booking.startTime) return booking.date;
  const end = booking.endTime ? `–${formatTime(booking.endTime)}` : "";
  return `${booking.date} · ${formatTime(booking.startTime)}${end}`;
}

/**
 * Internal notification to the business. Always in Italian regardless of the
 * customer's locale — this mailbox is read by Momopolis staff, not customers.
 */
async function sendBookingNotification(resend: Resend, booking: Booking) {
  const to = process.env.BOOKING_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("[email] BOOKING_NOTIFICATION_EMAIL not set — skipping staff notification");
    return;
  }

  const text = [
    `Nuova richiesta di prenotazione (${booking.id})`,
    "",
    `Nome: ${booking.name}`,
    `Email: ${booking.email}`,
    `Telefono: ${booking.phone}`,
    `Data: ${booking.date}`,
    `Fascia oraria: ${booking.startTime ? formatSlot(booking) : "Tutto il giorno"}`,
    `Partecipanti: ${booking.participants}`,
    `Tipo di festa: ${booking.partyType}`,
    booking.message ? `Note: ${booking.message}` : null,
    "",
    `ID prenotazione: ${booking.id}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  await resend.emails.send({
    from: getFromAddress(),
    to,
    replyTo: booking.email,
    subject: `Nuova richiesta di prenotazione — ${formatSlot(booking)}`,
    text,
  });
}

/** Confirmation sent to the customer, in their own chosen locale. */
async function sendBookingConfirmation(resend: Resend, booking: Booking) {
  const locale = hasLocale(booking.locale) ? booking.locale : defaultLocale;
  const dict = await getDictionary(locale);
  const f = dict.contact.form;

  const text = [
    f.confirmationIntro,
    "",
    `${f.name}: ${booking.name}`,
    `${f.date}: ${booking.date}`,
    booking.startTime ? `${f.timeSlot}: ${formatSlot(booking)}` : null,
    `${f.participants}: ${booking.participants}`,
    booking.message ? `${f.message}: ${booking.message}` : null,
    `${f.bookingIdLabel}: ${booking.id}`,
    "",
    f.confirmationClosing,
  ]
    .filter((line) => line !== null)
    .join("\n");

  await resend.emails.send({
    from: getFromAddress(),
    to: booking.email,
    subject: f.confirmationSubject,
    text,
  });
}

/**
 * Sends both the staff notification and the customer confirmation. Never
 * throws — a failed email must not prevent a booking from being saved. Each
 * send is attempted independently so one failing doesn't block the other.
 * Logs only the booking id on failure, never name/email/phone/message.
 */
export async function sendBookingEmails(booking: Booking): Promise<void> {
  const resend = getResendClient();

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping emails for booking ${booking.id}`);
    return;
  }

  const results = await Promise.allSettled([
    sendBookingNotification(resend, booking),
    sendBookingConfirmation(resend, booking),
  ]);

  const labels = ["staff notification", "customer confirmation"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(
        `[email] failed to send ${labels[i]} for booking ${booking.id}:`,
        result.reason instanceof Error ? result.reason.message : "unknown error"
      );
    }
  });
}
