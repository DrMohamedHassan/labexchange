export const LISTING_CATEGORIES = [
  "Molecular Biology",
  "Chemicals & Reagents",
  "Cell Culture & Cell Lines",
  "Lab Supplies & Equipment",
] as const;

export const DEFAULT_LISTING_CATEGORY = LISTING_CATEGORIES[0];

export const CONDITION_OPTIONS = [
  "New / Sealed",
  "New / Open Box",
  "Unused",
  "Used - Working",
  "Used - Needs Check",
] as const;

export const DEFAULT_CONDITION = CONDITION_OPTIONS[0];

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];
export type ListingCondition = (typeof CONDITION_OPTIONS)[number];