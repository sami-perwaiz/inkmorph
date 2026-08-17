import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { WallpaperCard } from "@/components/Packs/WallpaperCard";
import { PACK_WALLPAPER_GRID_CLASS } from "@/lib/constants";
import { WALLPAPER_PACKS } from "@/lib/wallpaperPacks";

/** Figma 40004961:8905 — two-column wallpaper grid. */
export function WallpapersGrid() {
  return (
    <ContentContainer>
      <section
        aria-label="iPhone wallpapers"
        className={PACK_WALLPAPER_GRID_CLASS}
      >
        {WALLPAPER_PACKS.map((pack, index) => (
          <WallpaperCard key={pack.id} pack={pack} priority={index < 2} />
        ))}
      </section>
    </ContentContainer>
  );
}
