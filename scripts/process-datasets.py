"""
Process and merge UFO sighting datasets for import into Supabase.

Step 1: Build coordinate lookup from clustered JSONL (has lat/lon)
Step 2: Process NUFORC CSV for records after 2014-05-08 (our DB cutoff)
Step 3: Find additional records from clustered JSONL we're missing
Step 4: Output combined CSV ready for import
"""

import json
import csv
import sys
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "imports"
OUTPUT_FILE = DATA_DIR / "merged_new_sightings.csv"

# Map full country names to 2-letter codes
COUNTRY_NAME_TO_CODE = {
    "usa": "US", "canada": "CA", "united kingdom": "GB",
    "australia": "AU", "germany": "DE", "india": "IN",
    "mexico": "MX", "new zealand": "NZ", "south africa": "ZA",
    "ireland": "IE", "netherlands": "NL", "brazil": "BR",
    "spain": "ES", "france": "FR", "philippines": "PH",
    "turkey": "TR", "italy": "IT", "sweden": "SE",
    "norway": "NO", "denmark": "DK", "finland": "FI",
    "belgium": "BE", "portugal": "PT", "argentina": "AR",
    "chile": "CL", "colombia": "CO", "peru": "PE",
    "japan": "JP", "china": "CN", "south korea": "KR",
    "indonesia": "ID", "thailand": "TH", "malaysia": "MY",
    "singapore": "SG", "poland": "PL", "czech republic": "CZ",
    "austria": "AT", "switzerland": "CH", "romania": "RO",
    "hungary": "HU", "greece": "GR", "ukraine": "UA",
    "russia": "RU", "israel": "IL", "egypt": "EG",
    "kenya": "KE", "nigeria": "NG", "pakistan": "PK",
    "bangladesh": "BD", "taiwan": "TW", "puerto rico": "PR",
    "jamaica": "JM", "trinidad and tobago": "TT",
    "costa rica": "CR", "panama": "PA", "guatemala": "GT",
    "guam": "GU", "bahamas": "BS",
}

# US state abbreviations
US_STATES = {
    "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga",
    "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md",
    "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
    "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc",
    "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy",
    "dc",
}

# Canadian provinces
CA_PROVINCES = {
    "ab", "bc", "mb", "nb", "nl", "ns", "nt", "nu", "on", "pe", "qc", "sk", "yt",
}


def decode_html(text):
    """Decode HTML entities commonly found in NUFORC data."""
    if not text:
        return text
    text = text.replace("&#44", ",")
    text = text.replace("&#39", "'")
    text = text.replace("&#33", "!")
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    text = text.replace("&quot;", '"')
    return re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), text)


def build_coord_lookup():
    """Build city+state -> (lat, lon) lookup from the clustered JSONL."""
    print("Building coordinate lookup from clustered JSONL...")
    lookup = {}
    path = DATA_DIR / "ufo_clustered.jsonl"
    count = 0
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            lat = rec.get("lat")
            lon = rec.get("lon")
            city = (rec.get("city") or "").strip().lower()
            state = (rec.get("state") or "").strip().lower()
            country = (rec.get("country") or "").strip().upper()

            if not lat or not lon or not city or city == "nan":
                continue
            if lat == 0 and lon == 0:
                continue

            # Primary key: city + state + country
            key1 = (city, state if state != "nan" else "", country if country != "NAN" else "")
            if key1 not in lookup:
                lookup[key1] = (float(lat), float(lon))

            # Fallback: city + state only
            key2 = (city, state if state != "nan" else "")
            if key2 not in lookup:
                lookup[key2] = (float(lat), float(lon))

            count += 1

    print(f"  Loaded {count} records, {len(lookup)} unique location keys")
    return lookup


def parse_nuforc_location(loc_str):
    """Parse 'City, ST, USA' or 'City, Country' into (city, state, country_code)."""
    if not loc_str:
        return None, None, None

    parts = [p.strip() for p in loc_str.split(",")]
    if len(parts) < 2:
        return loc_str.lower(), None, None

    city = parts[0].lower()
    country_str = parts[-1].strip().lower()
    country_code = COUNTRY_NAME_TO_CODE.get(country_str, country_str.upper()[:2])

    state = None
    if len(parts) >= 3:
        state = parts[1].strip().lower()

    return city, state, country_code


def geocode(city, state, country, lookup):
    """Try to find coordinates for a city/state/country combo."""
    # Normalize
    city = (city or "").lower().strip()
    state = (state or "").lower().strip()
    country = (country or "").upper().strip()

    # Try exact match
    for key in [
        (city, state, country),
        (city, state),
        (city, "", country),
        (city, ""),
    ]:
        if key in lookup:
            return lookup[key]

    # Try without parenthetical suffix
    clean_city = re.sub(r"\s*\(.*$", "", city).strip()
    if clean_city != city:
        for key in [
            (clean_city, state, country),
            (clean_city, state),
            (clean_city, "", country),
        ]:
            if key in lookup:
                return lookup[key]

    return None, None


