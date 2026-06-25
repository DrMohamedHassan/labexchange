export const COUNTRY_OPTIONS = [
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Jordan",
  "Lebanon",
  "Iraq",
  "Morocco",
  "Tunisia",
  "Algeria",
  "Turkey",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Sweden",
  "Denmark",
  "Norway",
  "Finland",
  "Canada",
  "Australia",
  "China",
  "India",
  "Japan",
  "South Korea",
  "Singapore",
  "Malaysia",
  "South Africa",
  "Brazil",
  "Other Countries",
] as const;

export const DEFAULT_COUNTRY = "Egypt";

export const ARABIC_SPEAKING_COUNTRIES = [
  "Egypt",
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Jordan",
  "Lebanon",
  "Iraq",
  "Morocco",
  "Tunisia",
  "Algeria",
] as const;

export function shouldShowArabicForCountry(country?: string | null) {
  if (!country) return false;

  return ARABIC_SPEAKING_COUNTRIES.includes(
    country as (typeof ARABIC_SPEAKING_COUNTRIES)[number]
  );
}