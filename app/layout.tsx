import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";

const psJakarta = Plus_Jakarta_Sans({
  variable: "--font-ps-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AVELORA — Digital Invitation & Event Platform",
    template: "%s · AVELORA",
  },
  description:
    "Create beautifully. Invite effortlessly. Celebrate together. AVELORA adalah platform undangan digital & event experience premium untuk pernikahan, aqiqah, dan perayaan lainnya.",
  keywords: [
    "undangan digital",
    "undangan pernikahan online",
    "digital invitation",
    "event platform",
    "undangan aqiqah",
    "undangan ulang tahun online",
  ],
  openGraph: {
    title: "AVELORA — Digital Invitation & Event Platform",
    description:
      "Create beautifully. Invite effortlessly. Celebrate together.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${psJakarta.variable} ${playfair.variable} ${greatVibes.variable} antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}