import type { Metadata } from "next";
import localFont from "next/font/local";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const nohemi = localFont({
  src: [
    { path: "../../public/fonts/nohemi/Nohemi-Regular-BF6438cc579d934.woff", weight: "400", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-Medium-BF6438cc57ddecd.woff",  weight: "500", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-SemiBold-BF6438cc57db2ff.woff",weight: "600", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-Bold-BF6438cc577b524.woff",    weight: "700", style: "normal" },
    { path: "../../public/fonts/nohemi/Nohemi-ExtraBold-BF6438cc5761ae2.woff",weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
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
