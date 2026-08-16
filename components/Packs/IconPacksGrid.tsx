import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { PackCard } from "@/components/Packs/PackCard";
import { PACK_WALLPAPER_GRID_CLASS } from "@/lib/constants";
import { getVisibleIconPacks } from "@/lib/iconPacks";

/** Figma 40004937:47913 — two-column pack grid. */
export function IconPacksGrid() {
  return (
    <ContentContainer>
      <section
        aria-label="Icon packs"
        className={PACK_WALLPAPER_GRID_CLASS}
      >
        {getVisibleIconPacks().map((pack) => (
          <PackCard key={pack.id} pack={pack} />
        ))}
      </section>
    </ContentContainer>
  );
}
