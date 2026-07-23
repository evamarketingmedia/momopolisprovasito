// NOTE: placeholder business data — replace with the real Momopolis details.
export const siteConfig = {
  name: "Momopolis",
  tagline: "Family Bar & Park",
  domain: "https://www.momopolis.ch",
  email: "info@momopolis.ch",
  phone: "+41 91 000 00 00",
  whatsapp: "41910000000", // international format, no leading +, no spaces
  // Placeholder street — Momopolis is a few minutes from FoxTown Mendrisio.
  // Swap in the exact address once available (updates the map + structured data automatically).
  address: {
    street: "Via Vincenzo Vela 4",
    zip: "6850",
    city: "Mendrisio",
    canton: "Ticino",
    country: "CH",
  },
  geo: {
    lat: 45.8617,
    lng: 8.9779,
  },
  // No API key required — swap the query for the exact address once known.
  mapsEmbedSrc:
    "https://www.google.com/maps?q=FoxTown+Factory+Stores,+Mendrisio&output=embed",
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=FoxTown+Factory+Stores+Mendrisio",
  openingHours: [
    { day: { it: "Lunedì", en: "Monday" }, hours: "Chiuso / Closed" },
    { day: { it: "Martedì – Venerdì", en: "Tuesday – Friday" }, hours: "14:00 – 19:00" },
    { day: { it: "Sabato", en: "Saturday" }, hours: "10:00 – 19:00" },
    { day: { it: "Domenica", en: "Sunday" }, hours: "10:00 – 19:00" },
  ],
  social: {
    instagram: "",
    facebook: "",
  },
} as const;
