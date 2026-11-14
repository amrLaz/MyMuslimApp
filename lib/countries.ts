export const COUNTRIES = [
  { id: "ma", label: "Maroc", adjective: "marocaine" },
  { id: "dz", label: "Algérie", adjective: "algérienne" },
  { id: "tn", label: "Tunisie", adjective: "tunisienne" },
] as const;

export type CountryId = (typeof COUNTRIES)[number]["id"];

/** Code de langue du navigateur pour chaque derja. */
export const LOCALES: Record<CountryId, string> = { ma: "ar-MA", dz: "ar-DZ", tn: "ar-TN" };
