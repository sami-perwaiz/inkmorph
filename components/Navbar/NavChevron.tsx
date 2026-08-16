import Image from "next/image";

import { getMenuChevronClassName } from "@/lib/navTokens";

export function NavChevron({ expanded }: { expanded: boolean }) {
  return (
    <Image
      src="/icons/chevron-down.svg"
      alt=""
      width={16}
      height={16}
      className={getMenuChevronClassName(expanded)}
      aria-hidden
    />
  );
}
