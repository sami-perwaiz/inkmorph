import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you are looking for doesn't exist or has been moved.",
  robots: {
    index: false,
    follow: false,
  },
};

/** Figma 40003783:10968 — Page not found */
const NOT_FOUND = {
  contentWidth: 434,
  stackGap: 24,
  textGap: 16,
  headingSize: 96,
  headingTracking: -0.96,
  bodySize: 16,
  bodyLineHeight: 26,
  bodyColor: "#2E2E2E",
  buttonWidth: 138,
  buttonRadius: 8,
  buttonPadXLeft: 20,
  buttonPadXRight: 24,
  buttonPadY: 16,
  buttonFontSize: 14,
  buttonLineHeight: 16,
  buttonTracking: -0.28,
} as const;

export default function NotFound() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 tablet:px-8"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #FAFFFE 0%, #FAFCFF 50%, #FCFAFF 100%)",
        backgroundColor: "#F6F6F6",
      }}
    >
      <div
        className="relative z-10 flex w-full flex-col items-center justify-center"
        style={{
          maxWidth: NOT_FOUND.contentWidth,
          gap: NOT_FOUND.stackGap,
        }}
      >
        <div
          className="flex w-full flex-col items-center justify-center text-center"
          style={{ gap: NOT_FOUND.textGap }}
        >
          <p
            className="font-inter font-medium whitespace-nowrap"
            style={{
              fontSize: `clamp(4rem, 18vw, ${NOT_FOUND.headingSize}px)`,
              letterSpacing: `${NOT_FOUND.headingTracking}px`,
              lineHeight: "normal",
              backgroundImage:
                "linear-gradient(90deg, #000000 0%, #666666 50%, #000000 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            404
          </p>

          <p
            className="w-full max-w-full break-words font-inter font-normal"
            style={{
              fontSize: NOT_FOUND.bodySize,
              lineHeight: `${NOT_FOUND.bodyLineHeight}px`,
              color: NOT_FOUND.bodyColor,
            }}
          >
            The page you are looking for doesn&apos;t exist or has been moved,
            but don&apos;t worry, we&apos;ll get you back on track!
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex shrink-0 items-center justify-center bg-black font-inter font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
          style={{
            width: NOT_FOUND.buttonWidth,
            paddingTop: NOT_FOUND.buttonPadY,
            paddingBottom: NOT_FOUND.buttonPadY,
            paddingLeft: NOT_FOUND.buttonPadXLeft,
            paddingRight: NOT_FOUND.buttonPadXRight,
            borderRadius: NOT_FOUND.buttonRadius,
            fontSize: NOT_FOUND.buttonFontSize,
            lineHeight: `${NOT_FOUND.buttonLineHeight}px`,
            letterSpacing: `${NOT_FOUND.buttonTracking}px`,
          }}
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
