"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { MEDIA_QUERIES } from "@/lib/breakpoints";

export type NavDropdownId = "categories" | "packs" | "profile";

interface NavDropdownContextValue {
  activeDropdown: NavDropdownId | null;
  setActiveDropdown: (
    id:
      | NavDropdownId
      | null
      | ((current: NavDropdownId | null) => NavDropdownId | null)
  ) => void;
  toggleDropdown: (id: NavDropdownId) => void;
  regionRef: RefObject<HTMLDivElement | null>;
}

const NavDropdownContext = createContext<NavDropdownContextValue | null>(null);

export function NavDropdownProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeDropdown, setActiveDropdownState] = useState<NavDropdownId | null>(
    null
  );
  const regionRef = useRef<HTMLDivElement>(null);

  const setActiveDropdown = useCallback(
    (
      id:
        | NavDropdownId
        | null
        | ((current: NavDropdownId | null) => NavDropdownId | null)
    ) => {
      setActiveDropdownState(id);
    },
    []
  );

  const toggleDropdown = useCallback(
    (id: NavDropdownId) => {
      setActiveDropdown(activeDropdown === id ? null : id);
    },
    [activeDropdown, setActiveDropdown]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERIES.desktop);
    const resetOnMobile = () => {
      if (!mediaQuery.matches) {
        setActiveDropdown(null);
      }
    };

    resetOnMobile();
    mediaQuery.addEventListener("change", resetOnMobile);
    return () => mediaQuery.removeEventListener("change", resetOnMobile);
  }, [setActiveDropdown]);

  useEffect(() => {
    if (!activeDropdown) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && regionRef.current?.contains(target)) {
        return;
      }
      setActiveDropdown(null);
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDropdown, setActiveDropdown]);

  return (
    <NavDropdownContext.Provider
      value={{ activeDropdown, setActiveDropdown, toggleDropdown, regionRef }}
    >
      <div ref={regionRef} className="contents">
        {children}
      </div>
    </NavDropdownContext.Provider>
  );
}

export function useNavDropdown(): NavDropdownContextValue {
  const context = useContext(NavDropdownContext);
  if (!context) {
    throw new Error("useNavDropdown must be used within NavDropdownProvider");
  }
  return context;
}
