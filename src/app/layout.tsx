import type { Metadata } from "next";
import { Nohemi, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const nohemi = Nohemi({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WEN — Fresh Farm Produce, Direct From Trusted Farmers",
  description:
    "WEN connects farmers directly to buyers to ensure fresh produce, fair pricing, and faster delivery across communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nohemi.variable} ${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-grain text-soil">{children}</body>
    </html>
  );
}

