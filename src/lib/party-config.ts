import "server-only";
import { isSupabaseConfigured, supabase } from "./supabase";

export type PartyChoice = {
  id: string;
  label: string;
  description: string;
  price: number;
};

export type PartyConfig = {
  baseWeekdayPrice: number;
  baseHolidayPrice: number;
  holidayDates: string[];
  baseChildPrice: number;
  adultPrice: number;
  minimumChildren: number;
  packages: PartyChoice[];
  cakes: PartyChoice[];
  extras: PartyChoice[];
  setups: PartyChoice[];
};

export const defaultPartyConfig: PartyConfig = {
  baseWeekdayPrice: 100,
  baseHolidayPrice: 120,
  holidayDates: [],
  baseChildPrice: 0,
  adultPrice: 6,
  minimumChildren: 8,
  packages: [
    { id: "classic", label: "Festa Classic", description: "Ingresso, tavolo riservato, bibite e patatine", price: 0 },
    { id: "super", label: "Festa Super", description: "Classic + pizza e inviti digitali", price: 7 },
    { id: "wow", label: "Festa Wow", description: "Super + animazione e regalo festeggiato", price: 16 },
  ],
  cakes: [
    { id: "none", label: "Porto la mia torta", description: "Servizio torta incluso", price: 0 },
    { id: "chocolate", label: "Torta al cioccolato", description: "Decorazione Momopolis", price: 38 },
    { id: "fruit", label: "Torta alla frutta", description: "Fresca e colorata", price: 42 },
  ],
  extras: [
    { id: "snacks", label: "Pasticcini", description: "Vassoio assortito", price: 24 },
    { id: "mascot", label: "Mascotte", description: "Ingresso e foto con la mascotte", price: 45 },
    { id: "facepaint", label: "Truccabimbi", description: "Un’ora con animatrice", price: 75 },
  ],
  setups: [
    { id: "momo", label: "Momopolis", description: "Colori e decorazioni della casa", price: 0 },
    { id: "jungle", label: "Jungle", description: "Foglie, animali e palloncini", price: 35 },
    { id: "space", label: "Spazio", description: "Pianeti, stelle e razzi", price: 35 },
  ],
};

export async function getPartyConfig(): Promise<PartyConfig> {
  if (!isSupabaseConfigured) return defaultPartyConfig;
  const { data, error } = await supabase!
    .from("party_config")
    .select("value")
    .eq("key", "main")
    .maybeSingle();
  if (error || !data?.value) return defaultPartyConfig;
  return { ...defaultPartyConfig, ...(data.value as Partial<PartyConfig>) };
}
