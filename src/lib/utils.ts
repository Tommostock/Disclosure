/**
 * Utility functions used throughout the Disclosure app.
 * Includes class merging helper and date/text formatting.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Example: cn("p-4", "p-2") => "p-2" (last wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a readable format like "March 15, 2019".
 * Returns empty string for invalid dates.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Formats a date string with time like "March 15, 2019 at 9:45 PM".
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const datePart = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  } catch {
    return "";
  }
}

/**
 * Formats a large number with comma separators (e.g., 107482 => "107,482").
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Normalizes a shape name to title case (e.g., "triangle" => "Triangle").
 */
export function normalizeShape(shape: string | null | undefined): string {
  if (!shape) return "Unknown";
  const trimmed = shape.trim().toLowerCase();
  if (!trimmed || trimmed === "unknown") return "Unknown";
  if (trimmed === "other") return "Other";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Converts a string to title case (e.g., "san marcos" => "San Marcos").
 * Handles common short words like "of", "the", "and" by keeping them lowercase
 * unless they are the first word.
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text) return "";
  const lowerWords = new Set(["of", "the", "and", "in", "at", "by", "for", "on", "to", "de", "la", "el"]);
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && lowerWords.has(word)) return word;
      /* Capitalize after apostrophe (e.g. o'fallon → O'Fallon) */
      return word.replace(/(^|')(.)/, (_match, apos, ch) => apos + ch.toUpperCase());
    })
    .join(" ");
}

/**
 * Cleans a city name by removing parenthetical suffixes that repeat country/region info.
 * Examples:
 *   "toronto (canada)"           → "Toronto"
 *   "chester (uk/england)"       → "Chester"
 *   "st. louis (greater st. louis area)" → "St. Louis"
 */
export function cleanCity(city: string | null | undefined): string {
  if (!city) return "";
  /* Strip everything from the first '(' onward, then title-case */
  const stripped = city.replace(/\s*\(.*$/, "").trim();
  return toTitleCase(stripped);
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 * Never truncates mid-word.
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text || "";
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

/**
 * Country code to full name mapping.
 */
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  AU: "Australia",
  DE: "Germany",
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}

export const COUNTRIES = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code,
  name,
})).sort((a, b) => a.name.localeCompare(b.name));

/**
 * US state abbreviation to full name mapping.
 */
const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

/**
 * Canadian province/territory abbreviation to full name mapping.
 */
const CA_PROVINCE_NAMES: Record<string, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba",
  NB: "New Brunswick", NF: "Newfoundland", NS: "Nova Scotia",
  NT: "Northwest Territories", NU: "Nunavut", ON: "Ontario",
  PE: "Prince Edward Island", PQ: "Quebec", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon", YK: "Yukon",
  SA: "Saskatchewan",
};

/**
 * Combined region lookup — resolves both US states and CA provinces.
 */
const REGION_NAMES: Record<string, string> = {
  ...US_STATE_NAMES,
  ...CA_PROVINCE_NAMES,
};

export function getRegionName(abbreviation: string): string {
  return REGION_NAMES[abbreviation.toUpperCase()] || abbreviation;
}

/** @deprecated Use getRegionName instead */
export function getStateName(abbreviation: string): string {
  return getRegionName(abbreviation);
}

/**
 * List of all US states for filter dropdowns.
 */
export const US_STATES = Object.entries(US_STATE_NAMES).map(([code, name]) => ({
  code,
  name,
})).sort((a, b) => a.name.localeCompare(b.name));

/**
 * List of Canadian provinces for filter dropdowns.
 */
export const CA_PROVINCES = Object.entries(CA_PROVINCE_NAMES)
  .filter(([code]) => !["QC", "YK", "SA"].includes(code)) // skip aliases
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Regions grouped by country code, for dynamic filter dropdowns.
 */
export const REGIONS_BY_COUNTRY: Record<string, { code: string; name: string }[]> = {
  US: US_STATES,
  CA: CA_PROVINCES,
};

/**
 * Common UFO shapes for filter chips.
 */
export const UFO_SHAPES = [
  "Triangle", "Circle", "Light", "Sphere", "Fireball",
  "Disk", "Orb", "Oval", "Cigar", "Rectangle",
  "Chevron", "Diamond", "Formation", "Changing", "Other",
];
