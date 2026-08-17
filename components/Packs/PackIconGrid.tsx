"use client";

import { memo, useMemo } from "react";

import { PackIconImage } from "@/components/Packs/PackIconImage";
import { CheckIcon } from "@/components/icons/ActionIcons";
import { usePackIconColumnCount } from "@/hooks/usePackIconColumnCount";
import type { Illustration } from "@/types/illustration";

interface PackIconCellProps {
  illustration: Illustration;
  selectionMode: boolean;
  selected: boolean;
  priority: boolean;
  onToggleSelect: (id: string) => void;
}

/** Figma 40004972:9454 — selection badge (empty vs checked). */
function SelectionBadge({ checked }: { checked: boolean }) {
  return (
    <div
      className="absolute bottom-[10px] right-[10px] flex size-9 items-center justify-center rounded-[6px] shadow-[0px_8px_8px_-4px_rgba(10,13,18,0.03),0px_20px_12px_rgba(10,13,18,0.08)]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(99,99,99,0.2) 100%), linear-gradient(90deg, #000 0%, #000 100%)",
      }}
      aria-hidden
    >
      <span
        className={[
          "flex size-6 items-center justify-center rounded-[6px] border border-solid",
          checked
            ? "border-white bg-white"
            : "border-[#D4D4D4] bg-transparent",
        ].join(" ")}
      >
        {checked ? <CheckIcon className="size-3.5 text-black" /> : null}
      </span>
    </div>
  );
}

/** Figma 40004941:48483 — 150px pack icon tile with optional selection. */
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
        "relative aspect-square w-full max-w-[150px] overflow-hidden bg-[#FAFAFA] wide:size-[150px] wide:max-w-none",
        selectionMode ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <PackIconImage
        src={illustration.src}
        alt={illustration.alt}
        priority={priority}
      />
      {selectionMode ? (
        <>
          {selected ? (
            <div className="absolute inset-0 bg-black/10" aria-hidden />
          ) : null}
          <SelectionBadge checked={selected} />
        </>
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
