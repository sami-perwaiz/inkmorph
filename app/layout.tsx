import type { Metadata, Viewport } from "next";
import { Inter, Lora, Poppins } from "next/font/google";

import { Analytics } from "@/components/Analytics/Analytics";
import { AppProviders } from "@/components/AppProviders/AppProviders";
import { MicrosoftClarity } from "@/components/Analytics/MicrosoftClarity";
import { resolveSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lora",
  display: "swap",
  preload: false,
});

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InkMorph — Premium 3D Icons, Illustrations & Wallpapers",
    template: "%s · InkMorph",
  },
  description:
    "Discover premium 3D icons, illustrations, wallpapers and creative assets for modern digital products, websites and designs.",
  applicationName: "InkMorph",
  authors: [{ name: "InkMorph" }],
  keywords: [
    "3D icons",
    "3D icon packs",
    "premium 3D icons",
    "3D illustrations",
    "3D assets",
    "3D avatars",
    "3D wallpapers",
    "creative assets",
    "design assets",
    "InkMorph",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "InkMorph",
    title: "InkMorph — Premium 3D Icons, Illustrations & Wallpapers",
    description:
      "Discover premium 3D icons, illustrations, wallpapers and creative assets for modern digital products, websites and designs.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "InkMorph logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InkMorph — Premium 3D Icons, Illustrations & Wallpapers",
    description:
      "Discover premium 3D icons, illustrations, wallpapers and creative assets for modern digital products, websites and designs.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${lora.variable} bg-white font-poppins antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
        <Analytics />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
