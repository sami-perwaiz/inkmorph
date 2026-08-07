/** Shared tokens for Figma auth screens (Sign Up 40004799:9080, Log In 40004799:8512). */
export const AUTH_SCREEN = {
  logoSize: 42,
  logoRadius: 6,
  logoInset: 32,
  brandPadding: 32,
  brandContentWidth: 404,
  brandStackGap: 16,
  trustPillGap: 8,
  trustPillRadius: 999,
  trustPillPadY: 6,
  trustPillPadLeft: 6,
  trustPillPadRight: 10,
  avatarSize: 24,
  avatarOverlap: 8,
  avatarColors: ["#FFFFDB", "#DBFFDC", "#FFDBFB", "#DBFBFF"] as const,
  formWidth: 408,
  formStackGap: 32,
  formHeaderGap: 2,
  formBodyGap: 20,
  socialButtonHeight: 44,
  socialButtonRadius: 8,
  socialButtonBorder: "#E8E8E8",
  socialButtonText: "#414651",
  linkColor: "#057AF0",
  muted: "#A3A3A3",
  caption: "#737373",
  heading: "#202020",
  heroBg: "/signup/hero-bg.png",
} as const;

export const AUTH_AVATARS = [
  { src: "/signup/avatar-1.png", bg: AUTH_SCREEN.avatarColors[0] },
  { src: "/signup/avatar-2.png", bg: AUTH_SCREEN.avatarColors[1] },
  { src: "/signup/avatar-3.png", bg: AUTH_SCREEN.avatarColors[2] },
  { src: "/signup/avatar-4.png", bg: AUTH_SCREEN.avatarColors[3] },
] as const;

export interface AuthScreenCopy {
  brandTitle: string;
  brandDescription: string;
  formTitle: string;
  formDescription: string;
  footerPrompt: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  /** Where to send the user after a successful auth action. */
  afterAuthHref?: string;
}
