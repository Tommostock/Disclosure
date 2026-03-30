/**
 * Import Merged Dataset — Loads processed sighting data from merged CSV into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-merged.ts
 *
 * Reads data/imports/merged_new_sightings.csv and inserts into the sightings table.
 * This CSV was produced by process-datasets.py which merged kcimc/NUFORC + clustered data.
 */

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { resolve } from "path";

/* ---- Configuration ---- */
const SUPABASE_URL = "https://mvewirvajsayyqhrsdee.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_KEY) {
  console.error("Error: Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_PATH = resolve(__dirname, "../data/imports/merged_new_sightings.csv");
const BATCH_SIZE = 500;

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
  latitude: number;
  longitude: number;
  source: string;
}

/* ---- Main Import Function ---- */
async function importData() {
  console.log("Starting merged dataset import...");
  console.log(`Reading CSV from: ${CSV_PATH}`);

  let batch: SightingRow[] = [];
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalRows = 0;

  const parser = createReadStream(CSV_PATH).pipe(
    parse({
      columns: true,  /* This CSV has a header row */
      skip_empty_lines: true,
      relax_column_count: true,
    })
  );

  for await (const row of parser) {
    totalRows++;

    const lat = parseFloat(row.latitude);
    const lng = parseFloat(row.longitude);

    /* Skip invalid coordinates */
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      totalSkipped++;
      continue;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      totalSkipped++;
      continue;
    }

    /* Skip if no date */
    if (!row.date_time || row.date_time === "None") {
      totalSkipped++;
      continue;
    }

    const sighting: SightingRow = {
      date_time: row.date_time !== "None" ? row.date_time : null,
      city: row.city && row.city !== "None" ? row.city.trim() : null,
      state: row.state && row.state !== "None" ? row.state.trim() : null,
      country: row.country && row.country !== "None" ? row.country.trim() : "US",
      shape: row.shape && row.shape !== "None" ? row.shape.trim().toLowerCase() : null,
      duration: row.duration && row.duration !== "None" ? row.duration.trim() : null,
      summary: row.summary && row.summary !== "None" ? row.summary.trim() : null,
      description: row.description && row.description !== "None" ? row.description.trim() : null,
      latitude: lat,
      longitude: lng,
      source: "NUFORC",
    };

    batch.push(sighting);

    /* Insert in batches */
    if (batch.length >= BATCH_SIZE) {
      const { error } = await supabase.from("sightings").insert(batch);
      if (error) {
        console.error(`Error inserting batch at row ${totalRows}:`, error.message);
        /* Try smaller batches on error */
        for (let i = 0; i < batch.length; i += 50) {
          const smallBatch = batch.slice(i, i + 50);
          const { error: smallError } = await supabase.from("sightings").insert(smallBatch);
          if (smallError) {
            console.error(`  Sub-batch error at ${i}:`, smallError.message);
            totalSkipped += smallBatch.length;
          } else {
            totalInserted += smallBatch.length;
          }
        }
      } else {
        totalInserted += batch.length;
      }

      if (totalInserted % 5000 === 0 || totalInserted % 5000 > BATCH_SIZE) {
        if ((totalInserted - batch.length) % 5000 > totalInserted % 5000 || totalInserted % 5000 === 0) {
          console.log(`  Inserted ${totalInserted.toLocaleString()} rows...`);
        }
      }

      if (totalRows % 5000 < BATCH_SIZE) {
        console.log(`  Progress: ${totalRows.toLocaleString()} rows processed, ${totalInserted.toLocaleString()} inserted...`);
      }

      batch = [];
    }
  }

  /* Insert remaining rows */
  if (batch.length > 0) {
    const { error } = await supabase.from("sightings").insert(batch);
    if (error) {
      console.error("Error inserting final batch:", error.message);
      totalSkipped += batch.length;
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
