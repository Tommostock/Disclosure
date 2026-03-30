"""
Generate SQL INSERT batches from the merged CSV for import via Supabase.
Outputs individual .sql files, each with ~200 rows.
"""

import csv
import os
from pathlib import Path

INPUT = Path(__file__).parent.parent / "data" / "imports" / "merged_new_sightings.csv"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "imports" / "sql_batches"
BATCH_SIZE = 200

os.makedirs(OUTPUT_DIR, exist_ok=True)


def escape_sql(val):
    """Escape a string for SQL."""
    if val is None or val == "" or val == "None":
        return "NULL"
    val = str(val).replace("'", "''")
    # Truncate very long strings
    if len(val) > 1000:
        val = val[:1000]
    return f"'{val}'"


def main():
    batch_num = 0
    row_count = 0
    total = 0
    values = []

    with open(INPUT, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1

            dt = row["date_time"]
            city = row["city"]
            state = row["state"]
            country = row["country"]
            shape = row["shape"]
            duration = row["duration"]
            summary = row["summary"]
            description = row["description"]
            lat = row["latitude"]
            lon = row["longitude"]
            source = row["source"] or "NUFORC"

            val = (
                f"({escape_sql(dt)}, {escape_sql(city)}, {escape_sql(state)}, "
                f"{escape_sql(country)}, {escape_sql(shape)}, {escape_sql(duration)}, "
                f"{escape_sql(summary)}, {escape_sql(description)}, "
                f"{lat}, {lon}, {escape_sql(source)})"
            )
            values.append(val)
            row_count += 1

            if row_count >= BATCH_SIZE:
                sql = (
                    "INSERT INTO sightings (date_time, city, state, country, shape, "
                    "duration, summary, description, latitude, longitude, source) VALUES\n"
                    + ",\n".join(values)
                    + ";"
                )
                outpath = OUTPUT_DIR / f"batch_{batch_num:04d}.sql"
                with open(outpath, "w", encoding="utf-8") as out:
                    out.write(sql)
                batch_num += 1
                values = []
                row_count = 0

    # Write remaining
    if values:
        sql = (
            "INSERT INTO sightings (date_time, city, state, country, shape, "
            "duration, summary, description, latitude, longitude, source) VALUES\n"
            + ",\n".join(values)
            + ";"
        )
        outpath = OUTPUT_DIR / f"batch_{batch_num:04d}.sql"
        with open(outpath, "w", encoding="utf-8") as out:
            out.write(sql)
        batch_num += 1

    print(f"Total records: {total}")
    print(f"Batches generated: {batch_num}")
    print(f"Output dir: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
