"use client";

import { useLayoutEffect } from "react";

import { ensureFreshAuthStorage } from "@/lib/authStorageReset";

/** Runs before other providers so stale auth/premium state cannot restore old accounts. */
export function AuthStorageReset() {
  useLayoutEffect(() => {
    ensureFreshAuthStorage();
  }, []);

  return null;
}
