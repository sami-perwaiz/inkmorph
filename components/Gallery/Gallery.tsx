"use client";

import { useMemo, useState } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { Footer } from "@/components/Footer/Footer";
import { GalleryGrid } from "@/components/GalleryGrid/GalleryGrid";
import { ImagePreviewModal } from "@/components/ImagePreviewModal/ImagePreviewModal";
import { Navbar } from "@/components/Navbar/Navbar";
import { useImagePreviewModal } from "@/hooks/useImagePreviewModal";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { filterIllustrations } from "@/lib/filterIllustrations";
import type { FilterValue, Illustration } from "@/types/illustration";

interface GalleryProps {
  illustrations: Illustration[];
}

export function Gallery({ illustrations }: GalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const isDesktop = useIsDesktop();
  const preview = useImagePreviewModal(isDesktop);

  const filteredIllustrations = useMemo(
    () => filterIllustrations(illustrations, activeFilter),
    [illustrations, activeFilter]
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <main className="pt-[86px] tablet:pt-[148px]">
        <ContentContainer>
          <GalleryGrid
            illustrations={filteredIllustrations}
            activeFilter={activeFilter}
            isDesktop={isDesktop}
            onPreview={preview.open}
          />
        </ContentContainer>
      </main>

      <Footer onFilterChange={setActiveFilter} />

      {preview.isMounted && preview.illustration && (
        <ImagePreviewModal
          illustration={preview.illustration}
          visible={preview.visible}
          onClose={preview.close}
          onExitComplete={preview.completeExit}
        />
      )}
    </div>
  );
}
