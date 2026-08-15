import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { PackCard } from "@/components/Packs/PackCard";
import { ICON_PACKS } from "@/lib/iconPacks";

/** Figma 40004937:47913 — two-column pack grid. */
export function IconPacksGrid() {
  return (
    <ContentContainer>
      <section
        aria-label="Icon packs"
        className="grid w-full grid-cols-1 gap-8 px-4 tablet:px-[50px] laptop:grid-cols-2 laptop:gap-8 laptop:px-[50px]"
      >
        {ICON_PACKS.map((pack) => (
          <PackCard key={pack.id} pack={pack} />
        ))}
      </section>
    </ContentContainer>
  );
}
