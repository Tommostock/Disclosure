/**
 * Generate PWA Icons — Creates simple PNG icons for the PWA manifest.
 *
 * Uses a canvas approach via the 'sharp' library if available,
 * otherwise generates SVG files that can be converted manually.
 *
 * The icon is a simple "D" in Space Grotesk Bold on a dark background
 * with the green accent color.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

/* Generate SVG icon */
function generateIconSvg(size: number): string {
  const fontSize = Math.floor(size * 0.55);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.2)}" fill="#0A0A0A"/>
  <text
    x="50%" y="54%"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="#22C55E"
    text-anchor="middle"
    dominant-baseline="middle"
  >D</text>
</svg>`;
}

/* Write SVG icons */
const sizes = [192, 512];
const iconsDir = resolve(__dirname, "../public/icons");

for (const size of sizes) {
  const svg = generateIconSvg(size);
  const filename = `icon-${size}.svg`;
  writeFileSync(resolve(iconsDir, filename), svg);
  console.log(`Generated ${filename}`);
}

/* Also create a simple apple-touch-icon SVG */
writeFileSync(resolve(iconsDir, "apple-touch-icon.svg"), generateIconSvg(180));
console.log("Generated apple-touch-icon.svg");

console.log("\nNote: For production, convert these SVGs to PNGs using a tool like:");
console.log("  npx sharp-cli --input public/icons/icon-192.svg --output public/icons/icon-192.png");
console.log("  or use an online SVG to PNG converter.");
