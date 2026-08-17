"use client";

import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { Navbar } from "@/components/Navbar/Navbar";
import { getCategoryHref } from "@/lib/seo/routes";
import type { FilterValue } from "@/types/illustration";

interface LegalPageShellProps {
  children: ReactNode;
}

export function LegalPageShell({ children }: LegalPageShellProps) {
  const router = useRouter();

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(getCategoryHref(filter));
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeFilter={null} onFilterChange={handleFilterChange} />
      <div className="pt-[70px] desktop:pt-[90px]">{children}</div>
    </div>
  );
}
