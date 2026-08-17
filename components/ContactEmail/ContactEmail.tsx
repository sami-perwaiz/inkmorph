"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { INKMORPH_CONTACT_EMAIL } from "@/lib/contactEmail";

const COPY_RESET_MS = 2000;

function TablerCopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />
      <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
    </svg>
  );
}

function TablerCheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}

export function ContactEmail() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INKMORPH_CONTACT_EMAIL);
      setCopied(true);

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, COPY_RESET_MS);
    } catch {
      // Clipboard unavailable — mailto link remains available.
    }
  }, []);

  return (
    <span className="legal-page__email-row">
      <a
        href={`mailto:${INKMORPH_CONTACT_EMAIL}`}
        className="legal-page__email-link"
      >
        {INKMORPH_CONTACT_EMAIL}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Email copied" : "Copy email address"}
        className="legal-page__copy-btn"
      >
        <span className="legal-page__copy-stage" aria-hidden>
          <span
            className={[
              "legal-page__copy-icon",
              copied ? "is-exit" : "is-enter",
            ].join(" ")}
          >
            <TablerCopyIcon />
          </span>
          <span
            className={[
              "legal-page__copy-icon",
              copied ? "is-enter" : "is-exit",
            ].join(" ")}
          >
            <TablerCheckIcon />
          </span>
        </span>
      </button>
    </span>
  );
}
