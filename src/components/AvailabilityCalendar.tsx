"use client";

import { DayPicker } from "react-day-picker";
import { it, enUS } from "date-fns/locale";
import "react-day-picker/style.css";
import type { Locale, Dictionary } from "@/lib/dictionaries";

export type PublicAvailabilitySlot = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  capacity: number;
  remaining: number;
  isAvailable: boolean;
};

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isOpenSlot(slot: PublicAvailabilitySlot) {
  return slot.isAvailable && slot.remaining > 0;
}

export default function AvailabilityCalendar({
  locale,
  dict,
  slots,
  selected,
  onSelect,
  loading,
}: {
  locale: Locale;
  dict: Dictionary;
  slots: PublicAvailabilitySlot[];
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  loading: boolean;
}) {
  const today = toDateOnly(new Date());

  const openDates = Array.from(
    new Set(slots.filter(isOpenSlot).map((s) => s.date))
  ).map(parseDate);

  const soldOutDates = Array.from(
    new Set(
      slots
        .filter((s) => !isOpenSlot(s))
        .map((s) => s.date)
        .filter((date) => !slots.some((s) => s.date === date && isOpenSlot(s)))
    )
  ).map(parseDate);

  const openDateKeys = new Set(openDates.map((d) => d.toDateString()));

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6">
      <h3 className="font-display text-lg font-extrabold text-momo-black">
        {dict.contact.calendarTitle}
      </h3>

      {loading ? (
        <p className="mt-6 text-sm text-momo-black/60">
          {dict.contact.calendarLoading}
        </p>
      ) : openDates.length === 0 ? (
        <p className="mt-6 text-sm text-momo-black/60">
          {dict.contact.calendarNoDates}
        </p>
      ) : (
        <div className="momo-calendar mt-4">
          <DayPicker
            mode="single"
            locale={locale === "it" ? it : enUS}
            selected={selected}
            onSelect={onSelect}
            disabled={[
              { before: today },
              (date) => !openDateKeys.has(date.toDateString()),
            ]}
            modifiers={{ available: openDates, soldOut: soldOutDates }}
            modifiersClassNames={{
              available: "rdp-day_available",
              soldOut: "rdp-day_booked",
            }}
            className="mx-auto"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-momo-black/70">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-momo-green-500" />
          {dict.contact.calendarLegendAvailable}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-black/25" />
          {dict.contact.calendarLegendBooked}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-momo-orange" />
          {dict.contact.calendarLegendSelected}
        </span>
      </div>
    </div>
  );
}
