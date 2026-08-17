"use client";

import { memo, useMemo } from "react";

import { PackIconImage } from "@/components/Packs/PackIconImage";
import { usePackIconColumnCount } from "@/hooks/usePackIconColumnCount";
import type { Illustration } from "@/types/illustration";

interface PackIconCellProps {
  illustration: Illustration;
  selectionMode: boolean;
  selected: boolean;
  priority: boolean;
  onToggleSelect: (id: string) => void;
}

/** Figma 40005024:8937 — unselected vs selected pack icon tiles. */
const PackIconCell = memo(function PackIconCell({
  illustration,
  selectionMode,
  selected,
  priority,
  onToggleSelect,
}: PackIconCellProps) {
  const handleClick = () => {
    if (!selectionMode) {
      return;
    }
    onToggleSelect(illustration.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!selectionMode}
      aria-pressed={selectionMode ? selected : undefined}
      aria-label={
        selectionMode
          ? `${selected ? "Deselect" : "Select"} ${illustration.alt}`
          : illustration.alt
      }
      className={[
        "pack-icon-cell relative aspect-square w-full max-w-[150px] overflow-hidden rounded-[16px] wide:size-[150px] wide:max-w-none",
        selectionMode && selected ? "border border-solid border-[#D8D8D8]" : "",
        selectionMode ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <PackIconImage
        src={illustration.src}
        alt={illustration.alt}
        priority={priority}
      />
      {selectionMode && selected ? (
        <div
          className="pointer-events-none absolute inset-0 bg-[rgba(255,255,255,0.1)]"
          aria-hidden
        />
      ) : null}
    </button>
  );
});

interface PackIconGridProps {
  illustrations: Illustration[];
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function PackIconGrid({
  illustrations,
  selectionMode,
  selectedIds,
  onToggleSelect,
}: PackIconGridProps) {
  const columnCount = usePackIconColumnCount();
  const priorityIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of illustrations.slice(0, columnCount)) {
      ids.add(item.id);
    }
    return ids;
  }, [columnCount, illustrations]);

  return (
    <section
      aria-label="Pack icons"
      className="mx-auto grid w-full max-w-[1340px] grid-cols-3 justify-items-center gap-5 px-4 tablet:grid-cols-4 tablet:px-[50px] desktop:grid-cols-6 wide:grid-cols-[repeat(8,150px)] wide:justify-center"
    >
      {illustrations.map((illustration) => (
        <PackIconCell
          key={illustration.id}
          illustration={illustration}
          selectionMode={selectionMode}
          selected={selectedIds.has(illustration.id)}
          priority={priorityIds.has(illustration.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </section>
  );
}