def process_nuforc_csv(lookup):
    """Process the NUFORC CSV for records after our DB cutoff."""
    print("\nProcessing NUFORC CSV (records after 2014-05-08)...")
    path = DATA_DIR / "nuforc_bool.csv"
    records = []
    matched = 0
    unmatched = 0

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        header = next(reader)

        for row in reader:
            if len(row) < 10:
                continue

            date_str = row[1]  # e.g. "2014-09-21 13:00:00 Local"
            date_part = date_str[:10] if date_str else ""
            if not date_part or not date_part[:4].isdigit():
                continue

            year = int(date_part[:4])
            if year < 1800 or year > 2025:
                continue
            if date_part <= "2014-05-08":
                continue

            # Parse datetime
            time_part = date_str[11:16] if len(date_str) > 15 else "00:00"
            dt = f"{date_part}T{time_part}:00Z"

            # Parse location
            city, state, country_code = parse_nuforc_location(row[2])
            if not city:
                continue

            # Geocode
            lat, lon = geocode(city, state, country_code, lookup)
            if lat is None:
                unmatched += 1
                continue

            matched += 1
            shape = (row[3] or "").strip().lower() if row[3] else None
            duration = (row[4] or "").strip() if row[4] else None
            summary = decode_html((row[8] or "").strip()) if row[8] else None
            description = decode_html((row[9] or "").strip()) if row[9] else None

            # Map state to uppercase code if US/CA
            state_upper = state.upper() if state else None
            if state_upper and state_upper not in US_STATES and state_upper not in CA_PROVINCES:
                state_upper = None  # Not a recognized state/province code

            records.append({
                "date_time": dt,
                "city": city,
                "state": state_upper,
                "country": country_code or "US",
                "shape": shape,
                "duration": duration,
                "summary": summary,
                "description": description or summary,
                "latitude": lat,
                "longitude": lon,
                "source": "NUFORC",
            })

    print(f"  Geocoded: {matched}, Unmatched (skipped): {unmatched}")
    return records


def process_clustered_jsonl(existing_keys):
    """Process the clustered JSONL for records not in our existing DB."""
    print("\nProcessing clustered JSONL for additional records...")
    path = DATA_DIR / "ufo_clustered.jsonl"
    records = []
    skipped_dup = 0
    skipped_bad = 0
    added = 0

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)

            lat = rec.get("lat")
            lon = rec.get("lon")
            if not lat or not lon:
                skipped_bad += 1
                continue

            lat = float(lat)
            lon = float(lon)
            if lat == 0 and lon == 0:
                skipped_bad += 1
                continue
            if lat < -90 or lat > 90 or lon < -180 or lon > 180:
                skipped_bad += 1
                continue

            t_utc = rec.get("t_utc", "")
            date_part = t_utc[:10] if t_utc else ""
            if not date_part:
                skipped_bad += 1
                continue

            city = (rec.get("city") or "").strip().lower()
            state = (rec.get("state") or "").strip().upper()
            country = (rec.get("country") or "").strip().upper()

            if city == "nan":
                city = ""
            if state == "NAN":
                state = ""
            if country == "NAN":
                country = ""

            # Skip if no country
            if not country:
                skipped_bad += 1
                continue

            # Dedup key: date + city + country
            dedup_key = (date_part, city, country)
            if dedup_key in existing_keys:
                skipped_dup += 1
                continue

            existing_keys.add(dedup_key)
            added += 1

            text = rec.get("text", "")
            if text and len(text) > 500:
                text = text[:500]

            records.append({
                "date_time": t_utc[:19] + "Z" if t_utc else None,
                "city": city if city else None,
                "state": state if state else None,
                "country": country,
                "shape": None,  # Not in this dataset
                "duration": None,
                "summary": text[:200] if text else None,
                "description": text if text else None,
                "latitude": lat,
                "longitude": lon,
                "source": "NUFORC",
            })

    print(f"  Added: {added}, Skipped (dup): {skipped_dup}, Skipped (bad): {skipped_bad}")
    return records


def main():
    # Step 1: Build coordinate lookup
    lookup = build_coord_lookup()

    # Step 2: Process NUFORC post-2014 records
    nuforc_records = process_nuforc_csv(lookup)

    # Step 3: Build dedup keys from existing DB + new NUFORC records
    # We know our DB has records up to 2014-05-08. The clustered dataset also
    # goes up to 2014-05-08. So we want records from the clustered dataset that
    # are from countries we might not have (beyond US/CA/GB/AU/DE) or that
    # fill gaps in our existing data.
    existing_keys = set()

    # Add NUFORC new records to dedup set
    for rec in nuforc_records:
        dt = rec["date_time"][:10] if rec["date_time"] else ""
        city = rec["city"] or ""
        country = rec["country"] or ""
        existing_keys.add((dt, city, country))

    # Process clustered JSONL
    clustered_records = process_clustered_jsonl(existing_keys)

    # Combine
    all_records = nuforc_records + clustered_records
    print(f"\nTotal new records to import: {len(all_records)}")
    print(f"  From NUFORC (2014-2023): {len(nuforc_records)}")
    print(f"  From clustered (additional): {len(clustered_records)}")

    # Write output CSV
    print(f"\nWriting output to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "date_time", "city", "state", "country", "shape",
            "duration", "summary", "description", "latitude", "longitude", "source"
        ])
        for rec in all_records:
            writer.writerow([
                rec["date_time"], rec["city"], rec["state"], rec["country"],
                rec["shape"], rec["duration"], rec["summary"], rec["description"],
                rec["latitude"], rec["longitude"], rec["source"],
            ])

    print("Done!")


if __name__ == "__main__":
    main()
