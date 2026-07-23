"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2, Info } from "lucide-react";
import type { Locale, Dictionary } from "@/lib/dictionaries";
import AvailabilityCalendar, { type PublicAvailabilitySlot } from "./AvailabilityCalendar";

function formatDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(t: string | null) {
  return t ? t.slice(0, 5) : null;
}

function formatSlotRange(slot: PublicAvailabilitySlot) {
  const start = formatTime(slot.startTime);
  if (!start) return null;
  const end = formatTime(slot.endTime);
  return end ? `${start}–${end}` : start;
}

async function fetchSlots(): Promise<PublicAvailabilitySlot[]> {
  try {
    const res = await fetch("/api/availability");
    const data: { slots?: PublicAvailabilitySlot[] } = await res.json();
    return data.slots ?? [];
  } catch {
    return [];
  }
}

const LOW_SEATS_THRESHOLD = 3;

function slotStatusLabel(slot: PublicAvailabilitySlot, dict: Dictionary) {
  if (!slot.isAvailable || slot.remaining <= 0) return dict.contact.form.statusFull;
  if (slot.remaining <= LOW_SEATS_THRESHOLD) {
    return `${dict.contact.form.statusLow} (${slot.remaining})`;
  }
  return `${dict.contact.form.statusAvailable} (${slot.remaining})`;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function BookingForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [slots, setSlots] = useState<PublicAvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partyType, setPartyType] = useState<string>(
    dict.contact.form.partyTypeOptions[0]?.value ?? ""
  );
  const [participants, setParticipants] = useState("1");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [availabilityChanged, setAvailabilityChanged] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSlots().then((data) => {
      if (cancelled) return;
      setSlots(data);
      setLoadingSlots(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
  const slotsForDate = selectedDateKey
    ? slots
        .filter((s) => s.date === selectedDateKey)
        .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))
    : [];
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  function handleSelectDate(date: Date | undefined) {
    setSelectedDate(date);
    setErrorMsg(null);
    if (!date) {
      setSelectedSlotId(undefined);
      return;
    }
    const key = formatDateKey(date);
    const forDate = slots.filter((s) => s.date === key);
    setSelectedSlotId(forDate.length === 1 ? forDate[0].id : undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setAvailabilityChanged(false);

    if (!name || !email || !phone || !selectedSlotId || !partyType || !participants) {
      setErrorMsg(dict.contact.form.required);
      return;
    }

    const participantsNum = Number(participants);
    if (selectedSlot && participantsNum > selectedSlot.remaining) {
      setErrorMsg(dict.contact.form.tooManyParticipants);
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityId: selectedSlotId,
          name,
          email,
          phone,
          partyType,
          participants: participantsNum,
          message,
          locale,
        }),
      });

      if (res.status === 409 || res.status === 404) {
        setAvailabilityChanged(true);
        setSelectedSlotId(undefined);
        setSelectedDate(undefined);
        setSlots(await fetchSlots());
        setStatus("idle");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-momo-green-500/30 bg-momo-green-900/5 p-8 text-center">
        <CheckCircle2 className="mx-auto text-momo-green-500" size={48} />
        <h3 className="font-display mt-4 text-xl font-extrabold text-momo-black">
          {dict.contact.form.successTitle}
        </h3>
        <p className="mt-2 text-momo-black/70">{dict.contact.form.successText}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setSelectedDate(undefined);
            setSelectedSlotId(undefined);
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
            setParticipants("1");
            fetchSlots().then(setSlots);
          }}
          className="mt-6 rounded-full bg-momo-black px-5 py-2.5 text-sm font-extrabold text-white"
        >
          {dict.contact.form.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={dict.contact.form.name}>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="momo-input"
            />
          </Field>
          <Field label={dict.contact.form.email}>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="momo-input"
            />
          </Field>
          <Field label={dict.contact.form.phone}>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="momo-input"
            />
          </Field>
          <Field label={dict.contact.form.participants}>
            <input
              required
              type="number"
              min={1}
              max={selectedSlot?.remaining}
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="momo-input"
            />
            {selectedSlot && (
              <span className="mt-1 block text-xs text-momo-black/50">
                {dict.contact.form.seatsRemainingHint.replace(
                  "{n}",
                  String(selectedSlot.remaining)
                )}
              </span>
            )}
          </Field>
        </div>

        <Field label={dict.contact.form.partyType}>
          <select
            value={partyType}
            onChange={(e) => setPartyType(e.target.value)}
            className="momo-input"
          >
            {dict.contact.form.partyTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={dict.contact.form.date}>
          <input
            readOnly
            value={selectedDate ? formatDateKey(selectedDate) : ""}
            placeholder={dict.contact.form.datePlaceholder}
            className="momo-input cursor-default"
          />
        </Field>

        {selectedDateKey && slotsForDate.length > 1 && (
          <Field label={dict.contact.form.timeSlot}>
            <select
              required
              value={selectedSlotId ?? ""}
              onChange={(e) => setSelectedSlotId(e.target.value || undefined)}
              className="momo-input"
            >
              <option value="" disabled>
                {dict.contact.form.selectSlotPlaceholder}
              </option>
              {slotsForDate.map((slot) => (
                <option key={slot.id} value={slot.id} disabled={slot.remaining <= 0}>
                  {formatSlotRange(slot)} · {slotStatusLabel(slot, dict)}
                </option>
              ))}
            </select>
          </Field>
        )}

        {selectedDateKey && slotsForDate.length === 1 && (
          <p className="flex items-center gap-1.5 text-sm text-momo-black/60">
            <Info size={15} />
            {formatSlotRange(slotsForDate[0]) && (
              <span>{formatSlotRange(slotsForDate[0])} · </span>
            )}
            {slotStatusLabel(slotsForDate[0], dict)}
          </p>
        )}

        <Field label={dict.contact.form.message}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={dict.contact.form.messagePlaceholder}
            rows={4}
            className="momo-input resize-none"
          />
        </Field>

        {availabilityChanged && (
          <p className="flex items-center gap-2 text-sm font-bold text-momo-orange">
            <AlertTriangle size={16} />
            {dict.contact.form.availabilityChangedText}
          </p>
        )}

        {errorMsg && (
          <p className="flex items-center gap-2 text-sm font-bold text-red-600">
            <AlertTriangle size={16} />
            {errorMsg}
          </p>
        )}

        {status === "error" && (
          <p className="flex items-center gap-2 text-sm font-bold text-red-600">
            <AlertTriangle size={16} />
            {dict.contact.form.errorText}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-momo-orange px-6 py-3.5 text-base font-extrabold text-momo-black shadow-glow-orange transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "submitting" && <Loader2 className="animate-spin" size={18} />}
          {status === "submitting" ? dict.contact.form.submitting : dict.contact.form.submit}
        </button>
      </form>

      <AvailabilityCalendar
        locale={locale}
        dict={dict}
        slots={slots}
        selected={selectedDate}
        onSelect={handleSelectDate}
        loading={loadingSlots}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-extrabold text-momo-black/80">
        {label}
      </span>
      {children}
    </label>
  );
}
