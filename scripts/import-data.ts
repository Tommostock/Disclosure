/**
 * Data Import Script — Loads NUFORC sighting data from CSV into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-data.ts                  # Import all countries
 *   npx tsx scripts/import-data.ts --international   # Import non-US only (CA, GB, AU, DE)
 *
 * This script:
 * 1. Reads the CSV file from data/nuforc_sightings.csv
 * 2. Parses each row and maps it to the sightings table schema
 * 3. Filters out rows missing latitude/longitude
 * 4. Accepts sightings from US, CA, GB, AU, DE (skips empty country)
 * 5. Bulk inserts in batches of 500 for efficiency
 *
 * The CSV has no header row. Columns are:
 *   date_time, city, state, country, shape, duration_seconds, duration_text,
 *   summary, posted_date, latitude, longitude
 */

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { resolve } from "path";

/* ---- Configuration ---- */
const SUPABASE_URL = "https://mvewirvajsayyqhrsdee.supabase.co";
/* Use the anon key since RLS allows inserts from service role only.
   For bulk import, we use the anon key but need to temporarily allow inserts.
   Alternatively, use the service role key from the Supabase dashboard. */
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_KEY) {
  console.error("Error: Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_PATH = resolve(__dirname, "../data/nuforc_sightings.csv");
const BATCH_SIZE = 500;
const INTERNATIONAL_ONLY = process.argv.includes("--international");

/* ---- Types ---- */
interface SightingRow {
  date_time: string | null;
  city: string | null;
  state: string | null;
  country: string;
  shape: string | null;
  duration: string | null;
  summary: string | null;
  description: string | null;
  posted: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
}

/* ---- Helpers ---- */

/**
 * Parses the date_time string from the CSV into an ISO 8601 format.
 * Input format: "10/10/1949 20:30" (M/D/YYYY H:MM)
 */
function parseDateTime(raw: string): string | null {
  if (!raw || raw.trim() === "") return null;
  try {
    const parts = raw.trim().split(" ");
    if (parts.length < 2) return null;

    const dateParts = parts[0].split("/");
    if (dateParts.length !== 3) return null;

    const month = dateParts[0].padStart(2, "0");
    const day = dateParts[1].padStart(2, "0");
    const year = dateParts[2];

    const timeParts = parts[1].split(":");
    const hour = (timeParts[0] || "0").padStart(2, "0");
    const minute = (timeParts[1] || "0").padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}:00Z`;
  } catch {
    return null;
  }
}

/**
 * Parses the posted date from the CSV.
 * Input format: "4/27/2004" (M/D/YYYY)
 */
function parsePostedDate(raw: string): string | null {
  if (!raw || raw.trim() === "") return null;
  try {
    const parts = raw.trim().split("/");
    if (parts.length !== 3) return null;
    const month = parts[0].padStart(2, "0");
    const day = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

/**
 * Decodes HTML entities commonly found in the NUFORC data.
 */
function decodeHtml(text: string): string {
  return text
    .replace(/&#44/g, ",")
    .replace(/&#39/g, "'")
    .replace(/&#33/g, "!")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/* ---- Main Import Function ---- */
async function importData() {
  console.log("Starting NUFORC data import...");
  if (INTERNATIONAL_ONLY) {
    console.log("Mode: International only (skipping US records)");
  }
  console.log(`Reading CSV from: ${CSV_PATH}`);

  let batch: SightingRow[] = [];
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalRows = 0;

  const parser = createReadStream(CSV_PATH).pipe(
    parse({
      /* No header row in this CSV */
      columns: false,
      /* Handle quoted fields and HTML entities */
      relax_column_count: true,
      skip_empty_lines: true,
    })
  );

  for await (const row of parser) {
    totalRows++;

    /* CSV columns: date_time, city, state, country, shape, duration_seconds, duration_text, summary, posted, lat, lng */
    const dateTime = row[0] as string;
    const city = row[1] as string;
    const state = (row[2] as string)?.trim().toUpperCase() || null;
    const country = (row[3] as string)?.trim().toLowerCase() || "";
    const shape = row[4] as string;
    const durationText = row[6] as string; /* Use text duration, not seconds */
    const summary = row[7] as string;
    const posted = row[8] as string;
    const lat = parseFloat(row[9] as string);
    const lng = parseFloat(row[10] as string);

    /* Accepted countries */
    const ACCEPTED_COUNTRIES = new Set(["us", "ca", "gb", "au", "de"]);

    /* Filter: must have a known country */
    if (!country || !ACCEPTED_COUNTRIES.has(country)) {
      totalSkipped++;
      continue;
    }

    /* Skip US records when importing international only */
    if (INTERNATIONAL_ONLY && country === "us") {
      totalSkipped++;
      continue;
    }

    /* Filter: must have valid coordinates */
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      totalSkipped++;
      continue;
    }

    /* Filter: must be within valid global bounds */
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      totalSkipped++;
      continue;
    }

    const sighting: SightingRow = {
      date_time: parseDateTime(dateTime),
      city: city ? decodeHtml(city.trim()) : null,
      state: state,
      country: country.toUpperCase(),
      shape: shape ? shape.trim().toLowerCase() : null,
      duration: durationText ? decodeHtml(durationText.trim()) : null,
      summary: summary ? decodeHtml(summary.trim()) : null,
      description: summary ? decodeHtml(summary.trim()) : null,
      posted: parsePostedDate(posted),
      latitude: lat,
      longitude: lng,
      source: "NUFORC",
    };

    batch.push(sighting);

    /* Insert in batches for efficiency */
    if (batch.length >= BATCH_SIZE) {
      const { error } = await supabase.from("sightings").insert(batch);
      if (error) {
        console.error(`Error inserting batch at row ${totalRows}:`, error.message);
      } else {
        totalInserted += batch.length;
      }

      if (totalInserted % 5000 === 0) {
        console.log(`  Inserted ${totalInserted.toLocaleString()} rows...`);
      }

      batch = [];
    }
  }

  /* Insert remaining rows */
  if (batch.length > 0) {
    const { error } = await supabase.from("sightings").insert(batch);
    if (error) {
      console.error("Error inserting final batch:", error.message);
    } else {
      totalInserted += batch.length;
    }
  }

  console.log("\nImport complete!");
  console.log(`  Total CSV rows:  ${totalRows.toLocaleString()}`);
  console.log(`  Inserted:        ${totalInserted.toLocaleString()}`);
  console.log(`  Skipped:         ${totalSkipped.toLocaleString()}`);
}

/* Run the import */
importData().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
