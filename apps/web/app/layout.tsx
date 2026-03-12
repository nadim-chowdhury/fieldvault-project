import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FieldVault — Asset Intelligence for Construction Teams",
    template: "%s | FieldVault",
  },
  description:
    "Audit-ready asset management for small construction firms. Track equipment, manage maintenance, and generate compliance reports.",
  keywords: [
    "asset management",
    "construction",
    "equipment tracking",
    "QR code",
    "maintenance",
    "audit",
    "compliance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
