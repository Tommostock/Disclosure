"use client";

import { useTheme } from "@/hooks/useTheme";

interface MiniMapTileProps {
  latitude: number;
  longitude: number;
}

export default function MiniMapTile({ latitude, longitude }: MiniMapTileProps) {
  const { theme } = useTheme();
  const tileStyle = theme === "dark" ? "dark_all" : "light_all";
  const z = 10;
  const x = Math.floor((longitude + 180) / 360 * 1024);
  const y = Math.floor(
    (1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * 1024
  );

  return (
    <div
      className="relative h-40 w-full bg-bg-tertiary"
      style={{
        backgroundImage: `url(https://a.basemaps.cartocdn.com/${tileStyle}/${z}/${x}/${y}@2x.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-accent shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
      </div>
    </div>
  );
}
