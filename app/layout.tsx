import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InkMorph — Illustration Gallery",
    template: "%s · InkMorph",
  },
  description:
    "Browse and download premium 3D avatar and black & white illustrations from InkMorph.",
  applicationName: "InkMorph",
  authors: [{ name: "InkMorph" }],
  keywords: [
    "InkMorph",
    "illustration gallery",
    "3D avatars",
    "black and white illustrations",
    "download PNG",
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
    title: "InkMorph — Illustration Gallery",
    description:
      "Browse and download premium 3D avatar and black & white illustrations from InkMorph.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "InkMorph",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "InkMorph — Illustration Gallery",
    description:
      "Browse and download premium 3D avatar and black & white illustrations from InkMorph.",
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
        className={`${poppins.variable} ${inter.variable} bg-white font-poppins antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
