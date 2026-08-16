"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { usePrefersHover } from "@/hooks/usePrefersHover";
import {
  useNavDropdown,
  type NavDropdownId,
} from "@/components/Navbar/NavDropdownContext";
import { MENU } from "@/lib/navTokens";

interface UseNavDropdownHoverOptions {
  id: NavDropdownId;
}

/** Desktop hover vs click/tap open for Categories and Packs nav dropdowns. */
export function useNavDropdownHover({ id }: UseNavDropdownHoverOptions) {
  const prefersHover = usePrefersHover();
  const { activeDropdown, setActiveDropdown, toggleDropdown } = useNavDropdown();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = activeDropdown === id;
  const useHover = prefersHover === true;

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const openDropdown = useCallback(() => {
    clearCloseTimer();
    setActiveDropdown(id);
  }, [clearCloseTimer, id, setActiveDropdown]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown((current) => (current === id ? null : current));
    }, MENU.dropdownHoverCloseDelay);
  }, [clearCloseTimer, id, setActiveDropdown]);

  const handleTriggerClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (useHover) {
        event.preventDefault();
        return;
      }

      toggleDropdown(id);
    },
    [id, toggleDropdown, useHover]
  );

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        openDropdown();
      }
    },
    [openDropdown]
  );

  const hoverContainerProps = useHover
    ? {
        onMouseEnter: openDropdown,
        onMouseLeave: scheduleClose,
      }
    : {};

  const hoverPanelProps = useHover
    ? {
        onMouseEnter: openDropdown,
        onMouseLeave: scheduleClose,
      }
    : {};

  return {
    open,
    useHover,
    openDropdown,
    setActiveDropdown,
    handleTriggerClick,
    handleTriggerKeyDown,
    hoverContainerProps,
    hoverPanelProps,
  };
}
